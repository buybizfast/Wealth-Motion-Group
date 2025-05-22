import { NextRequest, NextResponse } from 'next/server';
// Remove static import
// import { initializeFirebaseAdmin } from '@/lib/firebase/admin';

// Session cookie expiration (14 days)
const SESSION_EXPIRATION_TIME = 60 * 60 * 24 * 14 * 1000;

// Keep in sync with middleware.ts and Navbar.tsx
const ADMIN_EMAILS = [
  "Kenneth.j1698@gmail.com",
  "jpotts2@mail.bradley.edu"
];

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    
    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }
    
    // Dynamically import Firebase Admin
    const { initializeFirebaseAdmin } = await import('@/lib/firebase/admin');
    const admin = initializeFirebaseAdmin();
    
    // Verify the token to get the user data
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Create a session cookie from the ID token
    const sessionCookie = await admin.auth().createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRATION_TIME
    });
    
    // Set the cookie
    const response = NextResponse.json({ success: true });
    
    // Set secure cookie on the response
    response.cookies.set({
      name: 'session',
      value: sessionCookie,
      maxAge: SESSION_EXPIRATION_TIME / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict'
    });
    
    // If user is admin, set admin_status cookie
    if (decodedToken.email && ADMIN_EMAILS.includes(decodedToken.email)) {
      response.cookies.set({
        name: 'admin_status',
        value: 'true',
        maxAge: SESSION_EXPIRATION_TIME / 1000, // Same expiration as session
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict'
      });
    }
    
    return response;
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 401 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  // Clear the session cookie
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: 'session',
    value: '',
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'strict'
  });
  
  // Also clear admin_status cookie
  response.cookies.set({
    name: 'admin_status',
    value: '',
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'strict'
  });
  
  return response;
} 