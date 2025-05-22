"use client";

import AdminDashboard from "@/app/components/AdminDashboard";
import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Keep in sync with middleware.ts and Navbar.tsx
const ADMIN_EMAILS = [
  "Kenneth.j1698@gmail.com",
  "jpotts2@mail.bradley.edu"
];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const router = useRouter();
  
  // Check if user is an admin
  useEffect(() => {
    if (loading) {
      console.log("Auth loading...");
      return;
    }
    
    if (!user) {
      console.log("No user authenticated");
      setCheckingAdmin(false);
      return;
    }
    
    console.log("User authenticated:", user.email);
    
    // Check if user email is in allowed admin emails
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
      console.log("User is an admin - displaying dashboard");
      setIsAdmin(true);
      setCheckingAdmin(false);
    } else {
      console.log("User is not an admin");
      setIsAdmin(false);
      setCheckingAdmin(false);
      // Redirect to home if not an admin after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }
  }, [user, loading, router]);

  if (loading || checkingAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mwg-accent"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded w-full max-w-lg">
          <p className="font-bold">Access Denied</p>
          <p>You must be logged in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded w-full max-w-lg">
          <p className="font-bold">Access Denied</p>
          <p>Your account ({user.email}) is not authorized to access the admin dashboard.</p>
          <p>Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
      <AdminDashboard />
    </div>
  );
} 