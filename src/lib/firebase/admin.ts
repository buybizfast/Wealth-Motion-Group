import * as admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK if it hasn't been initialized yet
 * Properly handles private key formatting from environment variables
 */
export function initializeFirebaseAdmin() {
  if (admin.apps.length) {
    return admin;
  }

  // Handle the private key - it comes from Vercel environment variables 
  // with escaped newlines that need to be converted to actual newlines
  let privateKey;
  
  try {
    // First try parsing it directly in case it's already properly formatted
    privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    // If it's a JSON string (sometimes environment variables get stored this way)
    if (privateKey && privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = JSON.parse(privateKey);
    }
    
    // Replace escaped newlines with actual newlines
    if (privateKey && typeof privateKey === 'string') {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
  } catch (error) {
    console.error('Error parsing Firebase private key:', error);
    throw new Error('Invalid Firebase private key format');
  }

  // Initialize the app with the service account credentials
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });

  return admin;
} 