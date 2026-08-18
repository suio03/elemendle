import { beforeEach, describe, expect, it } from 'vitest'
import type { ElementGameState } from '@/types/element'
import elementsData from '@/data/atom.json'
import { compareElements } from '@/lib/element-game'
import {
    STORAGE_KEYS,
    addToHistory,
    calculateUpdatedStatistics,
    getInitialGameState,
    getInitialStatistics,
    getStoredHistory,
    getStoredStatistics,
    updateStatistics
} from '@/lib/storage'

function createGameState({
    gameNumber,
    currentDay,
    gameStatus,
    guesses = 1
}: {
    gameNumber: number
    currentDay: string
    gameStatus: ElementGameState['gameStatus']
    guesses?: number
}): ElementGameState {
    return {
        ...getInitialGameState(),
        dailyElement: elementsData.Hydrogen,
        gameNumber,
        currentDay,
        gameStatus,
        guesses: Array.from(
            { length: guesses },
            () => compareElements(elementsData.Helium, elementsData.Hydrogen)
        )
    }
}

describe('local storage v3', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('migrates legacy statistics without deleting the legacy keys', () => {
        const legacyStatistics = {
            gamesPlayed: 4,
            winRate: 0.5,
            currentStreak: 1,
            maxStreak: 2,
            guessDistribution: { 1: 1, 2: 1, 8: 0 },
            bestTime: 20,
            averageTime: 40,
            lastPlayed: '2026-08-17'
        }
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(legacyStatistics))

        const migrated = getStoredStatistics()

        expect(migrated.totalWins).toBe(2)
        expect(migrated.guessDistribution[9]).toBe(0)
        expect(localStorage.getItem(STORAGE_KEYS.DATA_V3)).not.toBeNull()
        expect(localStorage.getItem(STORAGE_KEYS.STATS)).toBe(JSON.stringify(legacyStatistics))
    })

    it('falls back safely when both new and legacy JSON are damaged', () => {
        localStorage.setItem(STORAGE_KEYS.DATA_V2, '{broken')
        localStorage.setItem(STORAGE_KEYS.STATS, 'not-json')
        localStorage.setItem(STORAGE_KEYS.GAME_STATE, '[')

        expect(() => getStoredStatistics()).not.toThrow()
        expect(getStoredStatistics()).toEqual(getInitialStatistics())
    })

    it('repairs malformed dates and nested game data without throwing', () => {
        localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify({
            currentDay: 'not-a-day',
            dailyElement: {},
            gameNumber: 10,
            guesses: [{}],
            gameStatus: 'won',
            startTime: 'yesterday'
        }))

        expect(() => getStoredStatistics()).not.toThrow()
        expect(getStoredHistory()).toEqual([])
    })

    it('restores valid hint preferences and drops unsafe hint indexes', () => {
        const state = {
            ...createGameState({
                gameNumber: 10,
                currentDay: '2026-08-18',
                gameStatus: 'in-progress'
            }),
            hintsEnabled: false,
            revealedHints: [0, 2, 2, 9, '1'],
            dismissedHints: [0, -1]
        }
        localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state))

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_STATE) || '{}')
        expect(stored.hintsEnabled).toBe(false)
        expect(getStoredHistory()).toEqual([])
        const migrated = JSON.parse(localStorage.getItem(STORAGE_KEYS.DATA_V3) || '{}')
        expect(migrated.gameState.revealedHints).toEqual([0, 2])
        expect(migrated.gameState.dismissedHints).toEqual([0])
    })

    it('recovers an unsettled legacy loss without duplicating it', () => {
        const legacyLoss = createGameState({
            gameNumber: 44,
            currentDay: '2026-08-18',
            gameStatus: 'lost',
            guesses: 9
        })
        localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(legacyLoss))
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(getInitialStatistics()))

        expect(getStoredStatistics().gamesPlayed).toBe(1)
        expect(getStoredHistory()).toMatchObject([{
            id: 'daily:44',
            won: false,
            guesses: 9
        }])
        expect(getStoredStatistics().gamesPlayed).toBe(1)
    })
})

describe('statistics settlement', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('records a win on the ninth guess', () => {
        const state = createGameState({
            gameNumber: 100,
            currentDay: '2026-08-18',
            gameStatus: 'won',
            guesses: 9
        })

        const updated = updateStatistics(state, 90)

        expect(updated.gamesPlayed).toBe(1)
        expect(updated.guessDistribution[9]).toBe(1)
    })

    it('settles the same daily game only once', () => {
        const state = createGameState({
            gameNumber: 101,
            currentDay: '2026-08-18',
            gameStatus: 'won'
        })

        updateStatistics(state, 30)
        const repeated = updateStatistics(state, 30)

        expect(repeated.gamesPlayed).toBe(1)
        expect(repeated.totalWins).toBe(1)
        expect(repeated.guessDistribution[1]).toBe(1)
    })

    it('calculates streaks across consecutive and skipped UTC days', () => {
        const first = calculateUpdatedStatistics(
            getInitialStatistics(),
            createGameState({ gameNumber: 1, currentDay: '2026-08-16', gameStatus: 'won' }),
            20
        )
        const consecutive = calculateUpdatedStatistics(
            first,
            createGameState({ gameNumber: 2, currentDay: '2026-08-17', gameStatus: 'won' }),
            20
        )
        const skipped = calculateUpdatedStatistics(
            consecutive,
            createGameState({ gameNumber: 3, currentDay: '2026-08-19', gameStatus: 'won' }),
            20
        )
        const lost = calculateUpdatedStatistics(
            skipped,
            createGameState({ gameNumber: 4, currentDay: '2026-08-20', gameStatus: 'lost' }),
            20
        )

        expect(consecutive.currentStreak).toBe(2)
        expect(skipped.currentStreak).toBe(1)
        expect(lost.currentStreak).toBe(0)
        expect(lost.maxStreak).toBe(2)
    })

    it('stores wins and losses in idempotent history entries', () => {
        const won = createGameState({ gameNumber: 1, currentDay: '2026-08-17', gameStatus: 'won' })
        const lost = createGameState({ gameNumber: 2, currentDay: '2026-08-18', gameStatus: 'lost', guesses: 9 })

        addToHistory(won, 20)
        addToHistory(lost, 90)
        addToHistory(lost, 90)

        expect(getStoredHistory()).toHaveLength(2)
        expect(getStoredHistory().map(entry => entry.won)).toEqual([true, false])
    })
})
