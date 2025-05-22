/**
 * Helper functions to handle environment variables in Vercel
 * Vercel has specific ways of handling certain environment variables
 */

/**
 * Gets the Firebase private key from environment variables
 * Handles different formats that Vercel might store it in
 */
export function getFirebasePrivateKey(): string | undefined {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  
  if (!rawKey) {
    return undefined;
  }
  
  // Case 1: Key is already in the right format
  if (rawKey.includes('-----BEGIN PRIVATE KEY-----')) {
    return rawKey;
  }
  
  // Case 2: Key is stored with literal \n characters
  if (rawKey.includes('\\n')) {
    return rawKey.replace(/\\n/g, '\n');
  }
  
  // Case 3: Key is stored as a JSON string (common in some environments)
  if (rawKey.startsWith('"') && rawKey.endsWith('"')) {
    try {
      const parsed = JSON.parse(rawKey);
      return parsed.replace(/\\n/g, '\n');
    } catch (e) {
      // If parsing fails, just continue with other methods
    }
  }
  
  // Default: return as is
  return rawKey;
} 