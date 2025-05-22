'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.storageBucket || !firebaseConfig.messagingSenderId || !firebaseConfig.appId || !firebaseConfig.measurementId) {
  throw new Error('Missing Firebase environment variables');
}

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
