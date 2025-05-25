"use client";

import { useState, useEffect } from "react";
import { getDocuments } from "@/lib/firebase/firebaseUtils";
import MetadataManager from "@/components/MetadataManager";

// Default content as fallback
const defaultContent = {
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
};

interface AboutContent {
  title: string;
  subtitle: string;
  content: string;
}

const fetchAboutContent = async (): Promise<AboutContent> => {
  try {
    const content = await getDocuments("pageContent");
    const aboutContent = content.find((item: any) => item.pageName === "about");
    
    if (!aboutContent || !aboutContent.content) {
      return defaultContent;
    }
    
    // If content is a string (JSON), parse it
    if (typeof aboutContent.content === 'string') {
      try {
        return JSON.parse(aboutContent.content);
      } catch (e) {
        console.error("Error parsing about content:", e);
        return defaultContent;
      }
    }
    
    // If content is already an object
    return aboutContent.content;
  } catch (error) {
    console.error("Error fetching about content:", error);
    return defaultContent;
  }
};

export default function AboutPage() {
  const [pageContent, setPageContent] = useState<AboutContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const content = await fetchAboutContent();
        setPageContent(content);
      } catch (error) {
        console.error("Error loading about page data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mwg-accent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <MetadataManager 
        title={`${pageContent.title} | Motion Wealth Group`}
        description={pageContent.subtitle}
      />
      
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center pt-8 sm:pt-12 pb-6 sm:pb-8 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-mwg-accent mb-3 sm:mb-2 text-center">
          {pageContent.title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-mwg-muted mb-6 sm:mb-6 text-center max-w-2xl px-4">
          {pageContent.subtitle}
        </p>
      </section>
      
      {/* Content Section */}
      <section className="w-full max-w-4xl mx-auto py-6 sm:py-8 px-4">
        <div className="bg-mwg-card border border-mwg-border rounded-lg p-6 sm:p-8 shadow-md">
          <div 
            className="prose prose-invert max-w-none text-mwg-muted"
            dangerouslySetInnerHTML={{ __html: pageContent.content }}
          />
        </div>
      </section>
    </div>
  );
} 