import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// In-memory store for rate limiting
// Note: For a production app with multiple instances, consider using Redis
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(req: NextRequest, config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }) {
  const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? 'unknown';
  const now = Date.now();
  const { maxRequests, windowMs } = config;
  
  // Get or create rate limit data for this IP
  let rateLimitData = rateLimitStore.get(ip);
  if (!rateLimitData || now > rateLimitData.resetTime) {
    rateLimitData = { count: 0, resetTime: now + windowMs };
    rateLimitStore.set(ip, rateLimitData);
  }
  
  // Increment request count
  rateLimitData.count++;
  
  // Create headers for rate limit information
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', String(maxRequests));
  headers.set('X-RateLimit-Remaining', String(Math.max(0, maxRequests - rateLimitData.count)));
  headers.set('X-RateLimit-Reset', String(Math.ceil((rateLimitData.resetTime - now) / 1000)));
  
  // Check if rate limit exceeded
  if (rateLimitData.count > maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later.' },
      { status: 429, headers }
    );
  }
  
  return null; // No rate limit hit, continue with the request
}

// Usage example: 
// export async function GET(req: NextRequest) {
//   const rateLimited = rateLimiter(req, { maxRequests: 5, windowMs: 10000 });
//   if (rateLimited) return rateLimited;
//   
//   // Process the request normally
// } 