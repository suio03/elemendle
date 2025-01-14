import type { ElementGameState, ElementStatistics } from '@/types/element'
import { getStoredGameState, storeGameState, getStoredStatistics, storeStatistics } from './storage'

interface ExportData {
    version: '1.0.0'  // For future compatibility
    timestamp: number
    statistics: ElementStatistics
    currentGame?: {
        currentDay: string
        guesses: ElementGameState['guesses']
        gameStatus: ElementGameState['gameStatus']
        startTime: number | null
        timeTaken?: number
    }
}

export function exportGameData(): string {
    const currentState = getStoredGameState()
    const statistics = getStoredStatistics()
    
    const exportData: ExportData = {
        version: '1.0.0',
        timestamp: Date.now(),
        statistics,
        currentGame: currentState.gameStatus !== 'in-progress' ? {
            currentDay: currentState.currentDay,
            guesses: currentState.guesses,
            gameStatus: currentState.gameStatus,
            startTime: currentState.startTime,
            timeTaken: currentState.timeTaken
        } : undefined
    }

    return JSON.stringify(exportData)
}

export function downloadGameData(): void {
    const data = exportGameData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const date = new Date().toISOString().split('T')[0]
    
    const a = document.createElement('a')
    a.href = url
    a.download = `periodic_stats_${date}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

export async function importGameData(file: File): Promise<boolean> {
    try {
        const text = await file.text()
        const data = JSON.parse(text)
        
        if (!isValidExportData(data)) {
            throw new Error('Invalid data format')
        }

        // Import statistics
        const currentStats = getStoredStatistics()
        const mergedStats = mergeStatistics(currentStats, data.statistics)
        storeStatistics(mergedStats)

        // Import current game if exists
        if (data.currentGame) {
            const currentState = getStoredGameState()
            const newState: ElementGameState = {
                ...currentState,
                currentDay: data.currentGame.currentDay,
                guesses: data.currentGame.guesses,
                gameStatus: data.currentGame.gameStatus,
                startTime: data.currentGame.startTime,
                timeTaken: data.currentGame.timeTaken
            }
            storeGameState(newState)
        }

        return true
    } catch (error) {
        console.error('Import error:', error)
        return false
    }
}

function isValidExportData(data: any): data is ExportData {
    if (typeof data !== 'object' || data === null) return false
    
    // Check version
    if (data.version !== '1.0.0') return false
    
    // Check timestamp
    if (typeof data.timestamp !== 'number') return false
    
    // Check statistics structure
    if (!isValidStatistics(data.statistics)) return false
    
    // Check current game if exists
    if (data.currentGame && !isValidCurrentGame(data.currentGame)) return false
    
    return true
}

function isValidStatistics(stats: any): stats is ElementStatistics {
    return (
        typeof stats === 'object' &&
        stats !== null &&
        typeof stats.gamesPlayed === 'number' &&
        typeof stats.winRate === 'number' &&
        typeof stats.currentStreak === 'number' &&
        typeof stats.maxStreak === 'number' &&
        typeof stats.guessDistribution === 'object'
    )
}

function isValidCurrentGame(game: any): boolean {
    return (
        typeof game === 'object' &&
        game !== null &&
        typeof game.currentDay === 'string' &&
        Array.isArray(game.guesses) &&
        ['in-progress', 'won', 'lost'].includes(game.gameStatus)
    )
}

function mergeStatistics(current: ElementStatistics, imported: ElementStatistics): ElementStatistics {
    return {
        ...current,
        gamesPlayed: Math.max(current.gamesPlayed, imported.gamesPlayed),
        winRate: Math.max(current.winRate, imported.winRate),
        currentStreak: Math.max(current.currentStreak, imported.currentStreak),
        maxStreak: Math.max(current.maxStreak, imported.maxStreak),
        bestTime: current.bestTime && imported.bestTime 
            ? Math.min(current.bestTime, imported.bestTime)
            : current.bestTime || imported.bestTime,
        averageTime: calculateAverageTime(current, imported),
        guessDistribution: mergeGuessDistribution(
            current.guessDistribution,
            imported.guessDistribution
        ),
        lastPlayed: current.lastPlayed
    }
}

function calculateAverageTime(current: ElementStatistics, imported: ElementStatistics): number | null {
    if (!current.averageTime && !imported.averageTime) return null
    if (!current.averageTime) return imported.averageTime
    if (!imported.averageTime) return current.averageTime

    const totalGames = current.gamesPlayed + imported.gamesPlayed
    return Math.floor(
        ((current.averageTime * current.gamesPlayed) + 
        (imported.averageTime * imported.gamesPlayed)) / totalGames
    )
}

function mergeGuessDistribution(
    current: ElementStatistics['guessDistribution'],
    imported: ElementStatistics['guessDistribution']
): ElementStatistics['guessDistribution'] {
    return {
        1: (current[1] || 0) + (imported[1] || 0),
        2: (current[2] || 0) + (imported[2] || 0),
        3: (current[3] || 0) + (imported[3] || 0),
        4: (current[4] || 0) + (imported[4] || 0),
        5: (current[5] || 0) + (imported[5] || 0),
        6: (current[6] || 0) + (imported[6] || 0),
        7: (current[7] || 0) + (imported[7] || 0),
        8: (current[8] || 0) + (imported[8] || 0),
    };
} 