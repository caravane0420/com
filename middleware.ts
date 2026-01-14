import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'
import { cookies } from 'next/headers'

const protectedRoutes = ['/write', '/dashboard', '/profile']
const publicRoutes = ['/login', '/register', '/', '/posts/(.*)']

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.includes(path) || path.startsWith('/write')
    const isPublicRoute = publicRoutes.includes(path) || path === '/'

    const cookie = (await cookies()).get('session')?.value
    const session = await decrypt(cookie)

    if (isProtectedRoute && !session?.userId) {
        return NextResponse.redirect(new URL('/login', req.nextUrl))
    }

    if (isPublicRoute && session?.userId && !req.nextUrl.pathname.startsWith('/')) {
        // Optional: Redirect to dashboard if logged in and trying to access login
        if (path === '/login' || path === '/register') {
            return NextResponse.redirect(new URL('/', req.nextUrl))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
