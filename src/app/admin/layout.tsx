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
    const checkAdmin = () => {
      if (loading) return;
      
      if (!user) {
        console.log('AdminLayout - No user found, redirecting to home');
        router.push('/');
        return;
      }
      
      console.log('AdminLayout - Checking admin status for user:', user.email);
      console.log('AdminLayout - Admin emails list:', ADMIN_EMAILS);
      console.log('AdminLayout - User email type:', typeof user.email);
      console.log('AdminLayout - User email raw:', JSON.stringify(user.email));
      
      // Check if user email is in the admin list (case insensitive) - CLIENT-SIDE ONLY
      if (user.email && ADMIN_EMAILS.some(email => email.toLowerCase() === user.email?.toLowerCase())) {
        console.log('AdminLayout - User is authorized as admin');
        setIsVerifying(false);
      } else {
        // Not an admin, redirect to home
        console.log('AdminLayout - User is not an admin, redirecting to home');
        router.push('/');
      }
    };
    
    checkAdmin();
  }, [user, loading, router]);
  
  if (loading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mwg-accent"></div>
        <p className="ml-4">Verifying admin access...</p>
      </div>
    );
  }
  
  return <>{children}</>;
} 