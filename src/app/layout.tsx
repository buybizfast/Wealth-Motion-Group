import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { Metadata } from "next";
import MetadataManager from "@/components/MetadataManager";
import CookieConsent from "@/components/CookieConsent";
import JsonLd from "@/components/JsonLd";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/utils/structuredData";

// Define default metadata for the application
export const metadata: Metadata = {
  title: {
    template: '%s | Motion Wealth Group',
    default: 'Motion Wealth Group - Financial Services & Wealth Management',
  },
  description: 'Motion Wealth Group provides expert financial services, investment strategies, and wealth management solutions to help you achieve your financial goals.',
  keywords: 'wealth management, financial services, investing, financial planning, retirement planning',
  creator: 'Motion Wealth Group',
  publisher: 'Motion Wealth Group',
  authors: [{ name: 'Motion Wealth Group' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://motionwealthgroup.com',
    siteName: 'Motion Wealth Group',
    title: 'Motion Wealth Group - Financial Services & Wealth Management',
    description: 'Expert financial services and wealth management solutions',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Motion Wealth Group',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motion Wealth Group - Financial Services & Wealth Management',
    description: 'Expert financial services and wealth management solutions',
    creator: '@motionwealthgrp',
    images: ['/twitter-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  metadataBase: new URL('https://motionwealthgroup.com'),
  alternates: {
    canonical: '/',
  },
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://motionwealthgroup.com';

// Create structured data objects
const organizationData = {
  name: 'Motion Wealth Group',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: 'Motion Wealth Group provides expert financial services, investment strategies, and wealth management solutions to help you achieve your financial goals.',
  email: 'contact@motionwealthgroup.com',
  telephone: '+1-555-123-4567',
  address: {
    streetAddress: '123 Financial Ave',
    addressLocality: 'Wealth City',
    addressRegion: 'WC',
    postalCode: '12345',
    addressCountry: 'US',
  },
  sameAs: [
    'https://twitter.com/motionwealthgrp',
    'https://facebook.com/motionwealthgroup',
    'https://linkedin.com/company/motion-wealth-group',
  ],
};

const websiteData = {
  name: 'Motion Wealth Group',
  url: BASE_URL,
  description: 'Motion Wealth Group provides expert financial services, investment strategies, and wealth management solutions to help you achieve your financial goals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = generateOrganizationSchema(organizationData);
  const websiteSchema = generateWebsiteSchema(websiteData);

  return (
    <html lang="en">
      <body className="bg-[#193042] text-white min-h-screen flex flex-col font-sans">
        <AuthProvider>
          <JsonLd data={organizationSchema} />
          <JsonLd data={websiteSchema} />
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-4">{children}</main>
          <Footer />
          <CookieConsent />
          <MetadataManager />
        </AuthProvider>
      </body>
    </html>
  );
}
