import * as admin from 'firebase-admin';
import { getFirebasePrivateKey } from './vercel-firebase-helper';

/**
 * Initializes the Firebase Admin SDK if it hasn't been initialized yet
 * Using a more thorough approach for handling credentials across environments
 */
export function initializeFirebaseAdmin() {
  if (admin.apps.length) {
    return admin;
  }

  try {
    // Get the properly formatted private key
    const privateKey = getFirebasePrivateKey();
    
    // Check if we have all the required service account credentials
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
      // Initialize with service account credentials
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
    } else {
      // Fall back to auto-detection (for Google Cloud environments)
      admin.initializeApp();
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    
    // If all else fails, try application default credentials
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } catch (fallbackError) {
      console.error('Failed to initialize Firebase Admin with fallback method:', fallbackError);
      throw new Error('Could not initialize Firebase Admin SDK');
    }
  }

  return admin;
} 