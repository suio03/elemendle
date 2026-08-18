import { describe, expect, it } from 'vitest'
import elementsData from '@/data/atom.json'
import { compareElements } from '@/lib/element-game'
import {
    getGuessShareRow,
    getNextHintUnlockAttempt,
    getNumericFeedback,
    getShareGrid,
    getUnlockedHintCount
} from '@/lib/game-rules'

describe('daily game rules', () => {
    it('unlocks three hints only at attempts 5, 7, and 8', () => {
        expect(getUnlockedHintCount(4, 3)).toBe(0)
        expect(getUnlockedHintCount(5, 3)).toBe(1)
        expect(getUnlockedHintCount(7, 3)).toBe(2)
        expect(getUnlockedHintCount(8, 3)).toBe(3)
        expect(getNextHintUnlockAttempt(7)).toBe(8)
        expect(getNextHintUnlockAttempt(8)).toBeNull()
    })

    it('describes numeric directions from the guess toward the target', () => {
        expect(getNumericFeedback({ isMatch: true, isHigher: false })).toBe('exact')
        expect(getNumericFeedback({ isMatch: false, isHigher: false })).toBe('higher')
        expect(getNumericFeedback({ isMatch: false, isHigher: true })).toBe('lower')
    })

    it('creates an answer-free share grid from comparison results', () => {
        const miss = compareElements(elementsData.Helium, elementsData.Oxygen)
        const win = compareElements(elementsData.Oxygen, elementsData.Oxygen)

        expect(getGuessShareRow(win)).toBe('🟩🟩🟩🟩🟩🟩🟩')
        expect(getShareGrid([miss, win])).not.toContain('Oxygen')
        expect(getShareGrid([miss, win]).split('\n')).toHaveLength(2)
    })
})
