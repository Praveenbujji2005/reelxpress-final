import { NextResponse } from 'next/server';

/**
 * Edge Middleware for reelXpress
 *
 * NOTE: Redirect from *.vercel.app to production domain is disabled until custom domain is live and verified.
 * Once verified, redirects will only apply when VERCEL_ENV === 'production'.
 *
 * Injects X-Robots-Tag: noindex for non-production preview deployments.
 */
export function middleware(request) {
  const response = NextResponse.next();

  // Add X-Robots-Tag: noindex for preview deployments
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public brand/assets
     */
    '/((?!_next/static|_next/image|brand/|thumbnails/|favicon.ico).*)',
  ],
};
