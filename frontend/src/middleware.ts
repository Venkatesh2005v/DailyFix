import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't need a token
const PUBLIC_PATHS = ['/', '/oauth2/callback'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths through
    if (PUBLIC_PATHS.includes(pathname)) {
        return NextResponse.next();
    }

    // Check for token in cookie (we'll set this in the callback)
    // Note: middleware runs on edge — can't access localStorage
    // So we use a cookie as a lightweight "logged in" signal
    const tokenCookie = request.cookies.get('auth_session');

    if (!tokenCookie) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/settings/:path*'],
};