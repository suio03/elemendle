import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
    matcher: [
        '/',
        '/(en|ch|jp|ko|es|fr|de|it|pt|ru|ar|hi)/:path*',
        '/((?!en|_next|_vercel|.*\\..*|api/).*)'
    ]
}
