import { NextRequest, NextResponse } from 'next/server';
// Remove static import of Firebase Admin
// import { initializeFirebaseAdmin } from '@/lib/firebase/admin';

// List of admin emails that are allowed access
const ADMIN_EMAILS = [
  "Kenneth.j1698@gmail.com",
  "jpotts2@mail.bradley.edu"
].filter(Boolean); // Remove empty strings

export async function GET(req: NextRequest) {
  // BYPASSING ALL CHECKS - ALWAYS RETURN SUCCESS
  console.log('BYPASSING ADMIN API CHECK - Always returning success');
  
  // Create a successful response with admin status
  const response = NextResponse.json({ isAdmin: true });
  
  // Set the admin_status cookie
  response.cookies.set({
    name: 'admin_status',
    value: 'true',
    maxAge: 60 * 60 * 24, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'strict'
  });
  
  return response;
} 