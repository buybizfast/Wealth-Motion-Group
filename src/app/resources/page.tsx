"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDocuments } from '@/lib/firebase/firebaseUtils';

type ResourceCategory = 'trading' | 'analysis' | 'productivity' | 'education' | 'risk' | 'news' | 'all';

interface Resource {
  id?: string;
  category: ResourceCategory;
  categoryLabel: string;
  title: string;
  description: string;
  imageUrl: string | null;
  link: string;
}

// Complete resources matching the admin dashboard sample resources
const fallbackResources: Resource[] = [
  {
    id: "resource-1",
    category: "trading",
    categoryLabel: "Trading Platform",
    title: "Premium Trading Platform",
    description: "A comprehensive trading platform with advanced analytics, live charts, and extended market hours. Includes access to pre-market and after-hours trading with real-time data.",
    imageUrl: "https://images.unsplash.com/photo-1642033697099-309b2078c648?q=80&w=1470&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/trading-platform"
  },
  {
    id: "resource-2",
    category: "analysis",
    categoryLabel: "Analysis Tool",
    title: "Market Scanner Pro",
    description: "Powerful scanner tool that helps you find the best trade opportunities with custom presets. Identify patterns and trends with institutional-grade algorithms and historical backtesting.",
    imageUrl: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=1470&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/market-scanner"
  },
  {
    id: "resource-3",
    category: "productivity",
    categoryLabel: "Productivity",
    title: "Advanced Trading Journal",
    description: "Record, track, and analyze your trades to improve your performance and identify patterns. Includes AI-powered trade analysis to identify strengths and weaknesses in your trading strategy.",
    imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=1469&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/trading-journal"
  },
  {
    id: "resource-4",
    category: "education",
    categoryLabel: "Education",
    title: "Master the Markets Course",
    description: "Comprehensive trading course covering technical analysis, risk management, and trading psychology. Learn from professional traders with years of experience in various market conditions.",
    imageUrl: "https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=1470&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/trading-course"
  },
  {
    id: "resource-5",
    category: "risk",
    categoryLabel: "Risk Management",
    title: "Position Size Calculator",
    description: "Calculate optimal position sizes based on your risk tolerance and account size. Maximize returns while minimizing risk with advanced portfolio management tools.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1470&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/position-calculator"
  },
  {
    id: "resource-6",
    category: "news",
    categoryLabel: "News & Data",
    title: "Financial News Alert Service",
    description: "Get real-time alerts for market-moving news and events tailored to your watchlist. Includes earnings reports, economic data releases, and expert analysis.",
    imageUrl: "https://images.unsplash.com/photo-1565514020179-026b5f8dbcf5?q=80&w=1470&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/news-alerts"
  },
  {
    id: "resource-7",
    category: "trading",
    categoryLabel: "Trading Platform",
    title: "Charting Suite Pro",
    description: "Professional-grade charting software with over 100 indicators, drawing tools, and custom scripts. Includes cloud synchronization across devices and real-time alerts.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1470&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/charting-suite"
  },
  {
    id: "resource-8",
    category: "education",
    categoryLabel: "Education",
    title: "Options Trading Masterclass",
    description: "Learn advanced options strategies from professional traders with over 20 years of experience. Includes live trading sessions and personalized feedback on your trades.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1470&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/options-masterclass"
  },
  {
    id: "resource-9",
    category: "analysis",
    categoryLabel: "Analysis Tool",
    title: "AI Market Predictor",
    description: "Cutting-edge artificial intelligence that analyzes market patterns and predicts potential price movements with remarkable accuracy. Train the AI with your own successful trades.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1470&auto=format&fit=crop",
    link: "https://www.youraffiliatelink.com/ai-predictor"
  }
];

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>('all');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchResources() {
      setLoading(true);
      console.log("Starting resource fetch...");
      
      try {
        const fetchedResources = await getDocuments("resources");
        console.log("Fetched resources from Firebase:", fetchedResources?.length || 0);
        
        // If we got resources from Firebase, use them
        if (fetchedResources && fetchedResources.length > 0) {
          // Ensure all resources have the required properties and map them properly
          const validResources = fetchedResources
            .filter((resource: any) => {
              const isValid = resource && 
                resource.title && 
                resource.category && 
                resource.categoryLabel && 
                resource.description && 
                resource.link;
              
              if (!isValid) {
                console.log("Invalid resource filtered out:", resource);
              }
              return isValid;
            })
            .map((resource: any) => ({
              id: resource.id || undefined,
              category: resource.category as ResourceCategory,
              categoryLabel: resource.categoryLabel,
              title: resource.title,
              description: resource.description,
              imageUrl: resource.imageUrl || null,
              link: resource.link
            }));
          
          console.log("Valid resources processed:", validResources.length);
          
          // Always use Firebase data if available and valid
          if (validResources.length > 0) {
            console.log("Using Firebase resources");
            setResources(validResources);
          } else {
            console.log("No valid Firebase resources, using fallback");
            setResources(fallbackResources);
          }
        } else {
          // If Firebase returns no resources, use the complete fallback set
          console.log("No Firebase resources found, using fallback");
          setResources(fallbackResources);
        }
      } catch (error) {
        console.error("Error fetching resources from Firebase:", error);
        // Always use the complete fallback resources in case of any error
        console.log("Using fallback resources due to error");
        setResources(fallbackResources);
      } finally {
        setLoading(false);
      }
    }
    
    fetchResources();
  }, []);

  const filteredResources = activeCategory === 'all' 
    ? resources 
    : resources.filter(resource => resource.category === activeCategory);
    
  // Get unique categories from resources for dynamic tab generation
  const categories = resources.length > 0 
    ? Array.from(new Set(resources.map(resource => resource.category)))
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mwg-accent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full bg-[#0c1720] text-white min-h-screen">
      {/* Debug Info - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="w-full bg-red-900 text-white p-2 text-xs">
          <strong>DEBUG:</strong> Loaded {resources.length} resources, Categories: {categories.join(', ')}
        </div>
      )}
      
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center pt-16 pb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Affiliate <span className="text-[#f59e0b]">Resources</span>
        </h1>
        <p className="text-lg text-gray-300 mb-8 text-center max-w-2xl px-4">
          Discover the tools and resources I personally use and recommend for successful trading.
        </p>
        
        {/* Disclaimer */}
        <div className="bg-[#1a2733] border border-gray-700 rounded-lg p-4 max-w-2xl mx-4 text-sm text-gray-300 mb-10">
          <p><strong>Disclosure:</strong> Some links below are affiliate links, which means if you make a purchase after clicking, I may receive a commission. I only recommend products I personally use and believe will add value to your trading journey.</p>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="w-full max-w-6xl mx-auto mb-8 px-4">
        <div className="flex justify-center flex-wrap gap-2">
          <button 
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === 'all' ? 'bg-[#f59e0b] text-[#0c1720]' : 'bg-[#1a2733] hover:bg-[#f59e0b]/20'}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {categories.map(category => (
            <button 
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === category ? 'bg-[#f59e0b] text-[#0c1720]' : 'bg-[#1a2733] hover:bg-[#f59e0b]/20'}`}
              onClick={() => setActiveCategory(category)}
            >
              {resources.find(r => r.category === category)?.categoryLabel || category}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <section className="w-full max-w-6xl mx-auto py-4 px-4 mb-12">
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-[#1a2733] border border-gray-700 rounded-lg overflow-hidden shadow-lg">
                <div className="h-48 overflow-hidden">
                  {resource.imageUrl ? (
                    <img 
                      src={resource.imageUrl} 
                      alt={resource.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#111c25] flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="text-xs text-[#f59e0b] font-semibold mb-2">{resource.categoryLabel}</div>
                  <h3 className="font-bold text-xl mb-3">{resource.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">{resource.description}</p>
                  <a 
                    href={resource.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block w-full text-center bg-[#1e2830] text-[#f59e0b] font-medium px-4 py-2 rounded-md hover:bg-[#f59e0b] hover:text-[#0c1720] transition"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No resources found in this category.</p>
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="w-full bg-[#111c25] py-16">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Need Personalized Recommendations?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Not sure which tools are right for your trading style? Get in touch for personalized recommendations.
          </p>
          <Link href="/contact">
            <button className="bg-[#f59e0b] text-[#0c1720] font-semibold px-8 py-3 rounded-md shadow hover:brightness-110 transition">
              Contact Me
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
} 