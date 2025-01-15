import { ElementGameState, Element, type ElementStatistics } from "@/types/element";
import { getCurrentUTCDay, isSameUTCDay } from "@/lib/utils";

// Update storage keys
const STORAGE_KEYS = {
    GAME_STATE: "element-guess-game",
    STATS: "element-guess-stats",
    HISTORY: "element-guess-history",
    USER_ID: "element-guess-uid",
    CURRENT_GAME: "element-guess-current-game"
} as const;

// Update initial game state to include game number
export function getInitialGameState(): ElementGameState {
    return {
        currentDay: getCurrentUTCDay(),
        dailyElement: null,
        gameNumber: 0, // Add game number tracking
        guesses: [],
        gameStatus: "in-progress",
        startTime: null,
        hasStarted: false,
        statistics: getInitialStatistics()
    };
}

// Update history interface
interface GameHistory {
    date: string; // UTC date
    element: string;
    gameNumber: number;
    guesses: number;
    timeTaken: number;
    won: boolean;
}

export function addToHistory(gameState: ElementGameState, timeTaken: number): void {
    if (typeof window === "undefined") return;

    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]') as GameHistory[];
    
    const newEntry: GameHistory = {
        date: getCurrentUTCDay(),
        element: gameState.dailyElement?.name || '',
        gameNumber: gameState.gameNumber,
        guesses: gameState.guesses.length,
        timeTaken: timeTaken,
        won: gameState.gameStatus === "won"
    };

    history.push(newEntry);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

// Add validation function
export function validateGameState(state: ElementGameState, currentGameNumber: number): boolean {
    return state.gameNumber === currentGameNumber && 
           state.currentDay === getCurrentUTCDay();
}

export function getInitialStatistics(): ElementStatistics {
    return {
        gamesPlayed: 0,
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
            8: 0
        },
        bestTime: null,
        averageTime: null,
        lastPlayed: null
    };
}

export function getStoredGameState(): ElementGameState {
    if (typeof window === "undefined") return getInitialGameState();
    
    const stored = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    if (!stored) return getInitialGameState();
    
    const state = JSON.parse(stored);
    
    // Validate the stored state's date
    if (!isSameUTCDay(state.currentDay, getCurrentUTCDay())) {
        return getInitialGameState();
    }
    
    return state;
}

export function storeGameState(state: ElementGameState): void {
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state));
}

export function getStoredStatistics() {
    if (typeof window === "undefined") return getInitialStatistics();
    
    const stored = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!stored) return getInitialStatistics();
    
    return JSON.parse(stored);
}

export function getOrCreateUserId(): string {
    if (typeof window === "undefined") return "";
    
    let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    }
    
    return userId;
}

export function calculateTimeTaken(startTime: number | null, endTime: number): number {
    if (!startTime) return 0;
    return Math.floor((endTime - startTime) / 1000);
}

export function storeStatistics(statistics: ReturnType<typeof getInitialStatistics>) {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(statistics));
}

export function updateStatistics(gameState: ElementGameState, timeTaken: number): void {
    const stats = getStoredStatistics();
    const isWon = gameState.gameStatus === "won";

    // Update games played and win rate
    stats.gamesPlayed += 1;
    const totalWins = Math.round(stats.winRate * (stats.gamesPlayed - 1));
    stats.winRate = (totalWins + (isWon ? 1 : 0)) / stats.gamesPlayed;

    // Update streaks - now considers UTC days for streak calculation
    if (isWon) {
        const lastPlayedDate = stats.lastPlayed ? new Date(stats.lastPlayed).toISOString().split('T')[0] : null;
        const yesterdayUTC = new Date(Date.UTC(
            new Date().getUTCFullYear(),
            new Date().getUTCMonth(),
            new Date().getUTCDate() - 1
        )).toISOString().split('T')[0];

        if (lastPlayedDate === yesterdayUTC) {
            stats.currentStreak += 1;
        } else if (!lastPlayedDate || lastPlayedDate < yesterdayUTC) {
            stats.currentStreak = 1;
        }
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    } else {
        stats.currentStreak = 0;
    }

    // Update guess distribution if won
    if (isWon) {
        const guessCount = gameState.guesses.length as keyof typeof stats.guessDistribution;
        stats.guessDistribution[guessCount] += 1;
    }

    // Update timing statistics
    if (isWon) {
        if (!stats.bestTime || timeTaken < stats.bestTime) {
            stats.bestTime = timeTaken;
        }
        
        if (!stats.averageTime) {
            stats.averageTime = timeTaken;
        } else {
            const totalGames = stats.gamesPlayed;
            stats.averageTime = Math.round(
                (stats.averageTime * (totalGames - 1) + timeTaken) / totalGames
            );
        }
    }

    // Store last played in UTC
    stats.lastPlayed = getCurrentUTCDay();
    storeStatistics(stats);
}

// Add new function to validate game state with API response
export function validateAndUpdateGameState(
    currentState: ElementGameState,
    apiGameNumber: number,
    apiElement: Element
): ElementGameState {
    // If game numbers don't match or it's a new day, reset the state
    if (currentState.gameNumber !== apiGameNumber || 
        !isSameUTCDay(currentState.currentDay, getCurrentUTCDay())) {
        return {
            ...getInitialGameState(),
            gameNumber: apiGameNumber,
            dailyElement: apiElement,
            currentDay: getCurrentUTCDay()
        };
    }

    return currentState;
}