import { ElementGameState, Element, type ElementStatistics } from "@/types/element";
import elementsData from "@/data/atom.json";

// Storage keys
const STORAGE_KEYS = {
    GAME_STATE: "element-guess-game",
    STATS: "element-guess-stats",
    HISTORY: "element-guess-history",
    USER_ID: "element-guess-uid",
    LAST_ELEMENT: "element-guess-last-element"
} as const;

const DAY_IN_MS = 86400000; // 24 hours in milliseconds

// Initialize functions
export function getInitialGameState(): ElementGameState {
    return {
        currentDay: "",
        dailyElement: null,
        guesses: [],
        gameStatus: "in-progress",
        startTime: null,
        hasStarted: false,
        statistics: getInitialStatistics()
    };
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
    
    return JSON.parse(stored);
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

export function getDailyElement(): Element {
    const elements = Object.values(elementsData);
    const now = new Date();
    const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    let index = Math.floor(utcDate.getTime() / DAY_IN_MS) % elements.length;
    
    const lastElementIndex = localStorage.getItem(STORAGE_KEYS.LAST_ELEMENT);
    
    if (lastElementIndex && parseInt(lastElementIndex, 10) === index) {
        index = (index + 1) % elements.length;
    }
    
    localStorage.setItem(STORAGE_KEYS.LAST_ELEMENT, index.toString());
    return elements[index];
}

export function isNewDay(storedDay: string): boolean {
    const currentDay = new Date().toDateString();
    return storedDay !== currentDay;
}

export function calculateTimeTaken(startTime: number | null, endTime: number): number {
    if (!startTime) return 0;
    return Math.floor((endTime - startTime) / 1000);
}

export function getPreviousElement(): Element | null {
    const lastElementIndex = localStorage.getItem(STORAGE_KEYS.LAST_ELEMENT);
    if (lastElementIndex) {
        const elements = Object.values(elementsData);
        return elements[parseInt(lastElementIndex, 10)];
    }
    return null;
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

    // Update streaks
    if (isWon) {
        stats.currentStreak += 1;
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

    stats.lastPlayed = new Date().toISOString();
    storeStatistics(stats);
}

interface GameHistory {
    date: string;
    element: string;
    guesses: number;
    timeTaken: number;
    won: boolean;
}

export function addToHistory(gameState: ElementGameState, timeTaken: number): void {
    if (typeof window === "undefined") return;

    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]') as GameHistory[];
    
    const newEntry: GameHistory = {
        date: new Date().toISOString(),
        element: gameState.dailyElement?.name || '',
        guesses: gameState.guesses.length,
        timeTaken: timeTaken,
        won: gameState.gameStatus === "won"
    };

    history.push(newEntry);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}