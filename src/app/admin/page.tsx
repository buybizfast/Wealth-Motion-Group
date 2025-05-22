"use client";

import AdminDashboard from "@/app/components/AdminDashboard";

export default function AdminPage() {
  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
      <AdminDashboard />
    </div>
  );
} 