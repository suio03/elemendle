import { beforeEach, describe, expect, it } from 'vitest'
import elementsData from '@/data/atom.json'
import { exportGameData, importGameDataFromText } from '@/lib/data-transfer'
import { createChallengeSession } from '@/lib/challenge'
import { getStoredChallengeData, storeChallengeData } from '@/lib/challenge-storage'
import { createPracticeGame } from '@/lib/practice'
import { getInitialPracticeData, getStoredPracticeData, storePracticeData } from '@/lib/practice-storage'
import { getStoredProgressionData, recordElementDiscovery } from '@/lib/progression'
import {
    getInitialGameState,
    getStoredGameState,
    getInitialStatistics,
    getStoredHistory,
    getStoredStatistics,
    updateStatistics
} from '@/lib/storage'
import { storeGameState } from '@/lib/storage'
import type { Element } from '@/types/element'

const elements = Object.values(elementsData) as Element[]

describe('game data transfer', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('imports a v1 export and upgrades it to the v3 shape', () => {
        const legacyExport = {
            version: '1.0.0',
            timestamp: Date.now(),
            statistics: {
                gamesPlayed: 3,
                winRate: 2 / 3,
                currentStreak: 1,
                maxStreak: 2,
                guessDistribution: { 1: 1, 4: 1 },
                bestTime: 12,
                averageTime: 30,
                lastPlayed: '2026-08-17'
            }
        }

        expect(importGameDataFromText(JSON.stringify(legacyExport))).toBe(true)
        expect(getStoredStatistics().totalWins).toBe(2)
        expect(getStoredStatistics().guessDistribution[9]).toBe(0)
        expect(JSON.parse(exportGameData())).toMatchObject({
            version: '3.0.0',
            schemaVersion: 3
        })
    })

    it('rebuilds statistics from valid v2 history when its aggregate block is damaged', () => {
        const partialExport = {
            version: '2.0.0',
            schemaVersion: 2,
            exportedAt: new Date().toISOString(),
            statistics: 'damaged',
            history: [{
                id: 'daily:8',
                mode: 'daily',
                date: '2026-08-18',
                element: 'Oxygen',
                gameNumber: 8,
                guesses: 3,
                timeTaken: 40,
                won: true
            }]
        }

        expect(importGameDataFromText(JSON.stringify(partialExport))).toBe(true)
        expect(getStoredStatistics()).toMatchObject({ gamesPlayed: 1, totalWins: 1 })
        expect(getStoredHistory()).toHaveLength(1)
    })

    it('unions disjoint v3 settlements without double-counting repeated imports', () => {
        const firstGame = {
            ...getInitialGameState(),
            dailyElement: elements[0],
            gameNumber: 80,
            currentDay: '2026-08-17',
            gameStatus: 'won' as const,
            guesses: [elements[0]].map(() => ({
                element: elements[0],
                matches: {
                    period: { isMatch: true, isHigher: false },
                    group: { isMatch: true, isHigher: false },
                    block: true,
                    elementType: true,
                    phase: true,
                    atomicNumber: { isMatch: true, isHigher: false },
                    atomicMass: { isMatch: true, isHigher: false }
                }
            }))
        }
        updateStatistics(firstGame, 20)
        const firstDeviceExport = exportGameData()

        localStorage.clear()
        updateStatistics({
            ...firstGame,
            gameNumber: 81,
            currentDay: '2026-08-18'
        }, 30)

        expect(importGameDataFromText(firstDeviceExport)).toBe(true)
        expect(getStoredStatistics()).toMatchObject({ gamesPlayed: 2, totalWins: 2 })
        expect(getStoredStatistics().guessDistribution[1]).toBe(2)
        expect(importGameDataFromText(firstDeviceExport)).toBe(true)
        expect(getStoredStatistics().gamesPlayed).toBe(2)
    })

    it('migrates and unions disjoint v2 settlement histories', () => {
        const legacyExport = (gameNumber: number, date: string) => ({
            version: '2.0.0',
            schemaVersion: 2,
            exportedAt: `${date}T12:00:00.000Z`,
            statistics: {
                ...getInitialStatistics(),
                gamesPlayed: 1,
                totalWins: 1,
                winRate: 1,
                currentStreak: 1,
                maxStreak: 1,
                guessDistribution: { ...getInitialStatistics().guessDistribution, 2: 1 },
                bestTime: 20,
                averageTime: 20,
                lastPlayed: date,
                settledGames: [`daily:${gameNumber}`]
            },
            history: [{
                id: `daily:${gameNumber}`,
                mode: 'daily',
                date,
                element: 'Hydrogen',
                gameNumber,
                guesses: 2,
                timeTaken: 20,
                won: true
            }]
        })

        expect(importGameDataFromText(JSON.stringify(legacyExport(90, '2026-08-17')))).toBe(true)
        expect(importGameDataFromText(JSON.stringify(legacyExport(91, '2026-08-18')))).toBe(true)
        expect(getStoredStatistics()).toMatchObject({ gamesPlayed: 2, totalWins: 2 })
        expect(getStoredStatistics().guessDistribution[2]).toBe(2)
    })

    it('rejects malformed and unsupported exports without clearing data', () => {
        expect(importGameDataFromText('{bad')).toBe(false)
        expect(importGameDataFromText(JSON.stringify({ version: '3.0.0' }))).toBe(false)
        expect(getStoredStatistics()).toEqual(getInitialStatistics())
    })

    it('round-trips the current hint state in v2 exports', () => {
        storeGameState({
            ...getInitialGameState(),
            gameNumber: 22,
            hintsEnabled: false,
            revealedHints: [0, 1],
            dismissedHints: [0],
            candidateMapEnabled: false,
            candidateMapUsed: true
        })

        const exported = exportGameData()
        localStorage.clear()
        expect(importGameDataFromText(exported)).toBe(true)
        expect(getStoredGameState()).toMatchObject({
            hintsEnabled: false,
            revealedHints: [0, 1],
            dismissedHints: [0],
            candidateMapEnabled: false,
            candidateMapUsed: true
        })
    })

    it('round-trips unfinished practice, challenge, and collection progress', () => {
        const classicGame = createPracticeGame(elements[7], 'easy', 100)
        storePracticeData({
            ...getInitialPracticeData(),
            difficulty: 'easy',
            currentGame: classicGame,
            recentTargets: [classicGame.targetElement.name]
        })
        const challenge = createChallengeSession('mixed', { now: 200 })
        storeChallengeData({ version: 1, currentSession: challenge, recentQuestionIds: [] })
        recordElementDiscovery({
            eventId: 'challenge:test',
            elementName: 'Carbon',
            source: 'challenge',
            discoveredAt: '2026-08-18T00:00:00.000Z'
        })

        const exported = exportGameData()
        localStorage.clear()
        expect(importGameDataFromText(exported)).toBe(true)

        expect(getStoredPracticeData().currentGame?.id).toBe(classicGame.id)
        expect(getStoredChallengeData().currentSession?.id).toBe(challenge.id)
        expect(getStoredProgressionData().discoveries.Carbon).toBeDefined()
    })

    it('imports valid sections without clearing data when optional progress is damaged', () => {
        recordElementDiscovery({ eventId: 'daily:1', elementName: 'Oxygen', source: 'daily' })
        const partialExport = {
            version: '2.0.0',
            schemaVersion: 2,
            exportedAt: new Date().toISOString(),
            statistics: {
                ...getInitialStatistics(),
                gamesPlayed: 2,
                totalWins: 1,
                winRate: 0.5
            },
            progression: 'damaged',
            classicPractice: { version: 1, difficulty: 'easy', currentGame: 'damaged', recentTargets: [] }
        }

        expect(importGameDataFromText(JSON.stringify(partialExport))).toBe(true)
        expect(getStoredStatistics().gamesPlayed).toBe(2)
        expect(getStoredProgressionData().discoveries.Oxygen).toBeDefined()
        expect(getStoredPracticeData().currentGame).toBeNull()
    })

    it('does not restore completed practice sessions as active games', () => {
        const completed = { ...createPracticeGame(elements[5], 'standard', 300), gameStatus: 'won' as const }
        const exportWithCompletedPractice = {
            version: '2.0.0',
            schemaVersion: 2,
            exportedAt: new Date().toISOString(),
            classicPractice: {
                version: 1,
                difficulty: 'standard',
                currentGame: completed,
                recentTargets: [completed.targetElement.name]
            }
        }

        expect(importGameDataFromText(JSON.stringify(exportWithCompletedPractice))).toBe(true)
        expect(getStoredPracticeData().currentGame).toBeNull()
        expect(getStoredPracticeData().recentTargets).toEqual([completed.targetElement.name])
    })
})
