"use client";

import { useState, useEffect } from 'react';
import { getDocuments } from '@/lib/firebase/firebaseUtils';
import Link from 'next/link';
import Image from 'next/image';
import MetadataManager from '@/components/MetadataManager';
import JsonLd from '@/components/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/utils/structuredData';
import Breadcrumbs from '@/components/Breadcrumbs';

interface BlogPost {
  id?: string;
  title: string;
  desc: string;
  content?: string; // Rich text content for full article
  category: string;
  date: string;
  img: string | null;
  author?: string;
}

// Sample fallback posts to display if Firebase fetch fails
const fallbackPosts: BlogPost[] = [
  {
    id: "fallback-1",
    title: "Understanding Market Analysis",
    desc: "An introduction to fundamental techniques used in market analysis for trading success.",
    category: "Trading",
    date: new Date().toISOString(),
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    author: "Motion Wealth Group"
  },
  {
    id: "fallback-2",
    title: "Risk Management Essentials",
    desc: "Learn the core principles of managing risk in your trading portfolio.",
    category: "Strategy",
    date: new Date(Date.now() - 86400000).toISOString(),
    img: "https://images.unsplash.com/photo-1543286386-713bdd548da4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    author: "Motion Wealth Group"
  },
  {
    id: "fallback-3",
    title: "The Psychology of Trading",
    desc: "How mental discipline and emotional control impact your trading decisions.",
    category: "Psychology",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    img: "https://images.unsplash.com/photo-1579226905180-636b76d96082?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    author: "Motion Wealth Group"
  }
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const fetchedPosts = await getDocuments("blogs");
        
        // If we got posts from Firebase, use them
        if (fetchedPosts && fetchedPosts.length > 0) {
          // Sort by date (newest first)
          const sortedPosts = [...fetchedPosts].sort((a: any, b: any) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          
          setPosts(sortedPosts);
          setFilteredPosts(sortedPosts);

          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(sortedPosts.map((post: BlogPost) => post.category))
          );
          setCategories(uniqueCategories);
        } else {
          // If Firebase returns no posts or if there's an authentication issue
          // Use fallback posts
          console.log("No posts found in Firebase, using fallback posts");
          setPosts(fallbackPosts);
          setFilteredPosts(fallbackPosts);
          
          // Extract categories from fallback posts
          const uniqueCategories = Array.from(
            new Set(fallbackPosts.map(post => post.category))
          );
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
        // Use fallback posts in case of any error
        setPosts(fallbackPosts);
        setFilteredPosts(fallbackPosts);
        
        // Extract categories from fallback posts
        const uniqueCategories = Array.from(
          new Set(fallbackPosts.map(post => post.category))
        );
        setCategories(uniqueCategories);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // Filter posts when category or search query changes
  useEffect(() => {
    let result = [...posts];

    // Filter by category
    if (activeCategory !== "All") {
      result = result.filter(post => post.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.desc.toLowerCase().includes(query)
      );
    }

    setFilteredPosts(result);
  }, [activeCategory, searchQuery, posts]);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Generate structured data
  const getBreadcrumbStructuredData = () => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://motionwealthgroup.com';
    
    // Breadcrumb items
    const breadcrumbItems = [
      { name: 'Home', url: baseUrl },
      { name: 'Blog', url: `${baseUrl}/blog` }
    ];
    
    return generateBreadcrumbSchema(breadcrumbItems);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mwg-accent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* SEO Metadata */}
      <MetadataManager 
        title="Blog - Motion Wealth Group"
        description="Insights, analyses, and lessons from the world of trading and investments. Read our latest articles about wealth management and financial services."
        ogType="website"
      />
      
      {/* Structured Data */}
      <JsonLd data={getBreadcrumbStructuredData()} />

      {/* Breadcrumbs */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4">
        <Breadcrumbs />
      </div>

      {/* Hero Section */}
      <section className="w-full flex flex-col items-center pt-8 sm:pt-12 pb-6 sm:pb-8 px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-2">
          My Trading <span className="text-mwg-accent">Journey</span>
        </h1>
        <p className="text-base sm:text-lg text-mwg-muted mb-6 sm:mb-8 text-center max-w-2xl px-4">
          Insights, analyses, and lessons from the world of trading and investments.
        </p>
      </section>

      {/* Filters and Search */}
      <section className="w-full max-w-6xl mx-auto mb-6 sm:mb-8 px-4">
        <div className="flex flex-col gap-4">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-4 py-3 rounded-full text-sm font-medium transition min-h-[44px] ${activeCategory === "All" ? "bg-mwg-accent text-black" : "bg-mwg-card hover:bg-mwg-accent/20"}`}
              onClick={() => setActiveCategory("All")}
            >
              All
            </button>
            {categories.map(category => (
              <button 
                key={category}
                className={`px-4 py-3 rounded-full text-sm font-medium transition min-h-[44px] ${activeCategory === category ? "bg-mwg-accent text-white" : "bg-mwg-card hover:bg-mwg-accent/20"}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-auto sm:max-w-md">
            <input
              type="text"
              placeholder="Search posts..."
              className="w-full p-3 pl-10 rounded-md bg-mwg-card border border-mwg-border text-mwg-text placeholder-mwg-muted focus:outline-none focus:ring-2 focus:ring-mwg-accent min-h-[44px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="absolute left-3 top-3.5 h-4 w-4 text-mwg-muted" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="w-full max-w-6xl mx-auto py-6 sm:py-8 px-4">
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPosts.map(post => (
              <div key={post.id} className="bg-mwg-card border border-mwg-border rounded-lg overflow-hidden shadow-md">
                {post.img && (
                  <div className="relative w-full h-40 sm:h-48">
                    <Image 
                      src={post.img} 
                      alt={post.title} 
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover" 
                    />
                  </div>
                )}
                <div className="p-4 sm:p-4">
                  <div className="flex gap-2 items-center mb-1">
                    <div className="text-xs text-mwg-accent font-semibold">{post.category}</div>
                    {post.content && (
                      <div className="bg-mwg-accent/20 text-xs text-mwg-accent px-1.5 py-0.5 rounded">
                        Full Article
                      </div>
                    )}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-mwg-text mb-1 line-clamp-2">{post.title}</div>
                  <div className="text-xs text-mwg-muted mb-2">{formatDate(post.date)}</div>
                  <div className="text-mwg-muted text-sm mb-4 line-clamp-3">{post.desc}</div>
                  <Link href={`/blog/${post.id}`} className="text-mwg-accent text-sm font-medium hover:underline flex items-center gap-1 min-h-[44px] items-center">
                    Read More <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-mwg-muted text-sm sm:text-base">No blog posts found. Please try a different search or category.</p>
          </div>
        )}
      </section>
    </div>
  );
}