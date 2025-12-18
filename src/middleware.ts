import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const { pathname } = request.nextUrl

    // Debug log (will appear in server terminal)
    // console.log(`Middleware checking: ${pathname}, Token: ${!!token}`)

    // 1. Define Public Paths (allow these without token)
    // - / (Home)
    // - /login
    // - /register
    // - /api/auth (Auth APIs)
    const isPublicPath =
        pathname === '/' ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/store') ||
        pathname.startsWith('/api/store') ||
        pathname.startsWith('/forgot-password') ||
        pathname.startsWith('/reset-password') ||
        pathname.includes('.') // Allow files with extensions (images, css, etc) just in case

    // 2. If it's NOT a public path AND there is no token
    if (!isPublicPath && !token) {
        // Redirect to login
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    // 3. Otherwise, allow request
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files with extensions (e.g. .png, .jpg)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.|_next).*)',
    ],
}
