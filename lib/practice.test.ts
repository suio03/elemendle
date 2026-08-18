import { beforeEach, describe, expect, it } from 'vitest'
import elementsData from '@/data/atom.json'
import {
    addRecentPracticeTarget,
    createPracticeGame,
    getPracticeHintUnlockAttempts,
    selectPracticeTarget
} from '@/lib/practice'
import {
    PRACTICE_STORAGE_KEY,
    getInitialPracticeData,
    getStoredPracticeData,
    storePracticeData
} from '@/lib/practice-storage'
import { STORAGE_KEYS, getInitialStatistics } from '@/lib/storage'

describe('practice target selection', () => {
    it('excludes the daily answer and five recent targets when possible', () => {
        const elements = [
            elementsData.Hydrogen,
            elementsData.Helium,
            elementsData.Lithium,
            elementsData.Beryllium,
            elementsData.Boron,
            elementsData.Carbon,
            elementsData.Nitrogen
        ]
        const selected = selectPracticeTarget({
            elements,
            dailyElementName: 'Hydrogen',
            recentTargets: ['Helium', 'Lithium', 'Beryllium', 'Boron', 'Carbon'],
            random: () => 0
        })

        expect(selected.name).toBe('Nitrogen')
    })

    it('relaxes recent exclusions before allowing the daily answer', () => {
        const selected = selectPracticeTarget({
            elements: [elementsData.Hydrogen, elementsData.Helium],
            dailyElementName: 'Hydrogen',
            recentTargets: ['Helium'],
            random: () => 0
        })

        expect(selected.name).toBe('Helium')
    })

    it('uses the confirmed hint timing for each difficulty', () => {
        expect(getPracticeHintUnlockAttempts('easy')).toEqual([3, 5, 7])
        expect(getPracticeHintUnlockAttempts('standard')).toEqual([5, 7, 8])
    })

    it('keeps only five unique recent targets', () => {
        expect(addRecentPracticeTarget(['B', 'C', 'D', 'E', 'F'], 'A')).toEqual(['A', 'B', 'C', 'D', 'E'])
        expect(addRecentPracticeTarget(['A', 'B'], 'A')).toEqual(['A', 'B'])
    })
})

describe('practice storage isolation', () => {
    beforeEach(() => localStorage.clear())

    it('persists an unfinished practice game without touching daily data', () => {
        const dailyData = JSON.stringify({ daily: true })
        localStorage.setItem(STORAGE_KEYS.DATA_V2, dailyData)
        const game = createPracticeGame(elementsData.Oxygen, 'easy', 100)
        const data = {
            ...getInitialPracticeData(),
            difficulty: 'easy' as const,
            currentGame: game,
            recentTargets: ['Oxygen']
        }

        storePracticeData(data)

        expect(getStoredPracticeData()).toMatchObject({
            difficulty: 'easy',
            currentGame: { id: 'practice:100:8', difficulty: 'easy' },
            recentTargets: ['Oxygen']
        })
        expect(localStorage.getItem(STORAGE_KEYS.DATA_V2)).toBe(dailyData)
    })

    it('recovers safely from damaged practice data', () => {
        localStorage.setItem(PRACTICE_STORAGE_KEY, '{broken')
        expect(getStoredPracticeData()).toEqual(getInitialPracticeData())
        expect(getStoredPracticeData().currentGame).toBeNull()
        expect(getInitialStatistics().gamesPlayed).toBe(0)
    })
})
