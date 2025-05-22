import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://motionwealthgroup.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',      // Disallow admin area
        '/api/',        // Disallow API endpoints
        '/*.json',      // Disallow JSON files
        '/*.js',        // Disallow JS files
        '/*.css',       // Disallow CSS files
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
} 