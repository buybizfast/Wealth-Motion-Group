import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  // Check if the path starts with /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Get the session cookie from the request
    const sessionCookie = req.cookies.get('session')?.value;

    if (!sessionCookie) {
      // No session cookie, redirect to login page
      console.log('No session cookie found, redirecting to home');
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // Call the admin check API to verify if the user is an admin
    try {
      // Get the absolute URL for the admin check API
      const protocol = req.nextUrl.protocol;
      const host = req.headers.get('host') || '';
      const adminCheckUrl = `${protocol}//${host}/api/auth/check-admin`;
      
      console.log('Checking admin status at URL:', adminCheckUrl);
      
      // Call the API with the session cookie
      const response = await fetch(adminCheckUrl, {
        headers: {
          Cookie: `session=${sessionCookie}`
        },
        cache: 'no-store' // Prevent caching issues
      });
      
      if (!response.ok) {
        console.error('Admin check API returned error:', response.status, response.statusText);
        // For troubleshooting, let the user through during development
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: allowing access despite API error');
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/', req.url));
      }
      
      const data = await response.json();
      console.log('Admin check response:', data);
      
      if (!data.isAdmin) {
        console.log('User is not an admin, redirecting to home');
        return NextResponse.redirect(new URL('/', req.url));
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      // For troubleshooting, let the user through during development
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: allowing access despite error');
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // For all routes, continue as normal
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}; 