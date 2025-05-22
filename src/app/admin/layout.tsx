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
        console.log('No user found, redirecting to home');
        router.push('/');
        return;
      }
      
      console.log('Checking admin status for user:', user.email);
      
      // Check if user email is in the admin list (case insensitive)
      if (user.email && ADMIN_EMAILS.some(email => email.toLowerCase() === user.email?.toLowerCase())) {
        console.log('User is authorized as admin on client-side');
        
        // Also verify with the server
        try {
          const response = await fetch('/api/auth/check-admin');
          const data = await response.json();
          
          if (data.isAdmin) {
            console.log('Server confirmed admin status');
            setIsVerifying(false);
          } else {
            console.log('Server rejected admin status');
            router.push('/');
          }
        } catch (error) {
          console.error('Error verifying admin status with server:', error);
          router.push('/');
        }
      } else {
        // Not an admin, redirect to home
        console.log('User is not an admin, redirecting to home');
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