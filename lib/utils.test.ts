import { describe, expect, it } from 'vitest'
import { getCurrentUTCDay, getPreviousUTCDay } from '@/lib/utils'

describe('UTC day utilities', () => {
    it('uses UTC rather than the local calendar day', () => {
        expect(getCurrentUTCDay(new Date('2026-08-18T23:59:59.999Z'))).toBe('2026-08-18')
        expect(getCurrentUTCDay(new Date('2026-08-19T00:00:00.000Z'))).toBe('2026-08-19')
    })

    it('handles previous days across month and year boundaries', () => {
        expect(getPreviousUTCDay('2026-03-01')).toBe('2026-02-28')
        expect(getPreviousUTCDay('2026-01-01')).toBe('2025-12-31')
    })
})
