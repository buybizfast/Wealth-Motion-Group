'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import MetadataManager from './MetadataManager';
import JsonLd from './JsonLd';
import { generateBreadcrumbSchema } from '@/lib/utils/structuredData';

interface SeoHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  category?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  schemaData?: Record<string, any>;
}

/**
 * A component that centralizes SEO implementation
 * Combines JsonLd structured data and MetadataManager
 */
export default function SeoHead({
  title,
  description,
  ogImage,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  author,
  category,
  breadcrumbs,
  schemaData
}: SeoHeadProps) {
  const pathname = usePathname() || '/';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://motionwealthgroup.com';
  
  // Generate breadcrumb schema if breadcrumbs are provided
  const breadcrumbSchema = useMemo(() => {
    if (!breadcrumbs) {
      // Generate default breadcrumbs based on the current path
      const segments = pathname.split('/').filter(Boolean);
      
      const items = [
        { name: 'Home', url: baseUrl }
      ];
      
      let currentPath = '';
      
      segments.forEach(segment => {
        currentPath += `/${segment}`;
        
        // Format segment for display (uppercase first letter, replace hyphens)
        const formattedName = segment
          .replace(/-/g, ' ')
          .replace(/^\w/, c => c.toUpperCase());
          
        items.push({
          name: formattedName,
          url: `${baseUrl}${currentPath}`
        });
      });
      
      return generateBreadcrumbSchema(items);
    }
    
    return generateBreadcrumbSchema(breadcrumbs);
  }, [pathname, breadcrumbs, baseUrl]);

  return (
    <>
      <MetadataManager
        title={title}
        description={description}
        ogImage={ogImage}
        ogType={ogType}
        ogUrl={`${baseUrl}${pathname}`}
        publishedTime={publishedTime}
        modifiedTime={modifiedTime}
        author={author}
      />
      
      {/* Include custom schema data if provided */}
      {schemaData && <JsonLd data={schemaData} />}
      
      {/* Always include breadcrumb schema */}
      <JsonLd data={breadcrumbSchema} />
    </>
  );
} 