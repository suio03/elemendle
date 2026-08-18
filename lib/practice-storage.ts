import { getInitialStatistics, isElement, isElementGuessResult } from '@/lib/storage'
import type { PracticeData, PracticeDifficulty, PracticeGameState } from '@/types/practice'

export const PRACTICE_STORAGE_KEY = 'element-guess-practice-v1'
const PRACTICE_SCHEMA_VERSION = 1

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === 'object' && value !== null
}

function readNumber(value: unknown, fallback = 0): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function readNullableNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function normalizeDifficulty(value: unknown): PracticeDifficulty {
    return value === 'easy' ? 'easy' : 'standard'
}

function normalizeHintIndexes(value: unknown): number[] {
    if (!Array.isArray(value)) return []

    return Array.from(new Set(
        value.filter((index): index is number =>
            typeof index === 'number' && Number.isInteger(index) && index >= 0 && index < 3
        )
    )).sort((left, right) => left - right)
}

function normalizePracticeGame(value: unknown): PracticeGameState | null {
    if (!isRecord(value) || !isElement(value.targetElement)) return null

    const gameStatus = value.gameStatus === 'won' || value.gameStatus === 'lost'
        ? value.gameStatus
        : 'in-progress'

    return {
        id: typeof value.id === 'string' && value.id.length > 0
            ? value.id
            : `practice:${Math.max(0, readNumber(value.createdAt))}:${value.targetElement.classic.atomic_number}`,
        difficulty: normalizeDifficulty(value.difficulty),
        targetElement: value.targetElement,
        createdAt: Math.max(0, readNumber(value.createdAt)),
        guesses: Array.isArray(value.guesses) ? value.guesses.filter(isElementGuessResult) : [],
        gameStatus,
        startTime: readNullableNumber(value.startTime),
        hasStarted: typeof value.hasStarted === 'boolean'
            ? value.hasStarted
            : readNullableNumber(value.startTime) !== null,
        hintsEnabled: typeof value.hintsEnabled === 'boolean' ? value.hintsEnabled : true,
        revealedHints: normalizeHintIndexes(value.revealedHints),
        dismissedHints: normalizeHintIndexes(value.dismissedHints),
        candidateMapEnabled: typeof value.candidateMapEnabled === 'boolean' ? value.candidateMapEnabled : false,
        candidateMapUsed: typeof value.candidateMapUsed === 'boolean' ? value.candidateMapUsed : false,
        endTime: readNullableNumber(value.endTime) ?? undefined,
        timeTaken: readNullableNumber(value.timeTaken) ?? undefined,
        statistics: getInitialStatistics()
    }
}

export function getInitialPracticeData(): PracticeData {
    return {
        version: PRACTICE_SCHEMA_VERSION,
        difficulty: 'standard',
        currentGame: null,
        recentTargets: []
    }
}

export function normalizePracticeData(value: unknown): PracticeData {
    if (!isRecord(value) || value.version !== PRACTICE_SCHEMA_VERSION) {
        return getInitialPracticeData()
    }

    return {
        version: PRACTICE_SCHEMA_VERSION,
        difficulty: normalizeDifficulty(value.difficulty),
        currentGame: normalizePracticeGame(value.currentGame),
        recentTargets: Array.isArray(value.recentTargets)
            ? Array.from(new Set(
                value.recentTargets.filter((name): name is string => typeof name === 'string')
            )).slice(0, 5)
            : []
    }
}

export function getStoredPracticeData(): PracticeData {
    if (typeof window === 'undefined') return getInitialPracticeData()

    try {
        return normalizePracticeData(JSON.parse(localStorage.getItem(PRACTICE_STORAGE_KEY) || 'null'))
    } catch {
        return getInitialPracticeData()
    }
}

export function storePracticeData(data: PracticeData): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(normalizePracticeData(data)))
    } catch (error) {
        console.error('Failed to save practice game data:', error)
    }
}
