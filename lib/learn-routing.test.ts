// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import middleware from '@/middleware'
import { routing } from '@/i18n/routing'

const paths = ['/learn', '/properties', '/learn/first-20-elements', '/learn/periodic-table-riddles']
describe('localized learning routes', () => {
    it('keeps canonical English URLs English despite language headers and locale cookies', () => {
        for (const path of paths) {
            const response = middleware(new NextRequest(`https://elemendle.com${path}`, { headers: { 'accept-language': 'de', cookie: 'NEXT_LOCALE=de' } }))
            expect(response.headers.get('location')).toBeNull()
            expect(response.headers.get('x-middleware-rewrite')).toContain(`/en${path}`)
            expect(response.headers.get('link')).toBeNull()
        }
    })
    it('serves every translation in its own locale instead of redirecting to English', () => {
        for (const locale of routing.locales.filter(locale => locale !== 'en')) {
            for (const path of paths) {
                const response = middleware(new NextRequest(`https://elemendle.com/${locale}${path}?source=game`, { headers: { 'accept-language': 'en', cookie: 'NEXT_LOCALE=en' } }))
                expect(response.headers.get('location')).toBeNull()
                expect(response.status).toBe(200)
                expect(response.headers.get('link')).toBeNull()
            }
        }
    })
})
