'use client';

import { useEffect } from 'react';

interface JsonLdProps {
  data: Record<string, any>;
}

/**
 * Component for adding structured data (JSON-LD) to pages
 * @param data - The structured data object to be converted to JSON-LD
 */
export default function JsonLd({ data }: JsonLdProps) {
  useEffect(() => {
    // Add JSON-LD to the page
    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    
    // Cleanup
    return () => {
      document.head.removeChild(script);
    };
  }, [data]);

  // This component doesn't render anything visible
  return null;
} 