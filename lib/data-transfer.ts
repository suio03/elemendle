import type { ElementGameState, ElementStatistics, GameHistory, StatisticsLedger } from '@/types/element'
import type { ChallengeData, ChallengeSession } from '@/types/challenge'
import type { PracticeData, PracticeGameState } from '@/types/practice'
import type { ProgressionData } from '@/types/progression'
import {
    getStoredGameState,
    storeGameState,
    getStoredStatistics,
    storeStatistics,
    getStoredHistory,
    storeHistory,
    createStatisticsLedger,
    getStoredStatisticsLedger,
    normalizeStatisticsLedger,
    storeStatisticsLedger,
    normalizeHistory,
    normalizeStatistics,
    STORAGE_SCHEMA_VERSION
} from './storage'
import {
    getStoredChallengeData,
    normalizeChallengeData,
    storeChallengeData
} from './challenge-storage'
import {
    getStoredPracticeData,
    normalizePracticeData,
    storePracticeData
} from './practice-storage'
import {
    getStoredProgressionData,
    mergeProgressionData,
    normalizeProgressionData,
    storeProgressionData
} from './progression'
import { getCurrentUTCDay } from './utils'

interface ExportedGameState {
    currentDay: string
    gameNumber?: number
    guesses: ElementGameState['guesses']
    gameStatus: ElementGameState['gameStatus']
    startTime: number | null
    endTime?: number
    timeTaken?: number
    hasStarted?: boolean
    hintsEnabled?: boolean
    revealedHints?: number[]
    dismissedHints?: number[]
    candidateMapEnabled?: boolean
    candidateMapUsed?: boolean
}

interface ExportDataV1 {
    version: '1.0.0'
    timestamp: number
    statistics: ElementStatistics
    currentGame?: ExportedGameState
}

interface ExportDataV2 {
    version: '2.0.0'
    schemaVersion: 2
    exportedAt: string
    statistics: ElementStatistics
    history: GameHistory[]
    currentGame?: ExportedGameState
    classicPractice: PracticeData
    challenges: ChallengeData
    progression: ProgressionData
}

interface ExportDataV3 {
    version: '3.0.0'
    schemaVersion: typeof STORAGE_SCHEMA_VERSION
    exportedAt: string
    statistics: ElementStatistics
    statisticsLedger: StatisticsLedger
    history: GameHistory[]
    currentGame?: ExportedGameState
    classicPractice: PracticeData
    challenges: ChallengeData
    progression: ProgressionData
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === 'object' && value !== null
}

function toExportedGameState(state: ElementGameState): ExportedGameState | undefined {
    if (state.gameNumber <= 0) return undefined

    return {
        currentDay: state.currentDay,
        gameNumber: state.gameNumber,
        guesses: state.guesses,
        gameStatus: state.gameStatus,
        startTime: state.startTime,
        endTime: state.endTime,
        timeTaken: state.timeTaken,
        hasStarted: state.hasStarted,
        hintsEnabled: state.hintsEnabled,
        revealedHints: state.revealedHints,
        dismissedHints: state.dismissedHints,
        candidateMapEnabled: state.candidateMapEnabled,
        candidateMapUsed: state.candidateMapUsed
    }
}

export function exportGameData(): string {
    const exportData: ExportDataV3 = {
        version: '3.0.0',
        schemaVersion: STORAGE_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        statistics: getStoredStatistics(),
        statisticsLedger: getStoredStatisticsLedger(),
        history: getStoredHistory(),
        currentGame: toExportedGameState(getStoredGameState()),
        classicPractice: getStoredPracticeData(),
        challenges: getStoredChallengeData(),
        progression: getStoredProgressionData()
    }

    return JSON.stringify(exportData)
}

export function downloadGameData(): void {
    const data = exportGameData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const date = new Date().toISOString().split('T')[0]
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = `elemendle_data_${date}.json`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
}

export async function importGameData(file: File): Promise<boolean> {
    return importGameDataFromText(await file.text())
}

export function importGameDataFromText(text: string): boolean {
    try {
        const data: unknown = JSON.parse(text)
        if (!isRecord(data)) return false

        if (data.version === '1.0.0') {
            return importV1Data(data)
        }

        if (data.version === '2.0.0' && data.schemaVersion === 2) {
            return importV2Data(data)
        }

        if (data.version === '3.0.0' && data.schemaVersion === STORAGE_SCHEMA_VERSION) {
            return importV3Data(data)
        }

        return false
    } catch {
        return false
    }
}

function importV1Data(data: UnknownRecord): boolean {
    if (typeof data.timestamp !== 'number' || !isValidStatistics(data.statistics)) return false

    const importedLedger = createStatisticsLedger(data.statistics, [])
    storeStatisticsLedger(mergeStatisticsLedgers(getStoredStatisticsLedger(), importedLedger))
    if (data.currentGame && isValidCurrentGame(data.currentGame)) {
        importCurrentGame(data.currentGame)
    }
    return true
}

function importV2Data(data: UnknownRecord): boolean {
    let importedSection = false

    const importedHistory = Array.isArray(data.history) ? normalizeHistory(data.history) : []
    if (isValidStatistics(data.statistics) || importedHistory.length > 0) {
        const importedLedger = createStatisticsLedger(data.statistics, importedHistory)
        storeStatisticsLedger(mergeStatisticsLedgers(getStoredStatisticsLedger(), importedLedger))
        storeHistory(mergeHistory(getStoredHistory(), importedHistory))
        importedSection = true
    }

    if (data.currentGame && isValidCurrentGame(data.currentGame)) {
        importCurrentGame(data.currentGame)
        importedSection = true
    }

    if (isValidPracticeSection(data.classicPractice)) {
        const imported = normalizePracticeData(data.classicPractice)
        storePracticeData(mergePracticeData(getStoredPracticeData(), imported))
        importedSection = true
    }

    if (isValidChallengeSection(data.challenges)) {
        const imported = normalizeChallengeData(data.challenges)
        storeChallengeData(mergeChallengeData(getStoredChallengeData(), imported))
        importedSection = true
    }

    if (isValidProgressionSection(data.progression)) {
        const imported = normalizeProgressionData(data.progression)
        storeProgressionData(mergeProgressionData(getStoredProgressionData(), imported))
        importedSection = true
    }

    return importedSection
}

function importV3Data(data: UnknownRecord): boolean {
    let importedSection = false

    if (isValidStatisticsLedger(data.statisticsLedger)) {
        const importedLedger = normalizeStatisticsLedger(data.statisticsLedger)
        storeStatisticsLedger(mergeStatisticsLedgers(getStoredStatisticsLedger(), importedLedger))
        importedSection = true
    }

    if (Array.isArray(data.history)) {
        storeHistory(mergeHistory(getStoredHistory(), normalizeHistory(data.history)))
        importedSection = true
    }

    if (data.currentGame && isValidCurrentGame(data.currentGame)) {
        importCurrentGame(data.currentGame)
        importedSection = true
    }

    if (isValidPracticeSection(data.classicPractice)) {
        const imported = normalizePracticeData(data.classicPractice)
        storePracticeData(mergePracticeData(getStoredPracticeData(), imported))
        importedSection = true
    }

    if (isValidChallengeSection(data.challenges)) {
        const imported = normalizeChallengeData(data.challenges)
        storeChallengeData(mergeChallengeData(getStoredChallengeData(), imported))
        importedSection = true
    }

    if (isValidProgressionSection(data.progression)) {
        const imported = normalizeProgressionData(data.progression)
        storeProgressionData(mergeProgressionData(getStoredProgressionData(), imported))
        importedSection = true
    }

    return importedSection
}

function isValidStatistics(value: unknown): value is ElementStatistics {
    return isRecord(value) &&
        typeof value.gamesPlayed === 'number' &&
        typeof value.winRate === 'number' &&
        isRecord(value.guessDistribution)
}

function isValidStatisticsLedger(value: unknown): value is StatisticsLedger {
    return isRecord(value) &&
        value.version === 1 &&
        isValidStatistics(value.baseline) &&
        Array.isArray(value.settlements)
}

function isValidCurrentGame(value: unknown): value is ExportedGameState {
    return isRecord(value) &&
        typeof value.currentDay === 'string' &&
        Array.isArray(value.guesses) &&
        (value.gameStatus === 'in-progress' || value.gameStatus === 'won' || value.gameStatus === 'lost') &&
        (value.startTime === null || typeof value.startTime === 'number')
}

function isValidPracticeSection(value: unknown): value is PracticeData {
    return isRecord(value) &&
        value.version === 1 &&
        (value.difficulty === 'easy' || value.difficulty === 'standard') &&
        (value.currentGame === null || isRecord(value.currentGame)) &&
        Array.isArray(value.recentTargets)
}

function isValidChallengeSection(value: unknown): value is ChallengeData {
    return isRecord(value) &&
        value.version === 1 &&
        (value.currentSession === null || isRecord(value.currentSession)) &&
        Array.isArray(value.recentQuestionIds)
}

function isValidProgressionSection(value: unknown): value is ProgressionData {
    if (!isRecord(value)) return false
    if (value.version === 1) {
        return isRecord(value.discoveries) && Array.isArray(value.settledEvents)
    }
    return value.version === 2 &&
        isRecord(value.baselineDiscoveries) &&
        Array.isArray(value.legacyEventIds) &&
        Array.isArray(value.events)
}

function importCurrentGame(imported: ExportedGameState): void {
    const current = getStoredGameState()
    const importedGameNumber = typeof imported.gameNumber === 'number'
        ? imported.gameNumber
        : current.gameNumber

    if (
        imported.currentDay !== getCurrentUTCDay() ||
        (current.gameNumber > 0 && importedGameNumber !== current.gameNumber)
    ) {
        return
    }

    storeGameState({
        ...current,
        currentDay: imported.currentDay,
        gameNumber: importedGameNumber,
        guesses: imported.guesses,
        gameStatus: imported.gameStatus,
        startTime: imported.startTime,
        endTime: imported.endTime,
        timeTaken: imported.timeTaken,
        hasStarted: imported.hasStarted ?? imported.startTime !== null,
        hintsEnabled: imported.hintsEnabled ?? true,
        revealedHints: imported.revealedHints ?? [],
        dismissedHints: imported.dismissedHints ?? [],
        candidateMapEnabled: imported.candidateMapEnabled ?? false,
        candidateMapUsed: imported.candidateMapUsed ?? false
    })
}

function selectRestorablePracticeGame(
    current: PracticeGameState | null,
    imported: PracticeGameState | null
): PracticeGameState | null {
    const currentGame = current?.gameStatus === 'in-progress' ? current : null
    const importedGame = imported?.gameStatus === 'in-progress' ? imported : null
    if (!currentGame) return importedGame
    if (!importedGame) return currentGame
    return importedGame.createdAt > currentGame.createdAt ? importedGame : currentGame
}

function mergePracticeData(current: PracticeData, imported: PracticeData): PracticeData {
    return {
        version: 1,
        difficulty: imported.difficulty,
        currentGame: selectRestorablePracticeGame(current.currentGame, imported.currentGame),
        recentTargets: Array.from(new Set([
            ...current.recentTargets,
            ...imported.recentTargets
        ])).slice(0, 5)
    }
}

function selectRestorableChallengeSession(
    current: ChallengeSession | null,
    imported: ChallengeSession | null
): ChallengeSession | null {
    const currentSession = current && !current.completedAt ? current : null
    const importedSession = imported && !imported.completedAt ? imported : null
    if (!currentSession) return importedSession
    if (!importedSession) return currentSession
    return importedSession.startedAt > currentSession.startedAt ? importedSession : currentSession
}

function mergeChallengeData(current: ChallengeData, imported: ChallengeData): ChallengeData {
    return {
        version: 1,
        currentSession: selectRestorableChallengeSession(current.currentSession, imported.currentSession),
        recentQuestionIds: Array.from(new Set([
            ...current.recentQuestionIds,
            ...imported.recentQuestionIds
        ])).slice(0, 20)
    }
}

export function mergeStatistics(
    currentValue: ElementStatistics,
    importedValue: ElementStatistics
): ElementStatistics {
    const current = normalizeStatistics(currentValue)
    const imported = normalizeStatistics(importedValue)
    const gamesPlayed = Math.max(current.gamesPlayed, imported.gamesPlayed)
    const totalWins = Math.min(gamesPlayed, Math.max(current.totalWins, imported.totalWins))
    const importedIsNewer = (imported.lastPlayed || '') > (current.lastPlayed || '')

    return {
        gamesPlayed,
        totalWins,
        winRate: gamesPlayed > 0 ? totalWins / gamesPlayed : 0,
        currentStreak: importedIsNewer
            ? imported.currentStreak
            : current.lastPlayed === imported.lastPlayed
                ? Math.max(current.currentStreak, imported.currentStreak)
                : current.currentStreak,
        maxStreak: Math.max(current.maxStreak, imported.maxStreak),
        bestTime: current.bestTime !== null && imported.bestTime !== null
            ? Math.min(current.bestTime, imported.bestTime)
            : current.bestTime ?? imported.bestTime,
        averageTime: imported.totalWins > current.totalWins
            ? imported.averageTime
            : current.averageTime ?? imported.averageTime,
        guessDistribution: {
            1: Math.max(current.guessDistribution[1], imported.guessDistribution[1]),
            2: Math.max(current.guessDistribution[2], imported.guessDistribution[2]),
            3: Math.max(current.guessDistribution[3], imported.guessDistribution[3]),
            4: Math.max(current.guessDistribution[4], imported.guessDistribution[4]),
            5: Math.max(current.guessDistribution[5], imported.guessDistribution[5]),
            6: Math.max(current.guessDistribution[6], imported.guessDistribution[6]),
            7: Math.max(current.guessDistribution[7], imported.guessDistribution[7]),
            8: Math.max(current.guessDistribution[8], imported.guessDistribution[8]),
            9: Math.max(current.guessDistribution[9], imported.guessDistribution[9])
        },
        lastPlayed: importedIsNewer ? imported.lastPlayed : current.lastPlayed,
        settledGames: Array.from(new Set([...current.settledGames, ...imported.settledGames]))
    }
}

export function mergeStatisticsLedgers(
    currentValue: StatisticsLedger,
    importedValue: StatisticsLedger
): StatisticsLedger {
    const current = normalizeStatisticsLedger(currentValue)
    const imported = normalizeStatisticsLedger(importedValue)
    return {
        version: 1,
        baseline: mergeStatistics(current.baseline, imported.baseline),
        settlements: Array.from(new Map([
            ...current.settlements,
            ...imported.settlements
        ].map(settlement => [settlement.id, settlement])).values())
    }
}

function mergeHistory(current: GameHistory[], imported: GameHistory[]): GameHistory[] {
    return Array.from(
        new Map([...current, ...imported].map(entry => [entry.id, entry])).values()
    )
}
