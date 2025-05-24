"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";

const ADMIN_EMAILS = [
  "Kenneth.j1698@gmail.com",
  "jpotts2@mail.bradley.edu"
];

export default function TestAuthPage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mwg-accent"></div>
        <p className="ml-4">Loading authentication...</p>
      </div>
    );
  }

  const isAdmin = user?.email && ADMIN_EMAILS.some(email => email.toLowerCase() === user.email?.toLowerCase());

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
        
        {!user ? (
          <div className="space-y-4">
            <p className="text-lg">You are not signed in.</p>
            <button
              onClick={signInWithGoogle}
              className="bg-mwg-accent text-white px-6 py-3 rounded-lg hover:bg-mwg-accent/90"
            >
              Sign In with Google
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-100 border border-green-400 rounded-lg p-4">
              <h2 className="text-xl font-bold text-green-800 mb-2">✅ Signed In Successfully</h2>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Display Name:</strong> {user.displayName}</p>
              <p><strong>UID:</strong> {user.uid}</p>
              <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
            </div>

            <div className={`border rounded-lg p-4 ${isAdmin ? 'bg-blue-100 border-blue-400' : 'bg-red-100 border-red-400'}`}>
              <h2 className={`text-xl font-bold mb-2 ${isAdmin ? 'text-blue-800' : 'text-red-800'}`}>
                {isAdmin ? '🔑 Admin Access Granted' : '❌ No Admin Access'}
              </h2>
              <p><strong>Admin Status:</strong> {isAdmin ? 'YES' : 'NO'}</p>
              <p><strong>Your Email:</strong> {user.email}</p>
              <p><strong>Admin Emails:</strong></p>
              <ul className="list-disc list-inside ml-4">
                {ADMIN_EMAILS.map((email, index) => (
                  <li key={index} className={user.email?.toLowerCase() === email.toLowerCase() ? 'font-bold text-green-600' : ''}>
                    {email} {user.email?.toLowerCase() === email.toLowerCase() && '← MATCH'}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="inline-block bg-mwg-accent text-white px-6 py-3 rounded-lg hover:bg-mwg-accent/90"
                >
                  Go to Admin Dashboard
                </Link>
              )}
              
              <Link 
                href="/admin/debug" 
                className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 ml-4"
              >
                View Debug Info
              </Link>
              
              <button
                onClick={signOut}
                className="block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 mt-4"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-8 pt-8 border-t">
          <Link href="/" className="text-mwg-accent hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 