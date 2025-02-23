import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const excludedPaths = ['/login', '/register'];
    console.log(req.nextUrl.pathname);

    if (excludedPaths.includes(req.nextUrl.pathname)) {
        return NextResponse.next();
    }

    const cookie = req.cookies.get('sessionToken');
    if (!cookie) {
        return NextResponse.redirect(new URL(`/login?redirect_uri=${req.nextUrl.pathname}`, req.url));
    }

    return NextResponse.next();
}

// Apply middleware to all paths except static files
export const config = {
    matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
