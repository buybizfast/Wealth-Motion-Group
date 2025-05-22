// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

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

// Check footer logo data
async function checkFooterLogo() {
  try {
    const footerLogoRef = doc(db, 'siteSettings', 'footerLogo');
    const footerLogoSnap = await getDoc(footerLogoRef);
    
    if (footerLogoSnap.exists()) {
      const data = footerLogoSnap.data();
      console.log('Current footer logo data in Firebase:');
      console.log('--------------------------------------');
      console.log(`Image URL: ${data.imageUrl}`);
      console.log(`Link URL: ${data.linkUrl}`);
      console.log('--------------------------------------');
    } else {
      console.log('No footer logo document found in Firebase!');
      console.log('You need to create this document in the siteSettings collection.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking footer logo:', error);
    process.exit(1);
  }
}

// Run the check function
checkFooterLogo(); 