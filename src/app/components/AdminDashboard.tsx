'use client';
import { useState, useEffect, FormEvent } from "react";
import { getDocuments, getDocument, addDocument, updateDocument, deleteDocument, uploadFile } from "@/lib/firebase/firebaseUtils";
import { useAuth } from "@/lib/hooks/useAuth";
import { getRedirectResult, getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import initializeBlogPosts from "@/scripts/initializeBlogPosts";
import initializeResources from "@/scripts/initializeResources";
import ensureResources from "@/scripts/ensureResources";
import RichTextEditor from "./RichTextEditor";
import ContactInfoManager from "./ContactInfoManager";
import AboutPageEditor from "./AboutPageEditor";
import HomePageEditor from "./HomePageEditor";

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

type PageTemplateKey = 'home' | 'resources' | 'contact' | 'about';

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
  about: {
    pageName: "about",
    title: "Our Story",
    subtitle: "Get to know the people behind Motion Wealth Group",
    content: `
      <h2>Welcome to Motion Wealth Group</h2>
      <p>This is where you can share your personal story, background, and what drives your passion for helping others succeed in trading and investing.</p>
      
      <h3>Our Mission</h3>
      <p>Add your personal mission statement and what makes your approach unique.</p>
      
      <h3>Our Journey</h3>
      <p>Share your journey, experiences, and what led you to create Motion Wealth Group.</p>
      
      <h3>Why We're Different</h3>
      <p>Explain what sets you apart from other trading educators and financial advisors.</p>
    `
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
  const [tab, setTab] = useState<"blog" | "resources" | "pages" | "settings">("blog");
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
    } else if (tab === "resources") {
      fetchResources();
    } else if (tab === "pages") {
      fetchPageContent();
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
          if (result.user.email && ADMIN_EMAILS.some(email => email.toLowerCase() === result.user.email?.toLowerCase())) {
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

  const fetchResources = async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      console.log("Fetching resources...");
      const resourcesData = await getDocuments(RESOURCES_COLLECTION);
      console.log("Resources fetched:", resourcesData);
      setResources(resourcesData || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
      setDataError("Failed to load resources. Please try again.");
    } finally {
      setDataLoading(false);
    }
  };

  const fetchPageContent = async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      console.log("Fetching page content...");
      const contentData = await getDocuments(CONTENT_COLLECTION);
      console.log("Page content fetched:", contentData);
      setContent(contentData || []);
    } catch (error) {
      console.error("Error fetching page content:", error);
      setDataError("Failed to load page content. Please try again.");
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

  if (loading) return <div className="p-8 text-center">Loading dashboard content...</div>;
  if (!user) return <div className="p-8 text-center">Please sign in as admin to access the dashboard.</div>;
  
  // DIRECTLY CHECK ADMIN STATUS WITHOUT API CALLS
  if (!user.email || !ADMIN_EMAILS.some(email => email.toLowerCase() === user.email?.toLowerCase())) {
    console.log("AdminDashboard - Access denied for non-admin:", user.email);
    return <div className="p-8 text-center text-red-600">You do not have admin access.</div>;
  }
  
  // Force admin access if they have a valid email
  console.log("AdminDashboard - Admin access granted to:", user.email);

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
          className={`py-2 px-4 ${tab === "resources" ? "border-b-2 border-mwg-accent text-mwg-accent" : "text-gray-600"}`}
          onClick={() => setTab("resources")}
        >
          Resources
        </button>
        <button
          className={`py-2 px-4 ${tab === "pages" ? "border-b-2 border-mwg-accent text-mwg-accent" : "text-gray-600"}`}
          onClick={() => setTab("pages")}
        >
          Pages
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

      {/* Blog tab */}
      {tab === "blog" && !dataLoading && (
        <div>
          {actionSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
              <p>{actionSuccess}</p>
            </div>
          )}
          
          {actionError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
              <p>{actionError}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{editId ? "Edit Blog Post" : "Add New Blog Post"}</h2>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              onClick={handleInitializeBlogPosts}
              disabled={isInitializingBlogPosts}
            >
              {isInitializingBlogPosts ? "Adding..." : "Add Sample Posts"}
            </button>
          </div>
          
          {/* Blog Form */}
          <form onSubmit={handleBlogSubmit} id="blog-form" className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Title *</label>
              <input
                type="text"
                id="title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="desc" className="block text-gray-700 font-medium mb-2">Short Description *</label>
              <textarea
                id="desc"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent text-black"
                style={{ color: 'black' }}
                rows={3}
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="content" className="block text-gray-700 font-medium mb-2">Full Content *</label>
              {RichTextEditor && (
                <RichTextEditor 
                  value={form.content || ''}
                  onChange={(content) => setForm({ ...form, content })}
                />
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="category" className="block text-gray-700 font-medium mb-2">Category *</label>
                <div className="flex items-center gap-2">
                  <select
                    id="category"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="new">+ Add New Category</option>
                  </select>
                  {form.category === "new" && (
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
                      placeholder="New Category"
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    />
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="date" className="block text-gray-700 font-medium mb-2">Date *</label>
                <input
                  type="date"
                  id="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Featured Image</label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="blog-image"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setForm({ ...form, img: file });
                  }}
                />
                <label
                  htmlFor="blog-image"
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                >
                  Choose File
                </label>
                <span className="text-gray-500 text-sm">
                  {form.img instanceof File
                    ? form.img.name
                    : form.img
                    ? "Current image will be kept"
                    : "No file chosen"}
                </span>
              </div>
            </div>
            
            <div className="flex justify-end">
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setForm({ title: "", desc: "", content: "", category: "", date: "", img: null });
                    setEditId(null);
                  }}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-mwg-accent text-white rounded hover:bg-mwg-accent/80 disabled:opacity-50"
                disabled={dataLoading}
              >
                {dataLoading ? "Saving..." : editId ? "Update Post" : "Create Post"}
              </button>
            </div>
          </form>
          
          <h2 className="text-xl font-bold mt-8 mb-4">Existing Blog Posts</h2>
          {posts.length === 0 ? (
            <p className="text-gray-500">No blog posts yet. Add your first post above or click "Add Sample Posts".</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col md:flex-row gap-4">
                  <div className="md:w-48 h-32 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {post.img ? (
                      <img src={post.img as string} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                      <h3 className="font-bold text-lg">{post.title}</h3>
                      <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <button
                          onClick={() => handleEdit(post)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.id!)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="inline-block bg-gray-100 rounded px-2 py-1 mr-2">
                        {post.category}
                      </span>
                      <span>{post.date}</span>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{post.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Resources tab */}
      {tab === "resources" && !dataLoading && (
        <div>
          {actionSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
              <p>{actionSuccess}</p>
            </div>
          )}
          
          {actionError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
              <p>{actionError}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{resourceEditId ? "Edit Resource" : "Add New Resource"}</h2>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              onClick={handleInitializeResources}
              disabled={isInitializingResources}
            >
              {isInitializingResources ? "Adding..." : "Add Sample Resources"}
            </button>
          </div>
          
          {/* Resource Form */}
          <form onSubmit={handleResourceSubmit} id="resource-form" className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="resourceCategory" className="block text-gray-700 font-medium mb-2">Category *</label>
                <input
                  type="text"
                  id="resourceCategory"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
                  value={resourceForm.category}
                  onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })}
                  placeholder="e.g., trading-basics, technical-analysis"
                  required
                />
              </div>
              <div>
                <label htmlFor="resourceCategoryLabel" className="block text-gray-700 font-medium mb-2">Category Label *</label>
                <input
                  type="text"
                  id="resourceCategoryLabel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
                  value={resourceForm.categoryLabel}
                  onChange={(e) => setResourceForm({ ...resourceForm, categoryLabel: e.target.value })}
                  placeholder="e.g., Trading Basics, Technical Analysis"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="resourceTitle" className="block text-gray-700 font-medium mb-2">Title *</label>
              <input
                type="text"
                id="resourceTitle"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
                value={resourceForm.title}
                onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="resourceDescription" className="block text-gray-700 font-medium mb-2">Description *</label>
              <textarea
                id="resourceDescription"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
                rows={3}
                value={resourceForm.description}
                onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="resourceLink" className="block text-gray-700 font-medium mb-2">Link *</label>
              <input
                type="url"
                id="resourceLink"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
                value={resourceForm.link}
                onChange={(e) => setResourceForm({ ...resourceForm, link: e.target.value })}
                placeholder="https://example.com/resource"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Image</label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="resource-image"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setResourceForm({ ...resourceForm, imageUrl: file });
                  }}
                />
                <label
                  htmlFor="resource-image"
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                >
                  Choose File
                </label>
                <span className="text-gray-500 text-sm">
                  {resourceForm.imageUrl instanceof File
                    ? resourceForm.imageUrl.name
                    : resourceForm.imageUrl
                    ? "Current image will be kept"
                    : "No file chosen"}
                </span>
              </div>
            </div>
            
            <div className="flex justify-end">
              {resourceEditId && (
                <button
                  type="button"
                  onClick={() => {
                    setResourceForm({ 
                      category: "", 
                      categoryLabel: "", 
                      title: "", 
                      description: "", 
                      imageUrl: null, 
                      link: "" 
                    });
                    setResourceEditId(null);
                  }}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-mwg-accent text-white rounded hover:bg-mwg-accent/80 disabled:opacity-50"
                disabled={dataLoading}
              >
                {dataLoading ? "Saving..." : resourceEditId ? "Update Resource" : "Create Resource"}
              </button>
            </div>
          </form>
          
          <h2 className="text-xl font-bold mt-8 mb-4">Existing Resources</h2>
          {resources.length === 0 ? (
            <p className="text-gray-500">No resources yet. Add your first resource above or click "Add Sample Resources".</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {resources.map((resource) => (
                <div key={resource.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col md:flex-row gap-4">
                  <div className="md:w-48 h-32 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {resource.imageUrl ? (
                      <img src={resource.imageUrl as string} alt={resource.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                      <h3 className="font-bold text-lg">{resource.title}</h3>
                      <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <button
                          onClick={() => handleResourceEdit(resource)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleResourceDelete(resource.id!)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="inline-block bg-gray-100 rounded px-2 py-1 mr-2">
                        {resource.categoryLabel}
                      </span>
                      <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Visit Resource
                      </a>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{resource.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Pages tab */}
      {tab === "pages" && !dataLoading && (
        <div>
          {actionSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
              <p>{actionSuccess}</p>
            </div>
          )}
          
          {actionError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
              <p>{actionError}</p>
            </div>
          )}
          
          <h2 className="text-xl font-bold mb-4">Page Content Management</h2>
          
          {/* Home Page Editor */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="font-bold text-lg mb-4">Home Page</h3>
            <HomePageEditor />
          </div>
          
          {/* About Page Editor */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="font-bold text-lg mb-4">About Page</h3>
            <AboutPageEditor />
          </div>
          
          {/* Other Page Content */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-4">Other Page Content</h3>
            {content.length === 0 ? (
              <p className="text-gray-500">No page content found.</p>
            ) : (
              <div className="space-y-4">
                {content.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{item.pageName}</h4>
                      <button
                        onClick={() => handleDeleteContent(item.id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      Content: {typeof item.content === 'string' ? item.content.substring(0, 100) + '...' : 'Object content'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Settings tab */}
      {tab === "settings" && !dataLoading && (
        <div>
          {actionSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
              <p>{actionSuccess}</p>
            </div>
          )}
          
          {actionError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
              <p>{actionError}</p>
            </div>
          )}
          
          <h2 className="text-xl font-bold mb-4">Site Settings</h2>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="font-bold text-lg mb-4">Footer Logo & Social Links</h3>
            
            <form onSubmit={handleFooterLogoSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Linktree URL</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
                  value={footerLogo.linkUrl}
                  onChange={(e) => setFooterLogo({ ...footerLogo, linkUrl: e.target.value })}
                  placeholder="https://linktr.ee/yourusername"
                />
                <p className="text-sm text-gray-500 mt-1">Enter your Linktree URL to link to all your social media profiles</p>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Footer Logo</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="footer-logo"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleLogoImageChange(file);
                    }}
                  />
                  <label
                    htmlFor="footer-logo"
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                  >
                    Choose File
                  </label>
                  <span className="text-gray-500 text-sm">
                    {footerLogo.imageUrl instanceof File
                      ? footerLogo.imageUrl.name
                      : footerLogo.imageUrl
                      ? "Current logo will be kept"
                      : "No file chosen"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Recommended size: 320x120px</p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-mwg-accent text-white rounded hover:bg-mwg-accent/80 disabled:opacity-50"
                  disabled={footerLogoLoading}
                >
                  {footerLogoLoading ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="font-bold text-lg mb-4">Contact Information</h3>
            
            <ContactInfoManager />
          </div>
        </div>
      )}
    </div>
  );
} 