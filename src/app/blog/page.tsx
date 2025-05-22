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
      } catch (error) {
        console.error("Error fetching blog posts:", error);
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
      <section className="w-full flex flex-col items-center pt-12 pb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
          My Trading <span className="text-mwg-accent">Journey</span>
        </h1>
        <p className="text-lg text-mwg-muted mb-8 text-center max-w-2xl">
          Insights, analyses, and lessons from the world of trading and investments.
        </p>
      </section>

      {/* Filters and Search */}
      <section className="w-full max-w-6xl mx-auto mb-8 px-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === "All" ? "bg-mwg-accent text-black" : "bg-mwg-card hover:bg-mwg-accent/20"}`}
              onClick={() => setActiveCategory("All")}
            >
              All
            </button>
            {categories.map(category => (
              <button 
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === category ? "bg-mwg-accent text-white" : "bg-mwg-card hover:bg-mwg-accent/20"}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search posts..."
              className="w-full md:w-64 p-2 pl-8 rounded-md bg-mwg-card border border-mwg-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="absolute left-2 top-2.5 h-4 w-4 text-mwg-muted" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="w-full max-w-6xl mx-auto py-8 px-4">
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <div key={post.id} className="bg-mwg-card border border-mwg-border rounded-lg overflow-hidden shadow-md">
                {post.img && (
                  <div className="relative w-full h-48">
                    <Image 
                      src={post.img} 
                      alt={post.title} 
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover" 
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex gap-2 items-center mb-1">
                    <div className="text-xs text-mwg-accent font-semibold">{post.category}</div>
                    {post.content && (
                      <div className="bg-mwg-accent/20 text-xs text-mwg-accent px-1.5 py-0.5 rounded">
                        Full Article
                      </div>
                    )}
                  </div>
                  <div className="text-lg font-bold text-mwg-text mb-1">{post.title}</div>
                  <div className="text-xs text-mwg-muted mb-2">{formatDate(post.date)}</div>
                  <div className="text-mwg-muted text-sm mb-4 line-clamp-3">{post.desc}</div>
                  <Link href={`/blog/${post.id}`} className="text-mwg-accent text-sm font-medium hover:underline flex items-center gap-1">
                    Read More <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-mwg-muted">No blog posts found. Please try a different search or category.</p>
          </div>
        )}
      </section>
    </div>
  );
}