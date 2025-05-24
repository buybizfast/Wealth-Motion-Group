"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect, useState } from "react";

const ADMIN_EMAILS = [
  "Kenneth.j1698@gmail.com",
  "jpotts2@mail.bradley.edu"
];

export default function AdminDebugPage() {
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (!loading && user) {
      const info = {
        userEmail: user.email,
        userEmailType: typeof user.email,
        userEmailLength: user.email?.length,
        userEmailRaw: JSON.stringify(user.email),
        adminEmails: ADMIN_EMAILS,
        comparisons: ADMIN_EMAILS.map(email => ({
          adminEmail: email,
          adminEmailLower: email.toLowerCase(),
          userEmailLower: user.email?.toLowerCase(),
          exactMatch: email === user.email,
          caseInsensitiveMatch: email.toLowerCase() === user.email?.toLowerCase(),
          includes: ADMIN_EMAILS.includes(user.email || ''),
          someMatch: ADMIN_EMAILS.some(e => e.toLowerCase() === user.email?.toLowerCase())
        })),
        isAdmin: user.email && ADMIN_EMAILS.some(email => email.toLowerCase() === user.email?.toLowerCase()),
        userObject: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          providerData: user.providerData
        }
      };
      setDebugInfo(info);
      console.log("Debug Info:", info);
    }
  }, [user, loading]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return <div className="p-8">No user authenticated. Please sign in first.</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Authentication Debug</h1>
      
      {debugInfo && (
        <div className="space-y-6">
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-bold mb-2">User Information</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo.userObject, null, 2)}
            </pre>
          </div>

          <div className="bg-blue-100 p-4 rounded">
            <h2 className="font-bold mb-2">Email Analysis</h2>
            <p><strong>User Email:</strong> {debugInfo.userEmail}</p>
            <p><strong>Email Type:</strong> {debugInfo.userEmailType}</p>
            <p><strong>Email Length:</strong> {debugInfo.userEmailLength}</p>
            <p><strong>Email Raw:</strong> {debugInfo.userEmailRaw}</p>
          </div>

          <div className="bg-yellow-100 p-4 rounded">
            <h2 className="font-bold mb-2">Admin Status</h2>
            <p><strong>Is Admin:</strong> {debugInfo.isAdmin ? 'YES' : 'NO'}</p>
            <p><strong>Admin Emails:</strong> {JSON.stringify(debugInfo.adminEmails)}</p>
          </div>

          <div className="bg-green-100 p-4 rounded">
            <h2 className="font-bold mb-2">Email Comparisons</h2>
            {debugInfo.comparisons.map((comp: any, index: number) => (
              <div key={index} className="mb-2 p-2 bg-white rounded">
                <p><strong>Admin Email:</strong> {comp.adminEmail}</p>
                <p><strong>Exact Match:</strong> {comp.exactMatch ? 'YES' : 'NO'}</p>
                <p><strong>Case Insensitive Match:</strong> {comp.caseInsensitiveMatch ? 'YES' : 'NO'}</p>
                <p><strong>Includes Check:</strong> {comp.includes ? 'YES' : 'NO'}</p>
                <p><strong>Some Match:</strong> {comp.someMatch ? 'YES' : 'NO'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 