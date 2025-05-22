import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined;
    
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey
    })
  });
}

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