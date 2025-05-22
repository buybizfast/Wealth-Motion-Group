import { NextRequest, NextResponse } from 'next/server';

// List of admin emails that are allowed access - keeping in sync with check-admin API
const ADMIN_EMAILS = [
  "Kenneth.j1698@gmail.com",
  "jpotts2@mail.bradley.edu"
];

export async function middleware(req: NextRequest) {
  // Check if the path starts with /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // COMPLETELY BYPASSING ALL SERVER-SIDE AUTH CHECKS
    // Client-side checks in the components will handle authorization
    console.log('[Middleware] ALLOWING ALL ACCESS to admin route, relying ONLY on client-side auth');
    return NextResponse.next();
  }

  // For all routes, continue as normal
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}; 