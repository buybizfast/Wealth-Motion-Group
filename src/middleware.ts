import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  // Check if the path starts with /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Get the session cookie from the request
    const sessionCookie = req.cookies.get('session')?.value;

    if (!sessionCookie) {
      // No session cookie, redirect to login page
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // We'll let the client-side handle the actual permission check
    // This allows us to check if the user is an admin without using firebase-admin in middleware
    // The actual admin check will happen in the /admin page component
  }

  // For all routes, continue as normal
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}; 