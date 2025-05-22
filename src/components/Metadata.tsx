import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface MetadataProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
  children?: React.ReactNode;
}

/**
 * SEO metadata component for Next.js pages
 */
export default function Metadata({
  title = 'Motion Wealth Group', 
  description = 'Motion Wealth Group provides financial services and wealth management solutions.',
  keywords = 'finance, wealth management, investing, financial planning',
  ogImage = '/og-image.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  canonicalUrl,
  children
}: MetadataProps) {
  const pathname = usePathname();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://motionwealthgroup.com';
  const fullUrl = canonicalUrl || `${siteUrl}${pathname}`;
  
  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      
      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Additional metadata */}
      {children}
    </Head>
  );
} 