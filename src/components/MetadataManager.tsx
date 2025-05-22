'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

interface MetadataManagerProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterCreator?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

/**
 * Client-side metadata enhancements for App Router
 * Note: Most SEO metadata should be defined in layout.tsx or page.tsx metadata export
 * This component is for client-side metadata that can't be set in static metadata
 */
export default function MetadataManager({
  title,
  description,
  ogImage,
  ogType = 'website',
  ogUrl,
  twitterCard = 'summary_large_image',
  twitterCreator = '@motionwealthgrp',
  publishedTime,
  modifiedTime,
  author,
}: MetadataManagerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Update metadata when pathname or search params change
  useEffect(() => {
    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const queryString = searchParams?.toString() ? `?${searchParams.toString()}` : '';
    const fullUrl = `${baseUrl}${pathname}${queryString}`;
    
    // Set canonical
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullUrl);
    
    // Set additional dynamic meta tags if provided
    if (title) {
      document.title = title;
    }
    
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    // Set Open Graph meta tags
    if (ogUrl || fullUrl) {
      setMetaTag('property', 'og:url', ogUrl || fullUrl);
    }
    
    if (ogType) {
      setMetaTag('property', 'og:type', ogType);
    }
    
    if (title) {
      setMetaTag('property', 'og:title', title);
    }
    
    if (description) {
      setMetaTag('property', 'og:description', description);
    }
    
    if (ogImage) {
      setMetaTag('property', 'og:image', ogImage);
    }

    // Set Twitter meta tags
    if (twitterCard) {
      setMetaTag('name', 'twitter:card', twitterCard);
    }
    
    if (title) {
      setMetaTag('name', 'twitter:title', title);
    }
    
    if (description) {
      setMetaTag('name', 'twitter:description', description);
    }
    
    if (twitterCreator) {
      setMetaTag('name', 'twitter:creator', twitterCreator);
    }
    
    if (ogImage) {
      setMetaTag('name', 'twitter:image', ogImage);
    }

    // Set article meta tags if applicable
    if (publishedTime) {
      setMetaTag('property', 'article:published_time', publishedTime);
    }
    
    if (modifiedTime) {
      setMetaTag('property', 'article:modified_time', modifiedTime);
    }
    
    if (author) {
      setMetaTag('property', 'article:author', author);
    }
  }, [pathname, searchParams, title, description, ogImage, ogType, ogUrl, twitterCard, twitterCreator, publishedTime, modifiedTime, author]);

  // Helper function to set meta tags
  const setMetaTag = (attributeType: string, name: string, content: string) => {
    let metaTag = document.querySelector(`meta[${attributeType}="${name}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute(attributeType, name);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', content);
  };

  return (
    <>
      {/* Google Analytics Script */}
      <Script 
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
} 