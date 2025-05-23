"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getDocuments } from "@/lib/firebase/firebaseUtils";
import MetadataManager from "@/components/MetadataManager";
import JsonLd from "@/components/JsonLd";
import { generateBlogPostSchema } from "@/lib/utils/structuredData";

// Default content as fallback
const defaultContent = {
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
};

interface BlogPost {
  id?: string;
  title: string;
  desc: string;
  category: string;
  date: string;
  img: string | null;
  author?: string;
}

// Helper functions for data fetching and processing
const fetchHomeContent = async () => {
  try {
    const content = await getDocuments("pageContent");
    const homeContent = content.find((item: any) => item.pageName === "home");
    
    if (!homeContent || !homeContent.content) {
      return defaultContent;
    }
    
    // If content is a string (JSON), parse it
    if (typeof homeContent.content === 'string') {
      try {
        return JSON.parse(homeContent.content);
      } catch (e) {
        console.error("Error parsing home content:", e);
        return defaultContent;
      }
    }
    
    // If content is already an object
    return homeContent.content.sections || homeContent.content;
  } catch (error) {
    console.error("Error fetching home content:", error);
    return defaultContent;
  }
};

const fetchRecentBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const blogPosts = await getDocuments("blogPosts");
    
    if (!blogPosts || blogPosts.length === 0) {
      return [];
    }
    
    // Sort by date (newest first) and take 2
    return [...blogPosts]
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 2)
      .map((post: any): BlogPost => ({
        id: post.id,
        title: post.title || "",
        desc: post.desc || "",
        category: post.category || "",
        date: post.date || "",
        img: post.img || null,
        author: post.author || ""
      }));
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
};

// UI Component for Blog Post Card
const BlogPostCard = ({ post }: { post: BlogPost }) => (
  <div className="bg-mwg-card border border-mwg-border rounded-lg overflow-hidden shadow-md">
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
      <div className="text-xs text-mwg-accent font-semibold mb-1">{post.category}</div>
      <div className="text-base sm:text-lg font-bold text-mwg-text mb-1 line-clamp-2">{post.title}</div>
      <div className="text-xs text-mwg-muted mb-2">{post.date}</div>
      <div className="text-mwg-muted text-sm mb-3 line-clamp-3">{post.desc}</div>
      <Link href={`/blog/${post.id}`} className="text-mwg-accent text-sm font-medium hover:underline flex items-center gap-1 min-h-[44px] items-center">
        Read More <span>→</span>
      </Link>
    </div>
  </div>
);

export default function HomePage() {
  const [pageContent, setPageContent] = useState(defaultContent);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch content in parallel
        const [content, posts] = await Promise.all([
          fetchHomeContent(),
          fetchRecentBlogPosts()
        ]);
        
        setPageContent(content);
        setRecentPosts(posts);
      } catch (error) {
        console.error("Error loading page data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Generate structured data for blog posts
  const getBlogPostsStructuredData = () => {
    if (!recentPosts || recentPosts.length === 0) return null;
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://motionwealthgroup.com';
    
    return recentPosts.map(post => {
      const postData = {
        title: post.title,
        description: post.desc,
        url: `${baseUrl}/blog/${post.id}`,
        datePublished: post.date,
        dateModified: post.date,
        authorName: post.author || 'Motion Wealth Group',
        publisherName: 'Motion Wealth Group',
        publisherLogo: `${baseUrl}/logo.png`,
        image: post.img || undefined,
        category: post.category
      };
      
      return generateBlogPostSchema(postData);
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mwg-accent"></div>
      </div>
    );
  }

  const blogPostSchemas = getBlogPostsStructuredData();

  return (
    <div className="flex flex-col items-center w-full">
      {/* Structured data for blog posts */}
      {blogPostSchemas && blogPostSchemas.map((schema, index) => (
        <JsonLd key={index} data={schema} />
      ))}
      
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center pt-8 sm:pt-12 pb-6 sm:pb-8 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-mwg-accent mb-3 sm:mb-2 text-center">
          {pageContent.hero?.title || "Motion Wealth Group"}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-mwg-muted mb-6 sm:mb-6 text-center max-w-2xl px-4">
          {pageContent.hero?.subtitle || "Building wealth through strategic investment insights"}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-6 sm:mb-8 w-full max-w-sm sm:max-w-none sm:justify-center sm:items-center">
          <Link href="/resources" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-mwg-accent text-mwg-dark font-semibold px-8 py-3 rounded-md shadow hover:brightness-110 transition min-h-[44px]">
              {pageContent.hero?.buttonText || "Learn More"}
            </button>
          </Link>
          <Link href="/contact" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-mwg-card text-mwg-accent font-semibold px-8 py-3 rounded-md border border-mwg-accent hover:bg-mwg-accent hover:text-mwg-dark transition min-h-[44px]">
              Get in Touch
            </button>
          </Link>
        </div>
      </section>
      
      {/* About Section */}
      <section className="w-full flex flex-col items-center py-6 sm:py-8 px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-4">
          <span className="text-mwg-accent">About</span> {pageContent.about?.title?.split(' ').slice(1).join(' ') || "Motion Wealth Group"}
        </h2>
        <div className="bg-mwg-card border border-mwg-border rounded-lg p-4 sm:p-6 max-w-2xl text-mwg-muted text-sm sm:text-base shadow-md">
          <p className="mb-4">{pageContent.about?.content || defaultContent.about.content}</p>
          <p className="mb-4">Markets can be hard to understand with too much information. We make things simple with clear analysis and useful tips. We use our experience and skills to help you make better trading decisions.</p>
          <p className="mb-4">We help both new and skilled traders. Motion Wealth Group gives you the tools and advice you need to reach your money goals. We focus on growth and steady progress.</p>
          <div>
            <h3 className="font-semibold text-mwg-accent mb-2">Our Core Values</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-1 text-xs sm:text-sm list-none">
              {(pageContent.about?.values || defaultContent.about.values).map((value: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-mwg-accent flex-shrink-0">●</span> 
                  <span className="break-words">{value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      
      {/* Latest Insights Section */}
      <section className="w-full max-w-6xl mx-auto py-8 sm:py-12 px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold">
            <span className="text-mwg-text">Latest</span> <span className="text-mwg-accent">Insights</span>
          </h2>
          <Link href="/blog" className="text-mwg-accent font-medium hover:underline flex items-center gap-1 self-start sm:self-auto">
            View All <span>→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {recentPosts.length > 0 ? (
            recentPosts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="col-span-1 lg:col-span-2 py-8 text-center text-mwg-muted">
              No blog posts available at the moment. Check back soon!
            </div>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="w-full py-8 sm:py-12 bg-gradient-to-br from-mwg-accent/20 to-transparent rounded-lg px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
            {pageContent.cta?.title || "Ready to Accelerate Your Trading Journey?"}
          </h2>
          <p className="text-mwg-muted text-base sm:text-lg mb-6 max-w-2xl mx-auto px-4">
            {pageContent.cta?.content || "Connect with Motion Wealth Group for personalized insights and resources to help you achieve your financial goals."}
          </p>
          <Link href="/contact">
            <button className="bg-mwg-accent text-mwg-dark font-semibold px-6 sm:px-8 py-3 rounded-md shadow-lg hover:brightness-110 transition min-h-[44px]">
              Contact Us Today
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
