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
    
    // Call the admin check API to verify if the user is an admin
    try {
      // Get the absolute URL for the admin check API
      const protocol = req.nextUrl.protocol;
      const host = req.headers.get('host') || '';
      const adminCheckUrl = `${protocol}//${host}/api/auth/check-admin`;
      
      // Call the API with the session cookie
      const response = await fetch(adminCheckUrl, {
        headers: {
          Cookie: `session=${sessionCookie}`
        }
      });
      
      if (!response.ok) {
        // Not an admin, redirect to home page
        return NextResponse.redirect(new URL('/', req.url));
      }
      
      const data = await response.json();
      
      if (!data.isAdmin) {
        // Not an admin, redirect to home page
        return NextResponse.redirect(new URL('/', req.url));
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      // If there's an error, redirect to home page
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // For all routes, continue as normal
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}; 