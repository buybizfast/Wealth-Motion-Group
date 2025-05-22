import { NextRequest, NextResponse } from 'next/server';
// Remove static import
// import { initializeFirebaseAdmin } from '@/lib/firebase/admin';

// Session cookie expiration (14 days)
const SESSION_EXPIRATION_TIME = 60 * 60 * 24 * 14 * 1000;

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
  
  return response;
} 