"use client";

import { useState, useEffect } from 'react';
import { getDocument } from '@/lib/firebase/firebaseUtils';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import MetadataManager from '@/components/MetadataManager';
import JsonLd from '@/components/JsonLd';
import { generateBlogPostSchema, generateBreadcrumbSchema } from '@/lib/utils/structuredData';
import Image from 'next/image';
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
  lastModified?: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        if (!id) {
          setError('Post ID is missing');
          return;
        }
        
        const fetchedPost = await getDocument("blogPosts", id);
        if (!fetchedPost) {
          setError('Post not found');
          return;
        }
        
        setPost(fetchedPost as BlogPost);
      } catch (err) {
        console.error("Error fetching blog post:", err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id]);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Generate structured data
  const getStructuredData = () => {
    if (!post) return null;
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://motionwealthgroup.com';
    const url = `${baseUrl}/blog/${id}`;
    
    // Blog post schema
    const blogPostData = {
      title: post.title,
      description: post.desc,
      url: url,
      datePublished: post.date,
      dateModified: post.lastModified || post.date,
      authorName: post.author || 'Motion Wealth Group',
      publisherName: 'Motion Wealth Group',
      publisherLogo: `${baseUrl}/logo.png`,
      image: post.img || undefined,
      category: post.category
    };
    
    // Breadcrumb schema
    const breadcrumbItems = [
      { name: 'Home', url: baseUrl },
      { name: 'Blog', url: `${baseUrl}/blog` },
      { name: post.title, url: url }
    ];
    
    return {
      blogPost: generateBlogPostSchema(blogPostData),
      breadcrumb: generateBreadcrumbSchema(breadcrumbItems)
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mwg-accent"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-2xl font-bold text-mwg-text mb-4">{error || 'Post not found'}</h1>
        <p className="text-mwg-muted mb-6">The blog post you&apos;re looking for doesn&apos;t seem to exist.</p>
        <Link href="/blog" className="bg-mwg-accent text-white px-6 py-2 rounded-md hover:brightness-110 transition">
          Return to Blog
        </Link>
      </div>
    );
  }

  const structuredData = getStructuredData();

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-8">
      {/* SEO metadata */}
      <MetadataManager 
        title={post.title}
        description={post.desc}
        ogImage={post.img || undefined}
        ogType="article"
        publishedTime={post.date}
        modifiedTime={post.lastModified || post.date}
        author={post.author || 'Motion Wealth Group'}
      />

      {/* Structured data */}
      {structuredData && (
        <>
          <JsonLd data={structuredData.blogPost} />
          <JsonLd data={structuredData.breadcrumb} />
        </>
      )}
      
      {/* Breadcrumbs */}
      <div className="w-full mb-4">
        <Breadcrumbs 
          customItems={[
            { label: 'Home', path: '/', isCurrentPage: false },
            { label: 'Blog', path: '/blog', isCurrentPage: false },
            { label: post.title, path: `/blog/${id}`, isCurrentPage: true }
          ]}
        />
      </div>
      
      {/* Back Button */}
      <div className="w-full mb-6">
        <Link href="/blog" className="text-mwg-accent flex items-center gap-1 hover:underline">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Blog
        </Link>
      </div>
      
      {/* Blog Post Header */}
      <div className="w-full mb-8">
        <div className="text-sm text-mwg-accent font-medium mb-2">{post.category}</div>
        <h1 className="text-3xl md:text-4xl font-bold text-mwg-text mb-2">{post.title}</h1>
        <div className="flex items-center gap-2 text-sm text-mwg-muted">
          <span>{formatDate(post.date)}</span>
          {post.author && (
            <>
              <span>•</span>
              <span>By {post.author}</span>
            </>
          )}
        </div>
      </div>
      
      {/* Featured Image */}
      {post.img && (
        <div className="w-full mb-8 relative">
          {/* Using next/image for optimization */}
          <div className="relative w-full h-[300px] md:h-[400px]">
            <Image 
              src={post.img} 
              alt={post.title} 
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover rounded-lg shadow-md" 
            />
          </div>
        </div>
      )}
      
      {/* Blog Content */}
      <div className="w-full prose prose-invert max-w-none mb-8">
        {post.content ? (
          <div className="text-mwg-text leading-relaxed rich-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        ) : (
          <p className="text-mwg-text leading-relaxed whitespace-pre-line">
            {post.desc}
          </p>
        )}
        
        {!post.content && (
          <div className="bg-mwg-card border border-mwg-border rounded-lg p-6 text-center mt-8">
            <p className="text-mwg-muted">
              This is a placeholder for the full blog content. In a complete implementation, 
              you would have a rich content field in your database and a robust editor in your 
              admin dashboard to create and manage full-length articles.
            </p>
          </div>
        )}
      </div>
      
      {/* Share/Navigation Section */}
      <div className="w-full flex justify-between items-center border-t border-mwg-border pt-6">
        <Link href="/blog" className="bg-mwg-card text-mwg-accent border border-mwg-accent px-4 py-2 rounded-md hover:bg-mwg-accent/10 transition-colors">
          Back to All Posts
        </Link>
        <div className="flex gap-2">
          <button className="text-mwg-muted hover:text-mwg-accent transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 5.34c-.67.41-1.4.7-2.18.87.63-.38 1.11-.98 1.33-1.7-.59.35-1.24.6-1.94.73-.56-.6-1.36-.97-2.24-.97-1.7 0-3.07 1.38-3.07 3.07 0 .24.03.47.08.7-2.55-.13-4.81-1.35-6.32-3.2-.26.45-.41.97-.41 1.52 0 1.06.54 2 1.36 2.55-.5-.02-.97-.15-1.38-.38v.04c0 1.49 1.06 2.73 2.46 3.01-.26.07-.53.1-.81.1-.2 0-.39-.02-.58-.06.39 1.22 1.52 2.11 2.87 2.14-1.05.82-2.37 1.31-3.82 1.31-.25 0-.49-.01-.73-.04 1.36.87 2.97 1.38 4.7 1.38 5.64 0 8.72-4.67 8.72-8.72 0-.13 0-.26-.01-.39.6-.43 1.12-.97 1.53-1.58z" />
            </svg>
          </button>
          <button className="text-mwg-muted hover:text-mwg-accent transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8.62c-.08-.25-.16-.48-.16-.78V16.5H5.5v-2h7.34c.3-.76.8-1.42 1.45-1.92L14 14h-8.5v-2H14V9H5.5V7h16v2h-4.25c.2.47.31.97.31 1.5 0 .17-.01.34-.03.5H20V4a1 1 0 0 0-1-1ZM8 15.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM16.5 10c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5Zm1.5 6h-3v-1h3v1Zm1 3h-5v-1h5v1Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 