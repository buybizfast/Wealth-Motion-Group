import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';

// Initialize Firebase Admin SDK using the shared utility
const admin = initializeFirebaseAdmin();

// List of admin emails that are allowed access
const ADMIN_EMAILS = [
  "Kenneth.j1698@gmail.com",
  "jpotts2@mail.bradley.edu"
];

export async function GET(req: NextRequest) {
  // Get the Firebase ID token from the request
  const sessionCookie = req.cookies.get('session')?.value;

  if (!sessionCookie) {
    // No session cookie found
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  try {
    // Verify the session cookie
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    
    // Get the user by UID
    const user = await admin.auth().getUser(decodedClaims.uid);
    
    // Check if the user's email is in the allowed admin emails list
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
      // User is authorized as admin
      return NextResponse.json({ isAdmin: true });
    } else {
      // User is signed in but not authorized as admin
      return NextResponse.json({ isAdmin: false }, { status: 403 });
    }
  } catch (error) {
    // Error verifying the token or invalid token
    console.error('Error verifying session:', error);
    return NextResponse.json({ isAdmin: false, error: 'Invalid session' }, { status: 401 });
  }
} 