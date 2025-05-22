'use client';
import { useState, useEffect, FormEvent } from "react";
import { getDocuments, getDocument, addDocument, updateDocument, deleteDocument, uploadFile } from "@/lib/firebase/firebaseUtils";
import { useAuth } from "@/lib/hooks/useAuth";
import { getRedirectResult, getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import initializeBlogPosts from "@/scripts/initializeBlogPosts";
import initializeResources from "@/scripts/initializeResources";
import RichTextEditor from "./RichTextEditor";
import ContactInfoManager from "./ContactInfoManager";

const BLOG_COLLECTION = "blogs";
const CONTENT_COLLECTION = "pageContent";
const RESOURCES_COLLECTION = "resources";
const SITE_SETTINGS_COLLECTION = "siteSettings";

// We'll only use categories from existing blog posts

interface BlogPost {
  id?: string;
  title: string;
  desc: string;
  content?: string; // Rich text content for full article
  category: string;
  date: string;
  img: string | File | null;
}

interface PageContent {
  id: string;
  pageName: string;
  content: any; // Using any for flexibility with different content structures
}

interface Resource {
  id?: string;
  category: string;
  categoryLabel: string;
  title: string;
  description: string;
  imageUrl: string | File | null;
  link: string;
}

interface SiteSettings {
  id: string;
  imageUrl: string | File | null;
  linkUrl: string;
}

interface NewContentForm {
  pageName: string;
  content: any;
  customPageName?: string;
}

type PageTemplateKey = 'home' | 'resources' | 'contact';

const ADMIN_EMAILS = [
  "Kenneth.j1698@gmail.com",
  "jpotts2@mail.bradley.edu"
];

// New page content templates for different pages
const DEFAULT_PAGE_TEMPLATES: Record<PageTemplateKey, any> = {
  home: {
    pageName: "home",
    sections: {
      hero: {
        title: "Motion Wealth Group",
        subtitle: "Building wealth through strategic investment insights",
        buttonText: "Learn More"
      },
      about: {
        title: "About Motion Wealth Group",
        content: "Motion Wealth Group helps people learn about trading and investing. We give clear information so you can make better financial decisions.",
        values: [
          "Clear and honest advice",
          "Always learning new things",
          "Respecting your comfort with risk",
          "Building wealth that lasts"
        ]
      },
      cta: {
        title: "Ready to Accelerate Your Trading Journey?",
        content: "Connect with Motion Wealth Group for personalized insights and resources to help you achieve your financial goals."
      }
    }
  },
  resources: {
    pageName: "resources",
    sections: {
      hero: {
        title: "Trading Resources",
        subtitle: "Educational tools and resources to help you succeed in your trading journey."
      },
      resources: [
        {
          title: "Beginner's Guide to Trading",
          description: "Learn the basics of trading, including terminology, strategies, and risk management.",
          icon: "book"
        },
        {
          title: "Advanced Technical Analysis",
          description: "Deep dive into technical indicators, chart patterns, and analysis techniques.",
          icon: "chart-line"
        },
        {
          title: "Risk Management Tools",
          description: "Tools and strategies to protect your capital and maximize returns.",
          icon: "shield"
        }
      ]
    }
  },
  contact: {
    pageName: "contact",
    sections: {
      hero: {
        title: "Get in Touch",
        subtitle: "Have questions or need personalized advice? Reach out to our team."
      },
      contactInfo: {
        email: "contact@motionwealthgroup.com",
        phone: "(555) 123-4567",
        address: "123 Trading St, Market City, MC 12345",
        hours: "Monday-Friday: 9am-5pm EST"
      },
      formTitle: "Send us a message"
    }
  }
};

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<"blog" | "content" | "resources" | "contact" | "settings">("blog");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [content, setContent] = useState<PageContent[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [form, setForm] = useState<BlogPost>({ title: "", desc: "", content: "", category: "", date: "", img: null });
  const [resourceForm, setResourceForm] = useState<Resource>({ 
    category: "", 
    categoryLabel: "", 
    title: "", 
    description: "", 
    imageUrl: null, 
    link: "" 
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [resourceEditId, setResourceEditId] = useState<string | null>(null);
  const [contentEdit, setContentEdit] = useState<Record<string, Partial<PageContent>>>({});
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showNewContentForm, setShowNewContentForm] = useState(false);
  const [newContent, setNewContent] = useState<NewContentForm>({pageName: "", content: ""});
  const [isInitializingBlogPosts, setIsInitializingBlogPosts] = useState(false);
  const [isInitializingResources, setIsInitializingResources] = useState(false);
  const [footerLogo, setFooterLogo] = useState<SiteSettings>({
    id: "footerLogo",
    imageUrl: null,
    linkUrl: ""
  });
  const [footerLogoLoading, setFooterLogoLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("AdminDashboard mounted, current tab:", tab);
    
    // Clear any previous errors
    setDataError(null);
    
    if (tab === "blog") {
      fetchPosts();
    } else if (tab === "content") {
      fetchContent();
    } else if (tab === "resources") {
      fetchResources();
    } else if (tab === "settings") {
      fetchSiteSettings();
    }
  }, [tab]);

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const authInstance = getAuth();
        const result = await getRedirectResult(authInstance);
        if (result?.user) {
          if (result.user.email && ADMIN_EMAILS.includes(result.user.email)) {
            router.push("/admin");
          }
        }
      } catch (error) {
        console.error("Error handling redirect:", error);
      }
    };

    handleRedirectResult();
  }, [router]);

  const fetchPosts = async () => {
    setDataLoading(true);
    setDataError(null);
    
    console.log("Fetching blog posts...");
    try {
      const docs = await getDocuments(BLOG_COLLECTION);
      console.log("Blog posts fetched:", docs.length);
      
      const typedDocs: BlogPost[] = docs.map((doc: any) => ({
        id: doc.id,
        title: doc.title || "",
        desc: doc.desc || "",
        content: doc.content || "",
        category: doc.category || "",
        date: doc.date || "",
        img: doc.img || null,
      }));
      setPosts(typedDocs);
      
      // Extract unique categories from existing posts only
      const uniqueCategories = Array.from(
        new Set(typedDocs.filter(post => post.category).map(post => post.category))
      ) as string[];
      
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setDataError("Failed to fetch blog posts. Please try refreshing the page.");
      setActionError("Failed to fetch blog posts");
    } finally {
      setDataLoading(false);
    }
  };

  const fetchContent = async () => {
    setDataLoading(true);
    setDataError(null);
    
    console.log("Fetching page content...");
    try {
      const docs = await getDocuments(CONTENT_COLLECTION);
      console.log("Page content fetched:", docs.length);
      
      // Check if we have content for all pages
      const pageNames: PageTemplateKey[] = ["home", "resources", "contact"];
      const existingPages = new Set(docs.map((doc: any) => doc.pageName));
      
      // Initialize default content for missing pages
      for (const pageName of pageNames) {
        if (!existingPages.has(pageName)) {
          await addDocument(CONTENT_COLLECTION, DEFAULT_PAGE_TEMPLATES[pageName]);
        }
      }
      
      // Fetch again to get all content including newly added defaults
      const updatedDocs = await getDocuments(CONTENT_COLLECTION);
      setContent(updatedDocs as PageContent[]);
    } catch (error) {
      console.error("Error fetching content:", error);
      setDataError("Failed to fetch page content. Please try refreshing the page.");
      setActionError("Failed to fetch page content");
    } finally {
      setDataLoading(false);
    }
  };

  const fetchResources = async () => {
    setDataLoading(true);
    setDataError(null);
    
    console.log("Fetching resources...");
    try {
      const docs = await getDocuments(RESOURCES_COLLECTION);
      console.log("Resources fetched:", docs.length);
      
      const typedDocs: Resource[] = docs.map((doc: any) => ({
        id: doc.id,
        category: doc.category || "",
        categoryLabel: doc.categoryLabel || "",
        title: doc.title || "",
        description: doc.description || "",
        imageUrl: doc.imageUrl || null,
        link: doc.link || ""
      }));
      setResources(typedDocs);
    } catch (error) {
      console.error("Error fetching resources:", error);
      setDataError("Failed to fetch resources. Please try refreshing the page.");
      setActionError("Failed to fetch resources");
    } finally {
      setDataLoading(false);
    }
  };

  const fetchSiteSettings = async () => {
    setFooterLogoLoading(true);
    setDataError(null);
    
    console.log("Fetching site settings...");
    try {
      // Use the existing getDocument function from firebaseUtils
      const data = await getDocument(SITE_SETTINGS_COLLECTION, "footerLogo") as SiteSettings | null;
      if (data) {
        setFooterLogo({
          id: "footerLogo",
          imageUrl: data.imageUrl || null,
          linkUrl: data.linkUrl || ""
        });
      }
    } catch (error) {
      console.error("Error fetching site settings:", error);
      setDataError("Failed to load site settings. Please try refreshing the page.");
      setActionError("Failed to load site settings");
    } finally {
      setFooterLogoLoading(false);
    }
  };

  const handleBlogSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDataLoading(true);
    setActionSuccess(null);
    setActionError(null);
    
    // Safety timeout to prevent indefinite loading state
    const safetyTimeout = setTimeout(() => {
      if (dataLoading) {
        setDataLoading(false);
        setActionError("Operation timed out. Please try again.");
      }
    }, 10000); // 10 seconds timeout
    
    try {
      // Validate form data
      if (!form.title || !form.category || !form.date) {
        setActionError("Please fill in all required fields");
        setDataLoading(false);
        return;
      }
      
      let imgUrl = form.img;
      
      // Handle image upload - but don't block post creation if it fails
      if (form.img && typeof form.img !== "string") {
        try {
          console.log("Attempting to upload image:", form.img.name);
          imgUrl = await uploadFile(form.img as File, `blogImages/${(form.img as File).name}`);
          console.log("Image upload result:", imgUrl);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          // Instead of stopping the form submission, just use null for the image and continue
          console.log("Using null for image URL and continuing with post creation");
          imgUrl = null;
          // Don't return - we'll continue with post creation without the image
        }
      }
      
      const blogData = {
        title: form.title,
        desc: form.desc,
        content: form.content || "",
        category: form.category,
        date: form.date,
        img: imgUrl
      };
      
      if (editId) {
        await updateDocument(BLOG_COLLECTION, editId, blogData);
        setActionSuccess("Blog post updated successfully!");
      } else {
        await addDocument(BLOG_COLLECTION, blogData);
        
        const imageStatus = form.img && imgUrl === null 
          ? " (Note: Image upload failed, but post was created successfully)" 
          : "";
          
        setActionSuccess(`New blog post created successfully!${imageStatus}`);
        
        // Add the new category to our list if it's not already there
        if (!categories.includes(form.category)) {
          setCategories([...categories, form.category]);
        }
      }
      
      // Clear form and refresh data
      setTimeout(() => {
        setForm({ title: "", desc: "", content: "", category: "", date: "", img: null });
        setEditId(null);
        fetchPosts();
      }, 500); // Small delay to ensure Firebase operations complete
    } catch (error) {
      console.error("Error saving blog post:", error);
      setActionError(`Failed to save blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      clearTimeout(safetyTimeout);
      setDataLoading(false);
    }
  };

  const handleResourceSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDataLoading(true);
    setActionSuccess(null);
    setActionError(null);
    
    try {
      let imgUrl = resourceForm.imageUrl;
      if (resourceForm.imageUrl && typeof resourceForm.imageUrl !== "string") {
        imgUrl = await uploadFile(resourceForm.imageUrl as File, `resourceImages/${(resourceForm.imageUrl as File).name}`);
      }
      
      if (resourceEditId) {
        await updateDocument(RESOURCES_COLLECTION, resourceEditId, { ...resourceForm, imageUrl: imgUrl });
        setActionSuccess("Resource updated successfully!");
      } else {
        await addDocument(RESOURCES_COLLECTION, { ...resourceForm, imageUrl: imgUrl });
        setActionSuccess("New resource created successfully!");
      }
      
      setResourceForm({ 
        category: "", 
        categoryLabel: "", 
        title: "", 
        description: "", 
        imageUrl: null, 
        link: "" 
      });
      setResourceEditId(null);
      fetchResources();
    } catch (error) {
      console.error("Error saving resource:", error);
      setActionError("Failed to save resource");
    } finally {
      setDataLoading(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setForm(post);
    setEditId(post.id || null);
    
    // Scroll to form
    const formElement = document.getElementById('blog-form');
    formElement?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResourceEdit = (resource: Resource) => {
    setResourceForm(resource);
    setResourceEditId(resource.id || null);
    
    // Scroll to form
    const formElement = document.getElementById('resource-form');
    formElement?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    setDataLoading(true);
    setActionSuccess(null);
    setActionError(null);
    
    try {
      await deleteDocument(BLOG_COLLECTION, id);
      setActionSuccess("Blog post deleted successfully!");
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      setActionError("Failed to delete blog post");
    } finally {
      setDataLoading(false);
    }
  };

  const handleResourceDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    
    setDataLoading(true);
    setActionSuccess(null);
    setActionError(null);
    
    try {
      await deleteDocument(RESOURCES_COLLECTION, id);
      setActionSuccess("Resource deleted successfully!");
      fetchResources();
    } catch (error) {
      console.error("Error deleting resource:", error);
      setActionError("Failed to delete resource");
    } finally {
      setDataLoading(false);
    }
  };

  const handleContentEdit = (id: string, field: keyof PageContent, value: string) => {
    setContentEdit((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleContentSave = async (id: string) => {
    setDataLoading(true);
    setActionSuccess(null);
    setActionError(null);
    
    try {
      await updateDocument(CONTENT_COLLECTION, id, contentEdit[id]);
      setActionSuccess("Page content updated successfully!");
      fetchContent();
    } catch (error) {
      console.error("Error updating content:", error);
      setActionError("Failed to update page content");
    } finally {
      setDataLoading(false);
    }
  };
  
  const handleAddNewContent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDataLoading(true);
    setActionSuccess(null);
    setActionError(null);
    
    try {
      await addDocument(CONTENT_COLLECTION, newContent);
      setActionSuccess("New page content added successfully!");
      setNewContent({pageName: "", content: ""});
      setShowNewContentForm(false);
      fetchContent();
    } catch (error) {
      console.error("Error adding new content:", error);
      setActionError("Failed to add new page content");
    } finally {
      setDataLoading(false);
    }
  };
  
  const handleDeleteContent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content section?")) return;
    
    setDataLoading(true);
    setActionSuccess(null);
    setActionError(null);
    
    try {
      await deleteDocument(CONTENT_COLLECTION, id);
      setActionSuccess("Content deleted successfully!");
      fetchContent();
    } catch (error) {
      console.error("Error deleting content:", error);
      setActionError("Failed to delete content");
    } finally {
      setDataLoading(false);
    }
  };

  const handleInitializeBlogPosts = async () => {
    if (!confirm("This will add sample blog posts to your database. Are you sure you want to continue?")) return;
    
    setIsInitializingBlogPosts(true);
    setActionSuccess(null);
    setActionError(null);
    
    try {
      await initializeBlogPosts();
      setActionSuccess("Sample blog posts have been added successfully!");
      await fetchPosts(); // Refresh posts and categories
    } catch (error) {
      console.error("Error initializing blog posts:", error);
      setActionError("Failed to initialize blog posts");
    } finally {
      setIsInitializingBlogPosts(false);
    }
  };

  const handleInitializeResources = async () => {
    if (!confirm("This will add sample resources to your database. Are you sure you want to continue?")) return;
    
    setIsInitializingResources(true);
    setActionSuccess(null);
    setActionError(null);
    
    try {
      await initializeResources();
      setActionSuccess("Sample resources have been added successfully!");
      fetchResources();
    } catch (error) {
      console.error("Error initializing resources:", error);
      setActionError("Failed to initialize resources");
    } finally {
      setIsInitializingResources(false);
    }
  };

  const handleFooterLogoSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFooterLogoLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      let logoUrl = footerLogo.imageUrl;
      
      if (footerLogo.imageUrl instanceof File) {
        // Upload the new image
        logoUrl = await uploadFile(footerLogo.imageUrl, `site-settings/${footerLogo.imageUrl.name}`);
      }
      
      const logoData = {
        imageUrl: logoUrl,
        linkUrl: footerLogo.linkUrl
      };
      
      // Check if document exists
      const existingDoc = await getDocument(SITE_SETTINGS_COLLECTION, "footerLogo") as SiteSettings | null;
      
      if (existingDoc) {
        await updateDocument(SITE_SETTINGS_COLLECTION, "footerLogo", logoData);
      } else {
        await addDocument(SITE_SETTINGS_COLLECTION, { ...logoData, id: "footerLogo" });
      }
      
      setFooterLogo({
        ...footerLogo,
        imageUrl: logoUrl as string
      });
      
      setActionSuccess("Footer logo updated successfully");
    } catch (error) {
      console.error("Error updating footer logo:", error);
      setActionError("Failed to update footer logo");
    } finally {
      setFooterLogoLoading(false);
    }
  };
  
  const handleLogoImageChange = (file: File | null) => {
    setFooterLogo({
      ...footerLogo,
      imageUrl: file
    });
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <div className="p-8 text-center">Please sign in as admin to access the dashboard.</div>;
  if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
    return <div className="p-8 text-center text-red-600">You do not have admin access.</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {dataError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p className="font-bold">Error</p>
          <p>{dataError}</p>
          <button 
            onClick={() => {
              setDataError(null);
              if (tab === "blog") fetchPosts();
              else if (tab === "content") fetchContent();
              else if (tab === "resources") fetchResources();
              else if (tab === "settings") fetchSiteSettings();
            }}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="flex mb-6 border-b">
        <button
          className={`py-2 px-4 ${tab === "blog" ? "border-b-2 border-mwg-accent text-mwg-accent" : "text-gray-600"}`}
          onClick={() => setTab("blog")}
        >
          Blog Posts
        </button>
        <button
          className={`py-2 px-4 ${tab === "content" ? "border-b-2 border-mwg-accent text-mwg-accent" : "text-gray-600"}`}
          onClick={() => setTab("content")}
        >
          Page Content
        </button>
        <button
          className={`py-2 px-4 ${tab === "resources" ? "border-b-2 border-mwg-accent text-mwg-accent" : "text-gray-600"}`}
          onClick={() => setTab("resources")}
        >
          Resources
        </button>
        <button
          className={`py-2 px-4 ${tab === "settings" ? "border-b-2 border-mwg-accent text-mwg-accent" : "text-gray-600"}`}
          onClick={() => setTab("settings")}
        >
          Site Settings
        </button>
      </div>

      {/* Show loading state */}
      {dataLoading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mwg-accent"></div>
        </div>
      )}

      {/* Rest of the component rendering based on tab... */}
    </div>
  );
} 