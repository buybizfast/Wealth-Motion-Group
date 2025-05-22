'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

// List of admin emails (duplicated here for client-side verification)
const ADMIN_EMAILS = [
  "Kenneth.j1698@gmail.com",
  "jpotts2@mail.bradley.edu"
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  
  useEffect(() => {
    // Check if the user is authenticated and is an admin
    const checkAdmin = async () => {
      if (loading) return;
      
      if (!user) {
        router.push('/');
        return;
      }
      
      // Check if user email is in the admin list
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        setIsVerifying(false);
      } else {
        // Not an admin, redirect to home
        router.push('/');
      }
    };
    
    checkAdmin();
  }, [user, loading, router]);
  
  if (loading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return <>{children}</>;
} 