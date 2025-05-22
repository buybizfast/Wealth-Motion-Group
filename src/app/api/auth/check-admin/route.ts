import { NextRequest, NextResponse } from 'next/server';
// Remove static import of Firebase Admin
// import { initializeFirebaseAdmin } from '@/lib/firebase/admin';

// List of admin emails that are allowed access
const ADMIN_EMAILS = [
  "Kenneth.j1698@gmail.com",
  "jpotts2@mail.bradley.edu",
  // Add any other admin emails here for debugging
  process.env.NODE_ENV === 'development' ? "*" : "" // In development, allow any email
].filter(Boolean); // Remove empty strings

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
    
    // Check if we're in development mode and allowing all emails
    if (process.env.NODE_ENV && process.env.NODE_ENV.includes('dev') && ADMIN_EMAILS.includes("*")) {
      console.log('Development mode: treating all users as admins');
      return NextResponse.json({ isAdmin: true });
    }
    
    // Case-insensitive check if the user's email is in the allowed admin emails list
    if (user.email && ADMIN_EMAILS.some(email => email.toLowerCase() === user.email?.toLowerCase())) {
      // User is authorized as admin
      console.log('User is authorized as admin');
      
      // Create a successful response with the user's admin status
      const response = NextResponse.json({ isAdmin: true });
      
      // Make sure the session cookie is properly set in the response
      response.cookies.set({
        name: 'admin_status',
        value: 'true',
        maxAge: 60 * 60, // 1 hour
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict'
      });
      
      return response;
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