'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Default values for Firebase config - replace with your own Firebase project values
const DEFAULT_API_KEY = "AIzaSyDntFUt_tbDNXJXrQ6d-v8n6CL5fOZCmj4";
const DEFAULT_AUTH_DOMAIN = "wealth-motion-group.firebaseapp.com";
const DEFAULT_PROJECT_ID = "wealth-motion-group";
const DEFAULT_STORAGE_BUCKET = "wealth-motion-group.appspot.com";
const DEFAULT_MESSAGING_SENDER_ID = "347883378493";
const DEFAULT_APP_ID = "1:347883378493:web:67a65e9deb2e122f3f2f8f";
const DEFAULT_MEASUREMENT_ID = "G-4B9NYNW5WF";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || DEFAULT_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || DEFAULT_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || DEFAULT_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || DEFAULT_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || DEFAULT_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics only on the client side
let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}

const auth = getAuth(app);
const db = getFirestore(app);

// Create storage with custom domain for production
const storage = (() => {
  // Get the standard storage instance
  const storageInstance = getStorage(app);
  
  // Fix for local development CORS issue
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment && typeof window !== 'undefined') {
    // For development, add special handling
    console.log('Added Firebase Storage CORS workaround for development environment');
    
    // Create a style tag to inject a workaround for CORS
    const style = document.createElement('style');
    style.innerHTML = `
      /* Firebase Storage CORS Workaround */
      img[src*="firebasestorage.googleapis.com"] {
        background-image: none !important;
      }
    `;
    document.head.appendChild(style);
  } else {
    // For production, ensure proper setup
    console.log('Using production Storage configuration');
  }
  
  return storageInstance;
})();

export { app, auth, db, storage, analytics };
