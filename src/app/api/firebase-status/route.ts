import { NextResponse } from 'next/server';

// We'll handle Firebase initialization in a try-catch to avoid breaking the app
export async function GET() {
  try {
    // Dynamically import the Firebase admin to avoid initialization during build
    const { initializeFirebaseAdmin } = await import('@/lib/firebase/admin');
    
    try {
      // Try to initialize the admin SDK
      const admin = initializeFirebaseAdmin();
      
      // Check if we can perform a basic operation
      const result = await admin.app().options;
      
      // If we get here, Firebase admin is working
      return NextResponse.json({ 
        status: 'ok',
        message: 'Firebase Admin SDK initialized successfully',
        projectId: result.projectId || 'unknown'
      });
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
      return NextResponse.json({ 
        status: 'error',
        message: 'Failed to initialize Firebase Admin SDK',
        error: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Module import error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Failed to import Firebase Admin module',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 