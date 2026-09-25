import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { type NextRequest } from 'next/server'

const localizedMiddleware = createMiddleware(routing)
const learningMiddleware = createMiddleware({ ...routing, localeDetection: false, alternateLinks: false })

export default function middleware(request: NextRequest) {
    // Learning URLs keep their explicit language, including unprefixed English links.
    const pathname = request.nextUrl.pathname.replace(/\/$/, '')
    const learningPaths = ['/learn', '/properties', '/learn/first-20-elements', '/learn/periodic-table-riddles']
    const articlePath = learningPaths.find(path => pathname === path || routing.locales.some(locale => pathname === `/${locale}${path}`))
    if (articlePath) {
        return learningMiddleware(request)
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
