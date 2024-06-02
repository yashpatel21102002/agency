import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/', '/agency']);



export default clerkMiddleware((auth, request) => {
    //will check what is the url and rewrite the url based on that;
    const url = request.nextUrl;
    const searchParams = url.searchParams.toString();
    let hostname = request.headers;

    const pathWithSearchParams = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`

    //if subdomain exists
    const customSubDomain = hostname.get('host')?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`).filter(Boolean)[0]

    if (customSubDomain) {
        return NextResponse.rewrite(
            new URL(`/${customSubDomain}${pathWithSearchParams}`, request.url)
        )
    }

    if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
        return NextResponse.redirect(new URL(`/agency/sign-in`, request.url))
    }

    if (url.pathname === "/" || url.pathname === '/site' && url.host === process.env.NEXT_PUBLIC_DOMAIN) {
        return NextResponse.rewrite(new URL('/site', request.url))
    }

    if (isProtectedRoute(request)) {
        auth().protect();
    }
}, { debug: true });

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],

}