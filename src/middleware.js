import { NextResponse } from 'next/server';

/**
 * Edge Middleware for reelXpress
 *
 * 1. Enforces 301 permanent redirect from *.vercel.app staging domains to production domain
 * 2. Injects X-Robots-Tag: noindex for preview deployments
 */
export function middleware(request) {
  const host = request.headers.get('host') || '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.reelxpress.com';

  // 1. Permanent redirect (301) from *.vercel.app to production domain
  if (host.includes('.vercel.app')) {
    const targetUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, siteUrl);
    return NextResponse.redirect(targetUrl, 301);
  }

  const response = NextResponse.next();

  // 2. Add X-Robots-Tag: noindex for preview deployments
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
