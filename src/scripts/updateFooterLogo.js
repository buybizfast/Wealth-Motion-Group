// This is a one-time script to update the footer logo URL
// It uses the existing Firebase utils from the project

const { db } = require('../lib/firebase/firebase');
const { doc, setDoc } = require('firebase/firestore');

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
  } catch (error) {
    console.error('Error updating footer logo:', error);
  }
}

// Run the update function
updateFooterLogo(); 