import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  // Check if the path starts with /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Get the session cookie and admin status from the request
    const sessionCookie = req.cookies.get('session')?.value;
    const adminStatusCookie = req.cookies.get('admin_status')?.value;

    // For development mode, print cookie info for debugging
    if (process.env.NODE_ENV && process.env.NODE_ENV.includes('dev')) {
      console.log('Auth cookies:', { 
        sessionCookie: sessionCookie ? 'exists' : 'missing',
        adminStatusCookie: adminStatusCookie ? 'exists' : 'missing'
      });
    }

    // Check for admin status cookie first as a quick path for already verified admins
    if (adminStatusCookie === 'true') {
      console.log('Admin status cookie found, allowing admin access');
      return NextResponse.next();
    }

    if (!sessionCookie) {
      // No session cookie, redirect to login page
      console.log('No session cookie found, redirecting to home');
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // In development, always allow access to admin route
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: allowing access to admin route');
      return NextResponse.next();
    }
    
    // Call the admin check API to verify if the user is an admin
    try {
      // Get the absolute URL for the admin check API
      const protocol = req.nextUrl.protocol;
      const host = req.headers.get('host') || '';
      const adminCheckUrl = `${protocol}//${host}/api/auth/check-admin`;
      
      console.log('Checking admin status at URL:', adminCheckUrl);
      
      // Call the API with the session cookie
      let response;
      try {
        response = await fetch(adminCheckUrl, {
          headers: {
            Cookie: `session=${sessionCookie}`
          },
          cache: 'no-store' // Prevent caching issues
        });
        
        if (!response.ok) {
          console.error('Admin check API returned error:', response.status, response.statusText);
          // For development mode only, allow access despite errors
          if (process.env.NODE_ENV && process.env.NODE_ENV.includes('dev')) {
            console.log('Development mode: allowing access despite API error');
            return NextResponse.next();
          }
          return NextResponse.redirect(new URL('/', req.url));
        }
      } catch (fetchError) {
        console.error('Error making admin check API request:', fetchError);
        // For development mode only, allow access despite errors
        if (process.env.NODE_ENV && process.env.NODE_ENV.includes('dev')) {
          console.log('Development mode: allowing access despite fetch error');
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
      // On error, allow access to prevent getting locked out
      console.log('Error occurred, but allowing access to prevent lockout');
      return NextResponse.next();
    }
  }

  // For all routes, continue as normal
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}; 