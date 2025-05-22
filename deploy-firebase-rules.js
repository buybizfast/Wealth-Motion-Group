const { execSync } = require('child_process');

console.log('Deploying Firebase security rules...');

try {
  // Deploy Firestore rules
  console.log('Deploying Firestore security rules...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  console.log('Firestore security rules deployed successfully!');
  
  console.log('\nAll Firebase security rules deployed successfully!');
} catch (error) {
  console.error('Error deploying Firebase security rules:', error);
  process.exit(1);
} 