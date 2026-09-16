// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import middleware from './middleware'

describe('English-only article routing', () => {
    it('keeps a shared article in English despite a saved locale and browser language', () => {
        const response = middleware(new NextRequest('https://elemendle.com/learn/periodic-table-riddles', {
            headers: { cookie: 'NEXT_LOCALE=fr', 'accept-language': 'fr' }
        }))
        expect(response.headers.get('location')).toBeNull()
        expect(response.headers.get('link')).toBeNull()
        expect(new URL(response.headers.get('x-middleware-rewrite')!).pathname).toBe('/en/learn/periodic-table-riddles')
    })

    it.each(['de', 'jp', 'fr', 'es', 'it', 'pt', 'ru', 'ko', 'ch', 'ar', 'hi', 'nl'])('sends %s article requests to the English guide', locale => {
        const response = middleware(new NextRequest(`https://elemendle.com/${locale}/learn/periodic-table-riddles?ref=footer`, {
            headers: { cookie: `NEXT_LOCALE=${locale}` }
        }))
        expect(response.status).toBe(307)
        expect(response.headers.get('location')).toBe('https://elemendle.com/learn/periodic-table-riddles?ref=footer')
    })

    it('retains language negotiation for the existing game', () => {
        const response = middleware(new NextRequest('https://elemendle.com/', {
            headers: { cookie: 'NEXT_LOCALE=fr', 'accept-language': 'fr' }
        }))
        expect(new URL(response.headers.get('location')!).pathname).toBe('/fr')
    })
})
