import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require auth
const publicRoutes = [
  '/session/access',
  '/session/new',
  '/session/verify',
  '/session/reset-password',
  '/privacy-policy',
  '/terms-of-service',
  '/guide',
  '/invoice-status',
];

function getExternalOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const host = forwardedHost || request.headers.get('host') || request.nextUrl.host;
  const proto = forwardedProto || request.nextUrl.protocol.replace(':', '') || 'https';
  return `${proto}://${host}`;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('jwt')?.value;

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isApiRoute = pathname.startsWith('/api');
  const isStaticAsset = pathname.startsWith('/_next') || pathname.includes('.');

  // Skip auth checks for API routes and static assets
  if (isApiRoute || isStaticAsset) {
    return NextResponse.next();
  }

  const externalOrigin = getExternalOrigin(request);

  // Redirect to login if no token and not on a public route
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/session/access', externalOrigin);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to home if user has token and is on a public route
  if (token && isPublicRoute) {
    const homeUrl = new URL('/', externalOrigin);
    return NextResponse.redirect(homeUrl);
  }

  // Set pathname header for any components that might need it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
