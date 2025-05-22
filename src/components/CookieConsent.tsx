'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show cookie consent after a short delay
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowConsent(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    // You might want to disable analytics/tracking here
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-mwg-dark border-t border-mwg-border p-4 md:p-6 z-50 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-white mb-2">
            We use cookies to improve your experience on our site and to show you relevant content.
          </p>
          <p className="text-sm text-mwg-muted">
            By clicking "Accept All", you consent to our use of cookies. Visit our{' '}
            <Link href="/privacy-policy" className="text-blue-400 hover:underline">
              Privacy Policy
            </Link>{' '}
            to learn more.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={declineCookies}
            className="px-4 py-2 bg-transparent border border-gray-500 rounded hover:bg-gray-700 text-white text-sm transition"
          >
            Decline
          </button>
          <button
            onClick={acceptCookies}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white text-sm transition"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
} 