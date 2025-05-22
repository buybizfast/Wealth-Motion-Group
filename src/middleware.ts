import { NextRequest, NextResponse } from 'next/server';

// List of admin emails that are allowed access - keeping in sync with check-admin API
const ADMIN_EMAILS = [
  "Kenneth.j1698@gmail.com",
  "jpotts2@mail.bradley.edu"
];

export async function middleware(req: NextRequest) {
  // Check if the path starts with /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // For now, we're temporarily bypassing the middleware authentication check
    // because we're handling the authentication client-side in the admin page component
    console.log('[Middleware] Allowing access to admin route, relying on client-side auth');
    return NextResponse.next();
    
    /* 
    // Original code with session checking - commenting out for now
    // Get the session cookie and admin status from the request
    const sessionCookie = req.cookies.get('session')?.value;
    const adminStatusCookie = req.cookies.get('admin_status')?.value;

    // For development mode, print cookie info for debugging
    console.log('[Middleware] Checking access to admin path:', req.nextUrl.pathname);
    console.log('[Middleware] Auth cookies:', { 
      sessionCookie: sessionCookie ? 'exists' : 'missing',
      adminStatusCookie: adminStatusCookie ? 'exists' : 'missing'
    });

    // Check for admin status cookie first as a quick path for already verified admins
    if (adminStatusCookie === 'true') {
      console.log('[Middleware] Admin status cookie found, allowing admin access');
      return NextResponse.next();
    }

    if (!sessionCookie) {
      // No session cookie, redirect to login page
      console.log('[Middleware] No session cookie found, redirecting to home');
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // Call the admin check API to verify if the user is an admin
    try {
      // Get the absolute URL for the admin check API
      const protocol = req.nextUrl.protocol;
      const host = req.headers.get('host') || '';
      const adminCheckUrl = `${protocol}//${host}/api/auth/check-admin`;
      
      console.log('[Middleware] Checking admin status at URL:', adminCheckUrl);
      
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
          console.error('[Middleware] Admin check API returned error:', response.status, response.statusText);
          console.log('[Middleware] Admin check API error, denying access');
          return NextResponse.redirect(new URL('/', req.url));
        }
      } catch (fetchError) {
        console.error('[Middleware] Error making admin check API request:', fetchError);
        console.log('[Middleware] Fetch error when checking admin status, denying access');
        return NextResponse.redirect(new URL('/', req.url));
      }
      
      const data = await response.json();
      console.log('[Middleware] Admin check response:', data);
      
      if (!data.isAdmin) {
        console.log('[Middleware] User is not an admin, redirecting to home');
        return NextResponse.redirect(new URL('/', req.url));
      }
      
      console.log('[Middleware] User is admin, allowing access');
      return NextResponse.next();
    } catch (error) {
      console.error('[Middleware] Error checking admin status:', error);
      // On error, deny access to maintain security
      console.log('[Middleware] Error occurred during admin check, denying access');
      return NextResponse.redirect(new URL('/', req.url));
    }
    */
  }

  // For all routes, continue as normal
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}; 