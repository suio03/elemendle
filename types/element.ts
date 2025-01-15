// Basic element properties from atom.json
export interface ElementClassic {
    atomic_number: string;
    atomic_mass: string;
    period: string;
    group: string;
    "phase-at-stp": string;
    block: string;
    element_type: string;
}

// Main element interface matching atom.json structure
export interface Element {
    name: string;
    symbol: string;
    classic: ElementClassic;
    "melting-point": string;
    "boiling-point": string;
    "discovery-date": string;
    wiki: string;
    hints: {
        properties: string[];
    };
}

// Game state for element guessing
export interface ElementGameState {
    currentDay: string;
    dailyElement: Element | null;
    gameNumber: number;
    guesses: ElementGuessResult[];
    gameStatus: "in-progress" | "won" | "lost";
    startTime: number | null;
    timeTaken?: number;
    hasStarted: boolean;
    endTime?: number;
    statistics: ElementStatistics;
}

// Result of an element guess with numeric comparisons
export interface ElementGuessResult {
    element: Element;
    matches: {
        period: {
            isMatch: boolean;
            isHigher: boolean;
        };
        group: {
            isMatch: boolean;
            isHigher: boolean;
        };
        block: boolean;
        elementType: boolean;
        phase: boolean;
        atomicNumber: {
            isMatch: boolean;
            isHigher: boolean;
        };
        atomicMass: {
            isMatch: boolean;
            isHigher: boolean;
        };
    };
}

// Statistics for element game
export interface ElementStatistics {
    gamesPlayed: number;
    winRate: number;
    currentStreak: number;
    maxStreak: number;
    guessDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
        6: number;
        7: number;
        8: number;
    };
    bestTime: number | null;
    averageTime: number | null;
    lastPlayed: string | null;
}

// Element categories for visual representation
export type ElementCategory =
    | 'AlkaliMetal'
    | 'AlkalineEarthMetal'
    | 'TransitionMetal'
    | 'PostTransitionMetal'
    | 'Metalloid'
    | 'ReactiveNonMetal'
    | 'NobleGas'
    | 'Lanthanide'
    | 'Actinide'
    | 'Unknown';
