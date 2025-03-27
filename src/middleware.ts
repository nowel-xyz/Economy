import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { BACKEND_API } from '../src/utils/urls';

export async function middleware(req: NextRequest) {
    const excludedPaths = ['/login', '/register'];

    if (excludedPaths.includes(req.nextUrl.pathname)) {
        return NextResponse.next();
    }


    const cookie = req.headers.get('cookie');

    const userRes = await fetch(`${BACKEND_API}/users/@me/session`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(cookie ? { cookie } : {}),
        },
        credentials: 'include',
    });

    if (!userRes.ok) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if (req.nextUrl.pathname.startsWith('/tenants')) {
        const tenantid = req.nextUrl.pathname.split('/')[2];
        if (!tenantid) {
            return NextResponse.redirect(new URL('/', req.url));
        }

        try {
            
            const res = await fetch(`${BACKEND_API}/tenant/${tenantid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(cookie ? { cookie } : {}),
                },
                credentials: 'include',
            });

            if (!res.ok) {
                console.error('Error fetching tenant:', res.statusText);
                return NextResponse.redirect(new URL('/', req.url));
            }

            const data = await res.json();

            // Set the tenant data in response headers
            const response = NextResponse.next();
            response.headers.set('x-tenant-data', JSON.stringify(data));
            return response;
        } catch (error) {
            console.error('Failed to fetch tenant:', error);
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    const sessionToken = req.cookies.get('sessionToken');
    if (!sessionToken) {
        return NextResponse.redirect(new URL(`/login?redirect_uri=${req.nextUrl.pathname}`, req.url));
    }

    return NextResponse.next();
}

// Apply middleware to all paths except static files
export const config = {
    matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
