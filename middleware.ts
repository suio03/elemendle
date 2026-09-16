import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse, type NextRequest } from 'next/server'

const localizedMiddleware = createMiddleware(routing)
const englishArticleMiddleware = createMiddleware({ ...routing, localeDetection: false, alternateLinks: false })

export default function middleware(request: NextRequest) {
    // A shared English article URL must not negotiate into an unpublished translation.
    const pathname = request.nextUrl.pathname.replace(/\/$/, '')
    const articlePath = '/learn/periodic-table-riddles'
    if (routing.locales.some(locale => locale !== 'en' && pathname === `/${locale}${articlePath}`)) {
        const url = request.nextUrl.clone()
        url.pathname = articlePath
        return NextResponse.redirect(url)
    }
    if (pathname === '/learn/periodic-table-riddles' || pathname === '/en/learn/periodic-table-riddles') {
        return englishArticleMiddleware(request)
    }
    return localizedMiddleware(request)
}

export const config = {
    matcher: [
        '/',
        '/(en|ch|jp|ko|es|fr|de|it|pt|ru|ar|hi)/:path*',
        '/((?!en|_next|_vercel|.*\\..*|api/).*)'
    ]
}
