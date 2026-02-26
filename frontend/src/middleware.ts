import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {

    const hasSession = request.cookies.has('JSESSIONID');
    const path = request.nextUrl.pathname;

    if (path.startsWith('/dashboard')) {
        if (!hasSession) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    if (path === '/') {
        if (hasSession) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/'],
};
