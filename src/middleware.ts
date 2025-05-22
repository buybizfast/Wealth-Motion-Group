import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined;
    
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey
    })
  });
}

// List of admin emails that are allowed access
const ADMIN_EMAILS = [
  "Kenneth.j1698@gmail.com",
  "jpotts2@mail.bradley.edu"
];

export async function middleware(req: NextRequest) {
  // Check if the path starts with /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Get the Firebase ID token from the request
    const sessionCookie = req.cookies.get('session')?.value;

    if (!sessionCookie) {
      // Redirect to login or home page if no session cookie
      return NextResponse.redirect(new URL('/', req.url));
    }

    try {
      // Verify the session cookie
      const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
      
      // Get the user by UID
      const user = await getAuth().getUser(decodedClaims.uid);
      
      // Check if the user's email is in the allowed admin emails list
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        // User is authorized as admin, allow the request
        return NextResponse.next();
      } else {
        // User is signed in but not authorized as admin
        return NextResponse.redirect(new URL('/', req.url));
      }
    } catch (error) {
      // Error verifying the token or invalid token
      console.error('Error verifying session:', error);
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // For non-admin routes, continue as normal
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}; 