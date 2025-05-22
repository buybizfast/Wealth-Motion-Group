"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { addDocument } from "@/lib/firebase/firebaseUtils";
import Link from "next/link";

const BLOG_COLLECTION = "blogs";

const samplePosts = [
  {
    category: "Market Analysis",
    date: "2025-05-15",
    title: "Emerging Market Trends for 2025",
    desc: "Analysis of upcoming market trends and how they might affect your investment portfolio in the coming year.",
    img: "/blog1.jpg",
  },
  {
    category: "Trading Strategy",
    date: "2025-05-10",
    title: "The Psychology of Successful Trading",
    desc: "Understanding the mental aspects of trading and how to maintain discipline in volatile markets.",
    img: "/blog2.jpg",
  },
  {
    category: "Cryptocurrency",
    date: "2025-05-05",
    title: "Bitcoin and Ethereum: A Technical Analysis",
    desc: "In-depth technical analysis of the two leading cryptocurrencies and potential price movements in 2025.",
    img: "/blog3.jpg",
  },
  {
    category: "Investment Strategy",
    date: "2025-04-28",
    title: "Building Passive Income Through Dividend Stocks",
    desc: "How to create a sustainable passive income stream by investing in quality dividend-paying stocks.",
    img: "/blog4.jpg",
  },
  {
    category: "Risk Management",
    date: "2025-04-20",
    title: "Essential Risk Management Strategies for Traders",
    desc: "Practical approaches to managing risk and protecting your capital in unpredictable markets.",
    img: "/blog5.jpg",
  },
  {
    category: "Technical Analysis",
    date: "2025-04-15",
    title: "The Top 5 Technical Indicators Every Trader Should Know",
    desc: "A breakdown of the most effective technical indicators and how to implement them in your trading.",
    img: "/blog6.jpg",
  },
];

export default function InitBlogPage() {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const initializeBlogPosts = async () => {
    if (!user) {
      setStatus("error");
      setMessage("You must be logged in as an admin to initialize blog posts.");
      return;
    }

    setStatus("loading");
    setMessage("Initializing blog posts...");

    try {
      for (const post of samplePosts) {
        await addDocument(BLOG_COLLECTION, post);
      }
      
      setStatus("success");
      setMessage("Successfully added sample blog posts to Firebase!");
    } catch (error) {
      console.error("Error initializing blog posts:", error);
      setStatus("error");
      setMessage("Failed to initialize blog posts. Check console for details.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const ADMIN_EMAILS = ["Kenneth.j1698@gmail.com", "jpotts2@mail.bradley.edu"];
  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4 text-red-500">
          You need to be logged in as an admin to access this page.
        </p>
        <Link href="/admin" className="text-mwg-accent hover:underline">
          Return to Admin Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Initialize Blog Posts</h1>
      
      <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
        <p className="font-bold">⚠️ Warning</p>
        <p>
          This utility will add 6 sample blog posts to your Firebase database. 
          These posts will be visible in both the admin dashboard and blog page.
          Use this only if you want to populate your database with sample content.
        </p>
      </div>
      
      <div className="mb-6">
        <button
          onClick={initializeBlogPosts}
          disabled={status === "loading" || status === "success"}
          className={`px-4 py-2 rounded-md ${
            status === "loading" || status === "success"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-mwg-accent text-white hover:bg-mwg-accent/90"
          }`}
        >
          {status === "loading" ? "Initializing..." : "Initialize Blog Posts"}
        </button>
      </div>
      
      {message && (
        <div
          className={`p-4 rounded ${
            status === "error"
              ? "bg-red-100 text-red-700 border border-red-300"
              : status === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-blue-100 text-blue-700 border border-blue-300"
          }`}
        >
          {message}
        </div>
      )}
      
      <div className="mt-8">
        <Link href="/admin" className="text-mwg-accent hover:underline">
          ← Return to Admin Dashboard
        </Link>
      </div>
    </div>
  );
} 