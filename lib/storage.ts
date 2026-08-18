import type {
    Element,
    ElementGameState,
    ElementGuessResult,
    ElementStatistics,
    GameHistory,
    StatisticsLedger
} from '@/types/element'
import { getCurrentUTCDay, getPreviousUTCDay, isSameUTCDay } from '@/lib/utils'

export const STORAGE_SCHEMA_VERSION = 3
export const STATISTICS_UPDATED_EVENT = 'elemendle:statistics-updated'

export const STORAGE_KEYS = {
    DATA_V3: 'element-guess-data-v3',
    DATA_V2: 'element-guess-data-v2',
    GAME_STATE: 'element-guess-game',
    STATS: 'element-guess-stats',
    HISTORY: 'element-guess-history',
    USER_ID: 'element-guess-uid',
    CURRENT_GAME: 'element-guess-current-game'
} as const

interface StorageDataV3 {
    version: typeof STORAGE_SCHEMA_VERSION
    gameState: ElementGameState
    statistics: ElementStatistics
    statisticsLedger: StatisticsLedger
    history: GameHistory[]
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === 'object' && value !== null
}

function isUTCDay(value: unknown): value is string {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const timestamp = Date.parse(`${value}T00:00:00.000Z`)
    return Number.isFinite(timestamp) && getCurrentUTCDay(new Date(timestamp)) === value
}

export function isElement(value: unknown): value is Element {
    if (!isRecord(value) || !isRecord(value.classic) || !isRecord(value.hints)) return false

    return typeof value.name === 'string' &&
        typeof value.symbol === 'string' &&
        typeof value.classic.atomic_number === 'string' &&
        typeof value.classic.atomic_mass === 'string' &&
        typeof value.classic.period === 'string' &&
        typeof value.classic.group === 'string' &&
        typeof value.classic['phase-at-stp'] === 'string' &&
        typeof value.classic.block === 'string' &&
        typeof value.classic.element_type === 'string' &&
        Array.isArray(value.hints.properties)
}

function isComparison(value: unknown): boolean {
    return isRecord(value) &&
        typeof value.isMatch === 'boolean' &&
        typeof value.isHigher === 'boolean'
}

export function isElementGuessResult(value: unknown): value is ElementGuessResult {
    if (!isRecord(value) || !isElement(value.element) || !isRecord(value.matches)) return false

    return isComparison(value.matches.period) &&
        isComparison(value.matches.group) &&
        typeof value.matches.block === 'boolean' &&
        typeof value.matches.elementType === 'boolean' &&
        typeof value.matches.phase === 'boolean' &&
        isComparison(value.matches.atomicNumber) &&
        isComparison(value.matches.atomicMass)
}

function safeParse(value: string | null): unknown {
    if (!value) return null

    try {
        return JSON.parse(value)
    } catch {
        return null
    }
}

function readNumber(value: unknown, fallback = 0): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function readNullableNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function getInitialStatistics(): ElementStatistics {
    return {
        gamesPlayed: 0,
        totalWins: 0,
        winRate: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0
        },
        bestTime: null,
        averageTime: null,
        lastPlayed: null,
        settledGames: []
    }
}

export function getInitialGameState(): ElementGameState {
    return {
        currentDay: getCurrentUTCDay(),
        dailyElement: null,
        gameNumber: 0,
        guesses: [],
        gameStatus: 'in-progress',
        startTime: null,
        hasStarted: false,
        hintsEnabled: true,
        revealedHints: [],
        dismissedHints: [],
        candidateMapEnabled: false,
        candidateMapUsed: false,
        statistics: getInitialStatistics()
    }
}

export function normalizeStatistics(value: unknown): ElementStatistics {
    const initial = getInitialStatistics()
    if (!isRecord(value)) return initial

    const gamesPlayed = Math.max(0, Math.floor(readNumber(value.gamesPlayed)))
    const legacyWinRate = Math.min(1, Math.max(0, readNumber(value.winRate)))
    const totalWins = Math.min(
        gamesPlayed,
        Math.max(0, Math.floor(readNumber(value.totalWins, Math.round(legacyWinRate * gamesPlayed))))
    )
    const distribution = isRecord(value.guessDistribution) ? value.guessDistribution : {}

    return {
        gamesPlayed,
        totalWins,
        winRate: gamesPlayed > 0 ? totalWins / gamesPlayed : 0,
        currentStreak: Math.max(0, Math.floor(readNumber(value.currentStreak))),
        maxStreak: Math.max(
            Math.max(0, Math.floor(readNumber(value.currentStreak))),
            Math.max(0, Math.floor(readNumber(value.maxStreak)))
        ),
        guessDistribution: {
            1: Math.max(0, Math.floor(readNumber(distribution[1]))),
            2: Math.max(0, Math.floor(readNumber(distribution[2]))),
            3: Math.max(0, Math.floor(readNumber(distribution[3]))),
            4: Math.max(0, Math.floor(readNumber(distribution[4]))),
            5: Math.max(0, Math.floor(readNumber(distribution[5]))),
            6: Math.max(0, Math.floor(readNumber(distribution[6]))),
            7: Math.max(0, Math.floor(readNumber(distribution[7]))),
            8: Math.max(0, Math.floor(readNumber(distribution[8]))),
            9: Math.max(0, Math.floor(readNumber(distribution[9])))
        },
        bestTime: readNullableNumber(value.bestTime),
        averageTime: readNullableNumber(value.averageTime),
        lastPlayed: isUTCDay(value.lastPlayed) ? value.lastPlayed : null,
        settledGames: Array.isArray(value.settledGames)
            ? Array.from(new Set(value.settledGames.filter((key): key is string => typeof key === 'string')))
            : []
    }
}

function normalizeGameState(value: unknown, statistics: ElementStatistics): ElementGameState {
    const initial = getInitialGameState()
    if (!isRecord(value)) return { ...initial, statistics }

    const dailyElement = isElement(value.dailyElement) ? value.dailyElement : null
    const gameStatus = dailyElement && (value.gameStatus === 'won' || value.gameStatus === 'lost')
        ? value.gameStatus
        : 'in-progress'

    return {
        currentDay: isUTCDay(value.currentDay) ? value.currentDay : initial.currentDay,
        dailyElement,
        gameNumber: Math.max(0, Math.floor(readNumber(value.gameNumber))),
        guesses: Array.isArray(value.guesses)
            ? value.guesses.filter(isElementGuessResult)
            : [],
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
        statistics
    }
}

function normalizeHintIndexes(value: unknown): number[] {
    if (!Array.isArray(value)) return []

    return Array.from(new Set(
        value.filter((index): index is number =>
            typeof index === 'number' && Number.isInteger(index) && index >= 0 && index < 3
        )
    )).sort((left, right) => left - right)
}

function createHistoryId(gameNumber: number): string {
    return `daily:${gameNumber}`
}

export function normalizeHistory(value: unknown): GameHistory[] {
    if (!Array.isArray(value)) return []

    const entries = value.reduce<GameHistory[]>((history, item) => {
        if (!isRecord(item)) return history

        const gameNumber = Math.max(0, Math.floor(readNumber(item.gameNumber)))
        const date = isUTCDay(item.date) ? item.date : ''
        if (!gameNumber || !date) return history

        history.push({
            id: createHistoryId(gameNumber),
            mode: 'daily',
            date,
            element: typeof item.element === 'string' ? item.element : '',
            gameNumber,
            guesses: Math.max(0, Math.floor(readNumber(item.guesses))),
            timeTaken: Math.max(0, readNumber(item.timeTaken)),
            won: item.won === true
        })
        return history
    }, [])

    return Array.from(new Map(entries.map(entry => [entry.id, entry])).values())
}

function applySettlementToStatistics(
    current: ElementStatistics,
    settlement: GameHistory
): ElementStatistics {
    const statistics = normalizeStatistics(current)
    if (statistics.settledGames.includes(settlement.id)) return statistics

    const gamesPlayed = statistics.gamesPlayed + 1
    const totalWins = statistics.totalWins + (settlement.won ? 1 : 0)
    const isLatestSettlement = !statistics.lastPlayed || settlement.date >= statistics.lastPlayed
    let currentStreak = statistics.currentStreak

    if (isLatestSettlement) {
        if (settlement.won) {
            if (statistics.lastPlayed === settlement.date) {
                currentStreak = Math.max(1, currentStreak)
            } else if (statistics.lastPlayed === getPreviousUTCDay(settlement.date)) {
                currentStreak += 1
            } else {
                currentStreak = 1
            }
        } else {
            currentStreak = 0
        }
    }

    const updated: ElementStatistics = {
        ...statistics,
        gamesPlayed,
        totalWins,
        winRate: totalWins / gamesPlayed,
        currentStreak,
        maxStreak: Math.max(statistics.maxStreak, currentStreak),
        lastPlayed: isLatestSettlement ? settlement.date : statistics.lastPlayed,
        settledGames: [...statistics.settledGames, settlement.id]
    }

    if (settlement.won) {
        const guessCount = Math.min(9, Math.max(1, settlement.guesses)) as keyof ElementStatistics['guessDistribution']
        updated.guessDistribution = {
            ...statistics.guessDistribution,
            [guessCount]: statistics.guessDistribution[guessCount] + 1
        }
        updated.bestTime = statistics.bestTime === null
            ? settlement.timeTaken
            : Math.min(statistics.bestTime, settlement.timeTaken)
        updated.averageTime = statistics.averageTime === null
            ? settlement.timeTaken
            : Math.round((statistics.averageTime * statistics.totalWins + settlement.timeTaken) / totalWins)
    }

    return updated
}

export function calculateStatisticsFromLedger(value: StatisticsLedger): ElementStatistics {
    const baseline = normalizeStatistics(value.baseline)
    const settlements = normalizeHistory(value.settlements).sort((left, right) =>
        left.date.localeCompare(right.date) || left.gameNumber - right.gameNumber
    )
    return settlements.reduce(applySettlementToStatistics, baseline)
}

function statisticsMatch(left: ElementStatistics, right: ElementStatistics): boolean {
    return left.gamesPlayed === right.gamesPlayed &&
        left.totalWins === right.totalWins &&
        left.currentStreak === right.currentStreak &&
        left.maxStreak === right.maxStreak &&
        left.bestTime === right.bestTime &&
        left.averageTime === right.averageTime &&
        left.lastPlayed === right.lastPlayed &&
        Object.keys(left.guessDistribution).every(key => {
            const guess = Number(key) as keyof ElementStatistics['guessDistribution']
            return left.guessDistribution[guess] === right.guessDistribution[guess]
        })
}

export function createStatisticsLedger(
    statisticsValue: unknown,
    historyValue: unknown
): StatisticsLedger {
    const statistics = normalizeStatistics(statisticsValue)
    const history = normalizeHistory(historyValue)
    const rebuilt = calculateStatisticsFromLedger({
        version: 1,
        baseline: getInitialStatistics(),
        settlements: history
    })
    const historyIsComplete = history.length === statistics.gamesPlayed &&
        statisticsMatch(rebuilt, statistics)

    if (historyIsComplete) {
        return { version: 1, baseline: getInitialStatistics(), settlements: history }
    }

    return {
        version: 1,
        baseline: statistics,
        settlements: history.filter(entry =>
            statistics.settledGames.length > 0
                ? !statistics.settledGames.includes(entry.id)
                : statistics.gamesPlayed === 0
        )
    }
}

export function normalizeStatisticsLedger(
    value: unknown,
    fallbackStatistics: unknown = null,
    fallbackHistory: unknown = null
): StatisticsLedger {
    if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.settlements)) {
        return createStatisticsLedger(fallbackStatistics, fallbackHistory)
    }

    return {
        version: 1,
        baseline: normalizeStatistics(value.baseline),
        settlements: normalizeHistory(value.settlements)
    }
}

function createStorageData(
    gameStateValue: unknown,
    statisticsValue: unknown,
    historyValue: unknown,
    statisticsLedgerValue: unknown = null
): StorageDataV3 {
    let statisticsLedger = normalizeStatisticsLedger(
        statisticsLedgerValue,
        statisticsValue,
        historyValue
    )
    let statistics = calculateStatisticsFromLedger(statisticsLedger)
    const gameState = normalizeGameState(gameStateValue, statistics)
    const history = Array.from(new Map([
        ...normalizeHistory(historyValue),
        ...statisticsLedger.settlements
    ].map(entry => [entry.id, entry])).values())

    if (gameState.gameStatus !== 'in-progress' && gameState.gameNumber > 0) {
        const settlementKey = createHistoryId(gameState.gameNumber)

        if (
            !statistics.settledGames.includes(settlementKey) &&
            statistics.lastPlayed === gameState.currentDay
        ) {
            statisticsLedger = {
                ...statisticsLedger,
                baseline: {
                    ...statisticsLedger.baseline,
                    settledGames: [...statisticsLedger.baseline.settledGames, settlementKey]
                }
            }
            statistics = calculateStatisticsFromLedger(statisticsLedger)
        } else if (
            !statistics.settledGames.includes(settlementKey) &&
            (!statistics.lastPlayed || statistics.lastPlayed < gameState.currentDay)
        ) {
            const settlement: GameHistory = {
                id: settlementKey,
                mode: 'daily',
                date: gameState.currentDay,
                element: gameState.dailyElement?.name || '',
                gameNumber: gameState.gameNumber,
                guesses: gameState.guesses.length,
                timeTaken: gameState.timeTaken || 0,
                won: gameState.gameStatus === 'won'
            }
            statisticsLedger = {
                ...statisticsLedger,
                settlements: [...statisticsLedger.settlements, settlement]
            }
            statistics = calculateStatisticsFromLedger(statisticsLedger)
        }

        if (!history.some(entry => entry.id === settlementKey)) {
            history.push({
                id: settlementKey,
                mode: 'daily',
                date: gameState.currentDay,
                element: gameState.dailyElement?.name || '',
                gameNumber: gameState.gameNumber,
                guesses: gameState.guesses.length,
                timeTaken: gameState.timeTaken || 0,
                won: gameState.gameStatus === 'won'
            })
        }
    }

    return {
        version: STORAGE_SCHEMA_VERSION,
        gameState: { ...gameState, statistics },
        statistics,
        statisticsLedger,
        history
    }
}

function writeStorageData(data: StorageDataV3): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.setItem(STORAGE_KEYS.DATA_V3, JSON.stringify(data))
    } catch (error) {
        console.error('Failed to save local game data:', error)
    }
}

function getStorageData(): StorageDataV3 {
    if (typeof window === 'undefined') {
        return createStorageData(null, null, null)
    }

    const storedV3 = safeParse(localStorage.getItem(STORAGE_KEYS.DATA_V3))
    if (isRecord(storedV3) && storedV3.version === STORAGE_SCHEMA_VERSION) {
        return createStorageData(
            storedV3.gameState,
            storedV3.statistics,
            storedV3.history,
            storedV3.statisticsLedger
        )
    }

    const storedV2 = safeParse(localStorage.getItem(STORAGE_KEYS.DATA_V2))
    if (isRecord(storedV2) && storedV2.version === 2) {
        const migrated = createStorageData(
            storedV2.gameState,
            storedV2.statistics,
            storedV2.history
        )
        writeStorageData(migrated)
        return migrated
    }

    const migrated = createStorageData(
        safeParse(localStorage.getItem(STORAGE_KEYS.GAME_STATE)),
        safeParse(localStorage.getItem(STORAGE_KEYS.STATS)),
        safeParse(localStorage.getItem(STORAGE_KEYS.HISTORY))
    )
    writeStorageData(migrated)
    return migrated
}

export function validateGameState(state: ElementGameState, currentGameNumber: number): boolean {
    return state.gameNumber === currentGameNumber && state.currentDay === getCurrentUTCDay()
}

export function getStoredGameState(): ElementGameState {
    const data = getStorageData()

    if (!isSameUTCDay(data.gameState.currentDay, getCurrentUTCDay())) {
        return { ...getInitialGameState(), statistics: data.statistics }
    }

    return { ...data.gameState, statistics: data.statistics }
}

export function storeGameState(state: ElementGameState): void {
    if (typeof window === 'undefined') return

    const data = getStorageData()
    writeStorageData({
        ...data,
        gameState: normalizeGameState(state, data.statistics)
    })
}

export function getStoredStatistics(): ElementStatistics {
    return getStorageData().statistics
}

export function storeStatistics(statistics: ElementStatistics): void {
    if (typeof window === 'undefined') return

    const data = getStorageData()
    const statisticsLedger = createStatisticsLedger(statistics, data.history)
    const normalized = calculateStatisticsFromLedger(statisticsLedger)
    writeStorageData({
        ...data,
        statistics: normalized,
        statisticsLedger,
        gameState: { ...data.gameState, statistics: normalized }
    })
    window.dispatchEvent(new CustomEvent(STATISTICS_UPDATED_EVENT, { detail: normalized }))
}

export function getStoredStatisticsLedger(): StatisticsLedger {
    return getStorageData().statisticsLedger
}

export function storeStatisticsLedger(value: StatisticsLedger): ElementStatistics {
    if (typeof window === 'undefined') return calculateStatisticsFromLedger(value)

    const data = getStorageData()
    const statisticsLedger = normalizeStatisticsLedger(value)
    const statistics = calculateStatisticsFromLedger(statisticsLedger)
    const history = Array.from(new Map([
        ...data.history,
        ...statisticsLedger.settlements
    ].map(entry => [entry.id, entry])).values())
    writeStorageData({
        ...data,
        statistics,
        statisticsLedger,
        history,
        gameState: { ...data.gameState, statistics }
    })
    window.dispatchEvent(new CustomEvent(STATISTICS_UPDATED_EVENT, { detail: statistics }))
    return statistics
}

export function getStoredHistory(): GameHistory[] {
    return getStorageData().history
}

export function storeHistory(history: GameHistory[]): void {
    if (typeof window === 'undefined') return

    const data = getStorageData()
    writeStorageData({ ...data, history: normalizeHistory(history) })
}

export function calculateTimeTaken(startTime: number | null, endTime: number): number {
    if (!startTime) return 0
    return Math.max(0, Math.floor((endTime - startTime) / 1000))
}

export function calculateUpdatedStatistics(
    current: ElementStatistics,
    gameState: ElementGameState,
    timeTaken: number
): ElementStatistics {
    const statistics = normalizeStatistics(current)
    if (gameState.gameStatus === 'in-progress' || gameState.gameNumber <= 0) return statistics
    return applySettlementToStatistics(statistics, {
        id: createHistoryId(gameState.gameNumber),
        mode: 'daily',
        date: gameState.currentDay,
        element: gameState.dailyElement?.name || '',
        gameNumber: gameState.gameNumber,
        guesses: gameState.guesses.length,
        timeTaken,
        won: gameState.gameStatus === 'won'
    })
}

export function updateStatistics(
    gameState: ElementGameState,
    timeTaken: number
): ElementStatistics {
    if (typeof window === 'undefined' || gameState.gameStatus === 'in-progress' || gameState.gameNumber <= 0) {
        return getStoredStatistics()
    }

    const data = getStorageData()
    const settlement: GameHistory = {
        id: createHistoryId(gameState.gameNumber),
        mode: 'daily',
        date: gameState.currentDay,
        element: gameState.dailyElement?.name || '',
        gameNumber: gameState.gameNumber,
        guesses: gameState.guesses.length,
        timeTaken,
        won: gameState.gameStatus === 'won'
    }
    if (data.statistics.settledGames.includes(settlement.id)) return data.statistics

    const statisticsLedger = {
        ...data.statisticsLedger,
        settlements: [...data.statisticsLedger.settlements, settlement]
    }
    const statistics = calculateStatisticsFromLedger(statisticsLedger)
    const history = Array.from(new Map([...data.history, settlement].map(entry => [entry.id, entry])).values())
    writeStorageData({
        ...data,
        statistics,
        statisticsLedger,
        history,
        gameState: { ...data.gameState, statistics }
    })
    window.dispatchEvent(new CustomEvent(STATISTICS_UPDATED_EVENT, { detail: statistics }))
    return statistics
}

export function addToHistory(gameState: ElementGameState, timeTaken: number): GameHistory[] {
    if (
        typeof window === 'undefined' ||
        gameState.gameStatus === 'in-progress' ||
        gameState.gameNumber <= 0
    ) return getStoredHistory()

    const history = getStoredHistory()
    const entry: GameHistory = {
        id: createHistoryId(gameState.gameNumber),
        mode: 'daily',
        date: gameState.currentDay,
        element: gameState.dailyElement?.name || '',
        gameNumber: gameState.gameNumber,
        guesses: gameState.guesses.length,
        timeTaken,
        won: gameState.gameStatus === 'won'
    }
    const existingIndex = history.findIndex(item => item.id === entry.id)
    const updated = existingIndex >= 0
        ? history.map((item, index) => index === existingIndex ? entry : item)
        : [...history, entry]

    storeHistory(updated)
    return updated
}

export function validateAndUpdateGameState(
    currentState: ElementGameState,
    apiGameNumber: number,
    apiElement: Element
): ElementGameState {
    const statistics = getStoredStatistics()

    if (
        currentState.gameNumber !== apiGameNumber ||
        !isSameUTCDay(currentState.currentDay, getCurrentUTCDay())
    ) {
        return {
            ...getInitialGameState(),
            gameNumber: apiGameNumber,
            dailyElement: apiElement,
            currentDay: getCurrentUTCDay(),
            statistics
        }
    }

    return {
        ...currentState,
        dailyElement: currentState.dailyElement || apiElement,
        statistics
    }
}
