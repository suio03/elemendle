import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getDaysSinceLastPlay, markGamePlayed, trackEvent, trackPageView } from '@/lib/analytics'

describe('anonymous analytics helpers', () => {
    beforeEach(() => {
        localStorage.clear()
        window.dataLayer = []
        window.gtag = undefined
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
})
