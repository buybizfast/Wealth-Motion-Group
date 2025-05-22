// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Verify environment variables are loaded
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.error('Environment variables not loaded. Make sure .env.local file exists.');
  process.exit(1);
}

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Update footer logo data
async function updateFooterLogo() {
  try {
    const footerLogoRef = doc(db, 'siteSettings', 'footerLogo');
    
    // Data to update
    const footerLogoData = {
      imageUrl: '/made by Jacq Bots.png', // Keep the existing image
      linkUrl: 'https://linktr.ee/jackybang1212' // Update with the new URL
    };
    
    // Update the document
    await setDoc(footerLogoRef, footerLogoData);
    
    console.log('Footer logo URL updated successfully to https://linktr.ee/jackybang1212');
    process.exit(0);
  } catch (error) {
    console.error('Error updating footer logo:', error);
    process.exit(1);
  }
}

// Run the update function
updateFooterLogo(); 