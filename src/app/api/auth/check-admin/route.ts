import { NextRequest, NextResponse } from 'next/server';
// Remove static import of Firebase Admin
// import { initializeFirebaseAdmin } from '@/lib/firebase/admin';

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
    // Dynamically import Firebase Admin to prevent initialization during build
    const { initializeFirebaseAdmin } = await import('@/lib/firebase/admin');
    const admin = initializeFirebaseAdmin();

    // Verify the session cookie
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    
    // Get the user by UID
    const user = await admin.auth().getUser(decodedClaims.uid);
    
    console.log('Checking admin status for user:', user.email);
    console.log('Admin emails:', ADMIN_EMAILS);
    
    // Case-insensitive check if the user's email is in the allowed admin emails list
    if (user.email && ADMIN_EMAILS.some(email => email.toLowerCase() === user.email?.toLowerCase())) {
      // User is authorized as admin
      console.log('User is authorized as admin');
      return NextResponse.json({ isAdmin: true });
    } else {
      // User is signed in but not authorized as admin
      console.log('User is not authorized as admin');
      return NextResponse.json({ isAdmin: false }, { status: 403 });
    }
  } catch (error) {
    // Error verifying the token or invalid token
    console.error('Error verifying session:', error);
    return NextResponse.json({ isAdmin: false, error: 'Invalid session' }, { status: 401 });
  }
} 