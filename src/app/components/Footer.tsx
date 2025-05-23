"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getDocument } from "@/lib/firebase/firebaseUtils";

interface FooterLogoData {
  id?: string;
  imageUrl: string;
  linkUrl: string;
}

export default function Footer() {
  const [logoData, setLogoData] = useState<FooterLogoData>({
    imageUrl: "/made by Jacq Bots.png",
    linkUrl: "https://linktr.ee/jackybang1212" // Default to Linktree URL
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogoData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching footer logo data...");
        const data = await getDocument("siteSettings", "footerLogo") as FooterLogoData | null;
        console.log("Footer logo data:", data);
        if (data && data.linkUrl) {
          setLogoData({
            imageUrl: data.imageUrl || "/made by Jacq Bots.png",
            linkUrl: data.linkUrl // Use the URL from Firebase
          });
          console.log("Set logo link URL to:", data.linkUrl);
        } else {
          // Ensure we have a default value if data is missing
          setLogoData(prev => ({
            ...prev,
            linkUrl: "https://linktr.ee/jackybang1212"
          }));
          console.log("Using default Linktree URL");
        }
      } catch (error) {
        console.error("Error fetching footer logo data:", error);
        // Ensure we have a default value on error
        setLogoData(prev => ({
          ...prev,
          linkUrl: "https://linktr.ee/jackybang1212"
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogoData();
  }, []);

  // Function to handle logo click
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default navigation
    console.log("Logo clicked, navigating to:", logoData.linkUrl);
    // Force navigation to the external URL
    window.open(logoData.linkUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="bg-mwg-dark border-t border-mwg-border py-4 sm:py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-4">
          <p className="text-mwg-muted text-xs sm:text-sm text-center md:text-left order-2 md:order-1">
            © {new Date().getFullYear()} Motion Wealth Group. All rights reserved.
          </p>
          <div className="order-1 md:order-2">
            {/* Add onClick handler and ensure href is absolute */}
            <a 
              href={logoData.linkUrl}
              onClick={handleLogoClick}
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Image 
                src={logoData.imageUrl} 
                alt="Jacq Bots Logo Banner" 
                width={180} 
                height={60}
                sizes="(max-width: 640px) 180px, 240px"
                className="object-contain w-auto h-12 sm:h-16" 
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 