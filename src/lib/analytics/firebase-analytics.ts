'use client';

import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';
import { useEffect, useState } from 'react';
import { app } from '@/lib/firebase/firebase';

// Type for the analytics instance
export type AnalyticsInstance = ReturnType<typeof getAnalytics> | null;

// Initialize analytics when conditions are right
export async function initializeAnalytics() {
  // Only initialize in the browser and in production
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    try {
      const isAnalyticsSupported = await isSupported();
      if (isAnalyticsSupported) {
        return getAnalytics(app);
      }
    } catch (error) {
      console.error('Failed to initialize Firebase Analytics:', error);
    }
  }
  return null;
}

// Hook to use analytics in components
export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsInstance>(null);
  
  useEffect(() => {
    // Only initialize if the user has accepted cookies
    const hasConsent = localStorage.getItem('cookie-consent') === 'accepted';
    if (hasConsent) {
      initializeAnalytics().then(setAnalytics);
    }
  }, []);
  
  // Function to log events if analytics is initialized
  const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    }
  };
  
  return { analytics, trackEvent };
}

// Analytics event tracker with optional consent check
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  // Check for consent
  const hasConsent = localStorage?.getItem('cookie-consent') === 'accepted';
  
  if (hasConsent && typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Initialize and track
    initializeAnalytics().then(analytics => {
      if (analytics) {
        logEvent(analytics, eventName, eventParams);
      }
    });
  }
} 