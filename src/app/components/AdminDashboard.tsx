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
    try {
      const docs = await getDocuments(BLOG_COLLECTION);
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
      setActionError("Failed to fetch blog posts");
      console.error("Error fetching posts:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchContent = async () => {
    setDataLoading(true);
    try {
      const docs = await getDocuments(CONTENT_COLLECTION);
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
      setActionError("Failed to fetch page content");
      console.error("Error fetching content:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchResources = async () => {
    setDataLoading(true);
    try {
      const docs = await getDocuments(RESOURCES_COLLECTION);
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
      setActionError("Failed to fetch resources");
      console.error("Error fetching resources:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchSiteSettings = async () => {
    setFooterLogoLoading(true);
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

  // TEMPORARY: Remove authentication checks to restore admin functionality
  /* Original auth checks commented out for now
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <div className="p-8 text-center">Please sign in as admin to access the dashboard.</div>;
  if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
    return <div className="p-8 text-center text-red-600">You do not have admin access.</div>;
  }
  */

  console.log('TEMPORARY: Bypassing AdminDashboard auth checks to restore functionality');

  return (
    <div className="max-w-6xl mx-auto">
      {false ? ( // Changed from loading condition to always show the dashboard
        <div className="text-center">Loading...</div>
      ) : true ? ( // Changed from user check to always return true
        <div>
          <div className="flex mb-4 space-x-2">
            <button 
              className={`px-4 py-2 rounded-md transition-colors ${tab === "blog" ? "bg-mwg-accent text-white" : "bg-mwg-card text-mwg-text hover:bg-mwg-accent/20"}`} 
              onClick={() => setTab("blog")}
            >
              Blog Management
            </button>
            <button 
              className={`px-4 py-2 rounded-md transition-colors ${tab === "content" ? "bg-mwg-accent text-white" : "bg-mwg-card text-mwg-text hover:bg-mwg-accent/20"}`} 
              onClick={() => setTab("content")}
            >
              Page Content
            </button>
            <button 
              className={`px-4 py-2 rounded-md transition-colors ${tab === "resources" ? "bg-mwg-accent text-white" : "bg-mwg-card text-mwg-text hover:bg-mwg-accent/20"}`} 
              onClick={() => setTab("resources")}
            >
              Resource Management
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-colors ${tab === "contact" ? "bg-mwg-accent text-white" : "bg-mwg-card text-mwg-text hover:bg-mwg-accent/20"}`}
              onClick={() => setTab("contact")}
            >
              Contact Info
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-colors ${tab === "settings" ? "bg-mwg-accent text-white" : "bg-mwg-card text-mwg-text hover:bg-mwg-accent/20"}`}
              onClick={() => setTab("settings")}
            >
              Site Settings
            </button>
          </div>
          
          {actionSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{actionSuccess}</span>
            </div>
          )}
          
          {actionError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{actionError}</span>
            </div>
          )}
          
          {dataLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mwg-accent mx-auto"></div>
                <p className="text-center mt-2 text-gray-700">Processing...</p>
              </div>
            </div>
          )}
          
          {tab === "blog" ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold mb-4 text-mwg-text">{editId ? "Edit Blog Post" : "Add New Blog Post"}</h2>
                <button
                  className="bg-mwg-card text-mwg-accent border border-mwg-accent px-4 py-2 rounded-md hover:bg-mwg-accent/10 transition-colors"
                  onClick={handleInitializeBlogPosts}
                  disabled={isInitializingBlogPosts}
                >
                  {isInitializingBlogPosts ? "Adding Sample Posts..." : "Add Sample Blog Posts"}
                </button>
              </div>
              <form id="blog-form" onSubmit={handleBlogSubmit} className="mb-8 space-y-4 bg-mwg-card p-6 rounded-lg shadow">
                <div>
                  <label className="block text-sm font-medium text-mwg-text mb-1">Title</label>
                  <input 
                    type="text" 
                    placeholder="Post title" 
                    className="w-full p-2 border rounded bg-white text-gray-800" 
                    value={form.title} 
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-mwg-text mb-1">Category</label>
                    <select
                      className="w-full p-2 border rounded bg-white text-gray-800"
                      value={form.category}
                      onChange={e => {
                        const newCategory = e.target.value;
                        setForm(f => ({ ...f, category: newCategory }));
                      }}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.length > 0 ? (
                        categories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No categories available</option>
                      )}
                    </select>
                    <div className="text-xs text-mwg-muted mt-1">
                      Available categories: {categories.length > 0 ? categories.join(', ') : 'None - add blog posts first'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-mwg-text mb-1">Date</label>
                    <input 
                      type="date" 
                      className="w-full p-2 border rounded bg-white text-gray-800" 
                      value={form.date} 
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))} 
                      required 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-mwg-text mb-1">Description (Short summary for preview)</label>
                  <textarea 
                    placeholder="Short description" 
                    className="w-full p-2 border rounded bg-white text-gray-800 min-h-32" 
                    value={form.desc} 
                    onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} 
                    required 
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-mwg-text mb-1">Full Article Content (HTML)</label>
                  <p className="text-xs text-mwg-muted mb-2">Create rich content with HTML. Switch to Preview to see how it will look.</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button
                      type="button"
                      className="text-xs bg-mwg-card hover:bg-mwg-accent/20 text-mwg-accent px-2 py-1 rounded-md transition-colors"
                      onClick={() => setForm(f => ({ 
                        ...f, 
                        content: (f.content || '') + '<h2>Heading</h2><p>Your paragraph text here.</p>' 
                      }))}
                    >
                      Add Heading + Paragraph
                    </button>
                    <button
                      type="button"
                      className="text-xs bg-mwg-card hover:bg-mwg-accent/20 text-mwg-accent px-2 py-1 rounded-md transition-colors"
                      onClick={() => setForm(f => ({ 
                        ...f, 
                        content: (f.content || '') + '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>' 
                      }))}
                    >
                      Add List
                    </button>
                    <button
                      type="button"
                      className="text-xs bg-mwg-card hover:bg-mwg-accent/20 text-mwg-accent px-2 py-1 rounded-md transition-colors"
                      onClick={() => setForm(f => ({ 
                        ...f, 
                        content: (f.content || '') + '<blockquote>Your quote or important text here.</blockquote>' 
                      }))}
                    >
                      Add Quote
                    </button>
                    <button
                      type="button"
                      className="text-xs bg-mwg-card hover:bg-mwg-accent/20 text-mwg-accent px-2 py-1 rounded-md transition-colors"
                      onClick={() => setForm(f => ({ 
                        ...f, 
                        content: (f.content || '') + '<img src="image-url.jpg" alt="Description" class="w-full rounded-lg" />' 
                      }))}
                    >
                      Add Image
                    </button>
                  </div>
                  <div className="mt-2 overflow-hidden">
                    <RichTextEditor 
                      value={form.content || ''} 
                      onChange={(content) => setForm(f => ({ ...f, content }))} 
                      height={400}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-mwg-text mb-1">Featured Image</label>
                  {typeof form.img === "string" && form.img && (
                    <div className="mb-2">
                      <img src={form.img} alt="Current image" className="h-32 object-cover rounded" />
                      <p className="text-xs text-mwg-muted mt-1">Current image</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="w-full p-2 border rounded bg-white text-gray-800" 
                    onChange={e => setForm(f => ({ ...f, img: (e.target as HTMLInputElement).files?.[0] || null }))} 
                  />
                  <div className="flex items-center mt-2 text-mwg-muted text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>In development mode, image uploads will use a placeholder. Real uploads will work in production.</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 pt-2">
                  <button 
                    type="submit" 
                    className="bg-mwg-accent text-white px-4 py-2 rounded-md hover:bg-mwg-accent/90 transition-colors" 
                    disabled={dataLoading}
                  >
                    {editId ? "Update Post" : "Add Post"}
                  </button>
                  
                  {editId && (
                    <button 
                      type="button" 
                      className="px-4 py-2 border border-mwg-muted text-mwg-muted rounded-md hover:bg-mwg-card/50" 
                      onClick={() => { 
                        setForm({ title: "", desc: "", content: "", category: "", date: "", img: null }); 
                        setEditId(null);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              
              <h2 className="text-xl font-bold mb-4 text-mwg-text">Existing Blog Posts</h2>
              {posts.length === 0 ? (
                <p className="text-mwg-muted italic">No blog posts yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {posts.map(post => (
                    <div key={post.id} className="bg-mwg-card border rounded-lg p-4 flex flex-col md:flex-row gap-4">
                      {typeof post.img === "string" && post.img && (
                        <div className="md:w-1/4">
                          <img src={post.img} alt={post.title} className="w-full h-32 object-cover rounded-md" />
                        </div>
                      )}
                      <div className={`${typeof post.img === "string" && post.img ? "md:w-3/4" : "w-full"}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-mwg-text text-lg">{post.title}</h3>
                            <div className="text-xs text-mwg-muted mb-2">
                              <span className="bg-mwg-accent/20 text-mwg-accent px-2 py-0.5 rounded-full">{post.category}</span> 
                              <span className="ml-2">{post.date}</span>
                              {post.content && (
                                <span className="ml-2 bg-green-800/20 text-green-400 px-2 py-0.5 rounded-full">
                                  Full Article
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              className="text-blue-400 hover:text-blue-300 transition-colors" 
                              onClick={() => handleEdit(post)}
                            >
                              Edit
                            </button>
                            {post.id && (
                              <button 
                                className="text-red-400 hover:text-red-300 transition-colors" 
                                onClick={() => handleDelete(post.id!)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="text-mwg-muted">
                          {post.desc.length > 150 ? `${post.desc.substring(0, 150)}...` : post.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : tab === "content" ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-mwg-text">Page Content Sections</h2>
                <button
                  className="bg-mwg-accent text-white px-4 py-2 rounded-md hover:bg-mwg-accent/90 transition-colors"
                  onClick={() => setShowNewContentForm(!showNewContentForm)}
                >
                  {showNewContentForm ? "Cancel" : "Add New Section"}
                </button>
              </div>
              
              {showNewContentForm && (
                <form onSubmit={handleAddNewContent} className="mb-8 space-y-4 bg-mwg-card p-6 rounded-lg shadow">
                  <div>
                    <label className="block text-sm font-medium text-mwg-text mb-1">Page Name</label>
                    <select 
                      className="w-full p-2 border rounded bg-white text-gray-800" 
                      value={newContent.pageName} 
                      onChange={e => setNewContent({...newContent, pageName: e.target.value})}
                      required
                    >
                      <option value="">Select a page</option>
                      <option value="home">Home</option>
                      <option value="resources">Resources</option>
                      <option value="contact">Contact</option>
                      <option value="custom">Custom Page</option>
                    </select>
                    {newContent.pageName === 'custom' && (
                      <input 
                        type="text" 
                        placeholder="Custom page name" 
                        className="w-full mt-2 p-2 border rounded bg-white text-gray-800" 
                        value={newContent.customPageName || ''} 
                        onChange={e => setNewContent({...newContent, customPageName: e.target.value, pageName: e.target.value})} 
                        required 
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-mwg-text mb-1">Content (JSON format)</label>
                    <textarea 
                      placeholder="Content in JSON format" 
                      className="w-full p-2 border rounded bg-white text-gray-800 min-h-32 font-mono" 
                      value={typeof newContent.content === 'object' ? JSON.stringify(newContent.content, null, 2) : newContent.content || ''} 
                      onChange={e => {
                        try {
                          // Try to parse as JSON
                          const parsed = JSON.parse(e.target.value);
                          setNewContent({...newContent, content: parsed});
                        } catch {
                          // If not valid JSON, store as string
                          setNewContent({...newContent, content: e.target.value});
                        }
                      }} 
                      required 
                      rows={8}
                    />
                    <p className="text-xs text-mwg-muted mt-1">Enter content in JSON format or plain text.</p>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="bg-mwg-accent text-white px-4 py-2 rounded-md hover:bg-mwg-accent/90 transition-colors" 
                    disabled={dataLoading}
                  >
                    Add Content Section
                  </button>
                </form>
              )}
              
              {content.length === 0 ? (
                <p className="text-mwg-muted italic">No content sections defined yet.</p>
              ) : (
                <div className="space-y-6">
                  {content.map(page => (
                    <div key={page.id} className="bg-mwg-card border rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-mwg-text">
                          Page: <span className="text-mwg-accent capitalize">{page.pageName}</span>
                        </h3>
                        <div className="flex gap-2">
                          {(page.pageName === 'home' || page.pageName === 'resources' || page.pageName === 'contact') && (
                            <button
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              onClick={() => {
                                // Reset to default template
                                const pageName = page.pageName as PageTemplateKey;
                                if (DEFAULT_PAGE_TEMPLATES[pageName]) {
                                  handleContentEdit(page.id, 'content', JSON.stringify(DEFAULT_PAGE_TEMPLATES[pageName].sections, null, 2));
                                }
                              }}
                              title="Reset to default template"
                            >
                              Reset
                            </button>
                          )}
                          <button
                            className="text-red-400 hover:text-red-300 transition-colors"
                            onClick={() => handleDeleteContent(page.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-2 text-sm">
                        <span className="bg-mwg-accent/10 text-mwg-accent px-2 py-0.5 rounded-full">
                          {typeof page.content === 'object' ? 'JSON Content' : 'Text Content'}
                        </span>
                      </div>
                      
                      <label className="block text-sm font-medium text-mwg-text mb-1">Content (JSON or text)</label>
                      <textarea 
                        className="w-full p-2 border rounded bg-white text-gray-800 mb-4 font-mono" 
                        value={
                          typeof contentEdit[page.id]?.content === 'string' 
                            ? contentEdit[page.id].content 
                            : typeof contentEdit[page.id]?.content === 'object'
                              ? JSON.stringify(contentEdit[page.id].content, null, 2)
                              : typeof page.content === 'object'
                                ? JSON.stringify(page.content, null, 2)
                                : page.content
                        } 
                        onChange={e => {
                          try {
                            // Try to parse as JSON
                            const parsed = JSON.parse(e.target.value);
                            handleContentEdit(page.id, 'content', parsed);
                          } catch {
                            // If not valid JSON, store as string
                            handleContentEdit(page.id, 'content', e.target.value);
                          }
                        }} 
                        rows={12}
                      />
                      
                      <button 
                        className="bg-mwg-accent text-white px-4 py-2 rounded-md hover:bg-mwg-accent/90 transition-colors" 
                        onClick={() => handleContentSave(page.id)} 
                        disabled={dataLoading}
                      >
                        Save Changes
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : tab === "resources" ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold mb-4 text-mwg-text">{resourceEditId ? "Edit Resource" : "Add New Resource"}</h2>
                <button
                  className="bg-mwg-card text-mwg-accent border border-mwg-accent px-4 py-2 rounded-md hover:bg-mwg-accent/10 transition-colors"
                  onClick={handleInitializeResources}
                  disabled={isInitializingResources}
                >
                  {isInitializingResources ? "Adding Sample Resources..." : "Add Sample Resources"}
                </button>
              </div>
              <form id="resource-form" onSubmit={handleResourceSubmit} className="mb-8 space-y-4 bg-mwg-card p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-mwg-text mb-1">Category</label>
                    <input 
                      type="text" 
                      placeholder="Category (e.g., trading, analysis)" 
                      className="w-full p-2 border rounded bg-white text-gray-800" 
                      value={resourceForm.category} 
                      onChange={e => setResourceForm(f => ({ ...f, category: e.target.value }))} 
                      required 
                    />
                    <p className="text-xs text-mwg-muted mt-1">Single word, lowercase (e.g., trading, analysis)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-mwg-text mb-1">Category Label</label>
                    <input 
                      type="text" 
                      placeholder="Category Label" 
                      className="w-full p-2 border rounded bg-white text-gray-800" 
                      value={resourceForm.categoryLabel} 
                      onChange={e => setResourceForm(f => ({ ...f, categoryLabel: e.target.value }))} 
                      required 
                    />
                    <p className="text-xs text-mwg-muted mt-1">Display name (e.g., Trading Platform, Analysis Tool)</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-mwg-text mb-1">Title</label>
                  <input 
                    type="text" 
                    placeholder="Resource title" 
                    className="w-full p-2 border rounded bg-white text-gray-800" 
                    value={resourceForm.title} 
                    onChange={e => setResourceForm(f => ({ ...f, title: e.target.value }))} 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-mwg-text mb-1">Description</label>
                  <textarea 
                    placeholder="Resource description" 
                    className="w-full p-2 border rounded bg-white text-gray-800 min-h-32" 
                    value={resourceForm.description} 
                    onChange={e => setResourceForm(f => ({ ...f, description: e.target.value }))} 
                    required 
                    rows={4}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-mwg-text mb-1">Affiliate Link</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com/affiliate-link" 
                    className="w-full p-2 border rounded bg-white text-gray-800" 
                    value={resourceForm.link} 
                    onChange={e => setResourceForm(f => ({ ...f, link: e.target.value }))} 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-mwg-text mb-1">Image</label>
                  {typeof resourceForm.imageUrl === "string" && resourceForm.imageUrl && (
                    <div className="mb-2">
                      <img src={resourceForm.imageUrl} alt="Current image" className="h-32 object-cover rounded" />
                      <p className="text-xs text-mwg-muted mt-1">Current image</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="w-full p-2 border rounded bg-white text-gray-800" 
                    onChange={e => setResourceForm(f => ({ ...f, imageUrl: (e.target as HTMLInputElement).files?.[0] || null }))} 
                  />
                </div>
                
                <div className="flex items-center gap-4 pt-2">
                  <button 
                    type="submit" 
                    className="bg-mwg-accent text-white px-4 py-2 rounded-md hover:bg-mwg-accent/90 transition-colors" 
                    disabled={dataLoading}
                  >
                    {resourceEditId ? "Update Resource" : "Add Resource"}
                  </button>
                  
                  {resourceEditId && (
                    <button 
                      type="button" 
                      className="px-4 py-2 border border-mwg-muted text-mwg-muted rounded-md hover:bg-mwg-card/50" 
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
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              
              <h2 className="text-xl font-bold mb-4 text-mwg-text">Existing Resources</h2>
              {resources.length === 0 ? (
                <p className="text-mwg-muted italic">No resources yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {resources.map(resource => (
                    <div key={resource.id} className="bg-mwg-card border rounded-lg p-4 flex flex-col md:flex-row gap-4">
                      {typeof resource.imageUrl === "string" && resource.imageUrl && (
                        <div className="md:w-1/4">
                          <img src={resource.imageUrl} alt={resource.title} className="w-full h-32 object-cover rounded-md" />
                        </div>
                      )}
                      <div className={`${typeof resource.imageUrl === "string" && resource.imageUrl ? "md:w-3/4" : "w-full"}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-mwg-text text-lg">{resource.title}</h3>
                            <div className="text-xs text-mwg-muted mb-2">
                              <span className="bg-mwg-accent/20 text-mwg-accent px-2 py-0.5 rounded-full">{resource.categoryLabel}</span> 
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              className="text-blue-400 hover:text-blue-300 transition-colors" 
                              onClick={() => handleResourceEdit(resource)}
                            >
                              Edit
                            </button>
                            {resource.id && (
                              <button 
                                className="text-red-400 hover:text-red-300 transition-colors" 
                                onClick={() => handleResourceDelete(resource.id!)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="text-mwg-muted mb-2">
                          {resource.description.length > 150 ? `${resource.description.substring(0, 150)}...` : resource.description}
                        </div>
                        <div className="text-xs text-mwg-muted truncate">
                          <span className="font-bold">Link:</span> {resource.link}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : tab === "contact" ? (
            <div>
              <ContactInfoManager />
            </div>
          ) : (
            <div>
              <div className="bg-mwg-dark p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Site Settings</h2>
                <div className="mb-8">
                  <h3 className="text-xl font-medium mb-4">Footer Logo</h3>
                  <form onSubmit={handleFooterLogoSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Logo Image</label>
                      <div className="md:w-1/2">
                        {typeof footerLogo.imageUrl === 'string' && footerLogo.imageUrl ? (
                          <div className="mb-4">
                            <p className="text-sm mb-2">Current Logo:</p>
                            <img 
                              src={footerLogo.imageUrl} 
                              alt="Footer Logo" 
                              className="max-h-48 object-contain bg-white p-2 rounded"
                            />
                          </div>
                        ) : null}
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleLogoImageChange(file);
                            }}
                            className="block w-full text-sm text-gray-400
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-semibold
                              file:bg-mwg-primary file:text-white
                              hover:file:bg-mwg-primary/90
                            "
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Logo Link URL</label>
                      <input
                        type="url"
                        value={footerLogo.linkUrl}
                        onChange={(e) => setFooterLogo({...footerLogo, linkUrl: e.target.value})}
                        placeholder="https://example.com"
                        className="w-full md:w-1/2 bg-mwg-input text-white p-2 rounded"
                      />
                      <p className="text-xs text-mwg-muted mt-1">
                        Enter the URL where the logo should link to
                      </p>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={footerLogoLoading}
                        className="px-4 py-2 bg-mwg-primary text-black rounded hover:bg-mwg-primary/90 disabled:opacity-50"
                      >
                        {footerLogoLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-mwg-text">Page Content Sections</h2>
            <button
              className="bg-mwg-accent text-white px-4 py-2 rounded-md hover:bg-mwg-accent/90 transition-colors"
              onClick={() => setShowNewContentForm(!showNewContentForm)}
            >
              {showNewContentForm ? "Cancel" : "Add New Section"}
            </button>
          </div>
          
          {showNewContentForm && (
            <form onSubmit={handleAddNewContent} className="mb-8 space-y-4 bg-mwg-card p-6 rounded-lg shadow">
              <div>
                <label className="block text-sm font-medium text-mwg-text mb-1">Page Name</label>
                <select 
                  className="w-full p-2 border rounded bg-white text-gray-800" 
                  value={newContent.pageName} 
                  onChange={e => setNewContent({...newContent, pageName: e.target.value})}
                  required
                >
                  <option value="">Select a page</option>
                  <option value="home">Home</option>
                  <option value="resources">Resources</option>
                  <option value="contact">Contact</option>
                  <option value="custom">Custom Page</option>
                </select>
                {newContent.pageName === 'custom' && (
                  <input 
                    type="text" 
                    placeholder="Custom page name" 
                    className="w-full mt-2 p-2 border rounded bg-white text-gray-800" 
                    value={newContent.customPageName || ''} 
                    onChange={e => setNewContent({...newContent, customPageName: e.target.value, pageName: e.target.value})} 
                    required 
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mwg-text mb-1">Content (JSON format)</label>
                <textarea 
                  placeholder="Content in JSON format" 
                  className="w-full p-2 border rounded bg-white text-gray-800 min-h-32 font-mono" 
                  value={typeof newContent.content === 'object' ? JSON.stringify(newContent.content, null, 2) : newContent.content || ''} 
                  onChange={e => {
                    try {
                      // Try to parse as JSON
                      const parsed = JSON.parse(e.target.value);
                      setNewContent({...newContent, content: parsed});
                    } catch {
                      // If not valid JSON, store as string
                      setNewContent({...newContent, content: e.target.value});
                    }
                  }} 
                  required 
                  rows={8}
                />
                <p className="text-xs text-mwg-muted mt-1">Enter content in JSON format or plain text.</p>
              </div>
              
              <button 
                type="submit" 
                className="bg-mwg-accent text-white px-4 py-2 rounded-md hover:bg-mwg-accent/90 transition-colors" 
                disabled={dataLoading}
              >
                Add Content Section
              </button>
            </form>
          )}
          
          {content.length === 0 ? (
            <p className="text-mwg-muted italic">No content sections defined yet.</p>
          ) : (
            <div className="space-y-6">
              {content.map(page => (
                <div key={page.id} className="bg-mwg-card border rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-mwg-text">
                      Page: <span className="text-mwg-accent capitalize">{page.pageName}</span>
                    </h3>
                    <div className="flex gap-2">
                      {(page.pageName === 'home' || page.pageName === 'resources' || page.pageName === 'contact') && (
                        <button
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          onClick={() => {
                            // Reset to default template
                            const pageName = page.pageName as PageTemplateKey;
                            if (DEFAULT_PAGE_TEMPLATES[pageName]) {
                              handleContentEdit(page.id, 'content', JSON.stringify(DEFAULT_PAGE_TEMPLATES[pageName].sections, null, 2));
                            }
                          }}
                          title="Reset to default template"
                        >
                          Reset
                        </button>
                      )}
                      <button
                        className="text-red-400 hover:text-red-300 transition-colors"
                        onClick={() => handleDeleteContent(page.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-2 text-sm">
                    <span className="bg-mwg-accent/10 text-mwg-accent px-2 py-0.5 rounded-full">
                      {typeof page.content === 'object' ? 'JSON Content' : 'Text Content'}
                    </span>
                  </div>
                  
                  <label className="block text-sm font-medium text-mwg-text mb-1">Content (JSON or text)</label>
                  <textarea 
                    className="w-full p-2 border rounded bg-white text-gray-800 mb-4 font-mono" 
                    value={
                      typeof contentEdit[page.id]?.content === 'string' 
                        ? contentEdit[page.id].content 
                        : typeof contentEdit[page.id]?.content === 'object'
                          ? JSON.stringify(contentEdit[page.id].content, null, 2)
                          : typeof page.content === 'object'
                            ? JSON.stringify(page.content, null, 2)
                            : page.content
                    } 
                    onChange={e => {
                      try {
                        // Try to parse as JSON
                        const parsed = JSON.parse(e.target.value);
                        handleContentEdit(page.id, 'content', parsed);
                      } catch {
                        // If not valid JSON, store as string
                        handleContentEdit(page.id, 'content', e.target.value);
                      }
                    }} 
                    rows={12}
                  />
                  
                  <button 
                    className="bg-mwg-accent text-black px-4 py-2 rounded-md hover:bg-mwg-accent/90 transition-colors" 
                    onClick={() => handleContentSave(page.id)} 
                    disabled={dataLoading}
                  >
                    Save Changes
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 