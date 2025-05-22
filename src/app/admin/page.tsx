"use client";

import AdminDashboard from "@/app/components/AdminDashboard";
import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect } from "react";

export default function AdminPage() {
  const { user, loading } = useAuth();
  
  // Log authentication status to help with debugging
  useEffect(() => {
    if (loading) {
      console.log("Auth loading...");
    } else if (user) {
      console.log("User authenticated:", user.email);
    } else {
      console.log("No user authenticated");
    }
  }, [user, loading]);

  if (loading) {
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

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
      <AdminDashboard />
    </div>
  );
} 