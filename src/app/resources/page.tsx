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

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>('all');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchResources() {
      try {
        const fetchedResources = await getDocuments("resources");
        // Ensure all resources have the required properties
        const validResources = fetchedResources
          .filter((resource: any) => 
            resource && 
            resource.title && 
            resource.category && 
            resource.categoryLabel && 
            resource.description && 
            resource.link
          )
          .map((resource: any) => ({
            id: resource.id || undefined,
            category: resource.category as ResourceCategory,
            categoryLabel: resource.categoryLabel,
            title: resource.title,
            description: resource.description,
            imageUrl: resource.imageUrl || null,
            link: resource.link
          }));
        
        setResources(validResources);
      } catch (error) {
        console.error("Error fetching resources:", error);
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
            <p className="text-gray-400">No resources found in this category. Resources will be displayed here once added through the admin dashboard.</p>
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