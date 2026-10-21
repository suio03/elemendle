import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getDaysSinceLastPlay, markGamePlayed, trackEvent, trackPageView } from '@/lib/analytics'

describe('anonymous analytics helpers', () => {
    beforeEach(() => {
        localStorage.clear()
        window.dataLayer = []
        window.gtag = undefined
        window.plausible = undefined
    })

    it('stores only a local play date for return-day aggregation', () => {
        markGamePlayed('2026-08-10')

        expect(getDaysSinceLastPlay('2026-08-18')).toBe(8)
        expect(Object.keys(localStorage)).toEqual(['elemendle-last-play-date'])
    })

    it('queues only the named event and supplied allowlisted properties', () => {
        const gtag = vi.fn()
        window.gtag = gtag

        trackEvent('guess_submitted', { mode: 'daily', attemptNumber: 3 })

        expect(gtag).toHaveBeenCalledWith('event', 'guess_submitted', {
            mode: 'daily',
            attemptNumber: 3
        })
    })

    it('tracks a page view with the current page metadata', () => {
        const gtag = vi.fn()
        window.gtag = gtag
        document.title = 'Elemendle Practice'
        window.history.replaceState({}, '', '/practice')

        trackPageView('/practice')

        expect(gtag).toHaveBeenCalledWith('event', 'page_view', {
            page_location: 'http://localhost:3000/practice',
            page_path: '/practice',
            page_title: 'Elemendle Practice'
        })
    })

    it('sends custom events and properties to Plausible as well as GA', () => {
        window.plausible = vi.fn(() => {})
        window.gtag = vi.fn()

        trackEvent('game_started', { locale: 'en', mode: 'daily' })

        expect(window.plausible).toHaveBeenCalledExactlyOnceWith('game_started', {
            props: { locale: 'en', mode: 'daily' }
        })
        expect(window.gtag).toHaveBeenCalledExactlyOnceWith('event', 'game_started', {
            locale: 'en', mode: 'daily'
        })
    })

    it('preserves early events in the queue consumed by the Plausible tracker', () => {
        trackEvent('game_loaded', { locale: 'en', mode: 'daily' })
        trackEvent('game_started', { locale: 'en', mode: 'daily' })

        expect(window.plausible?.q).toEqual([
            ['game_loaded', { props: { locale: 'en', mode: 'daily' } }],
            ['game_started', { props: { locale: 'en', mode: 'daily' } }]
        ])
    })

    it('isolates provider failures from gameplay and the other provider', () => {
        window.plausible = vi.fn(() => { throw new Error('blocked') })
        window.gtag = vi.fn()
        expect(() => trackEvent('guess_submitted', { mode: 'daily', attemptNumber: 1 })).not.toThrow()
        expect(window.gtag).toHaveBeenCalledOnce()

        window.plausible = vi.fn(() => {})
        window.gtag = vi.fn(() => { throw new Error('blocked') })
        expect(() => trackEvent('guess_submitted', { mode: 'daily', attemptNumber: 2 })).not.toThrow()
        expect(window.plausible).toHaveBeenCalledOnce()
    })

    it('leaves Plausible pageviews to its automatic tracker', () => {
        window.plausible = vi.fn(() => {})
        trackPageView('/practice')
        expect(window.plausible).not.toHaveBeenCalled()
    })
})
