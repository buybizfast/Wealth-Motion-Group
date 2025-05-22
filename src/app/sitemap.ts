import { MetadataRoute } from 'next';
import { getDocuments } from '@/lib/firebase/firebaseUtils';

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://motionwealthgroup.com';
  
  // Define static routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as ChangeFrequency,
      priority: 0.9,
    },
  ];
  
  // Get dynamic blog routes
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await getDocuments('blogPosts');
    blogRoutes = posts.map((post: any) => ({
      url: `${baseUrl}/blog/${post.id}`,
      lastModified: post.date ? new Date(post.date) : new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error generating blog routes for sitemap:', error);
  }
  
  // Get dynamic resource routes if you have individual resource pages
  let resourceRoutes: MetadataRoute.Sitemap = [];
  try {
    const resources = await getDocuments('resources');
    resourceRoutes = resources.map((resource: any) => ({
      url: `${baseUrl}/resources/${resource.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error generating resource routes for sitemap:', error);
  }
  
  // Combine all routes
  return [...staticRoutes, ...blogRoutes, ...resourceRoutes];
} 