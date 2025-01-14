// Shared types between frontend and worker
export interface Character {
    name: string;
    classic: {
        gender: string;
        race: string;
        "profession/occupation": string;
        "base of operations": string;
        affiliation: string;
        height: string;
        "first-appearance": string;
    };
    wiki: string;
    image: string;
    hints: {
        abilities: string[];
    };
}

export interface GuessResult {
    character: Character;
    matches: {
        gender: boolean;
        height: {
            isMatch: boolean;
            isHigher: boolean;
        };
        race: boolean;
        profession: boolean;
        location: boolean;
        affiliation: boolean;
        firstAppearance: {
            isMatch: boolean;
            isHigher: boolean;
        };
    };
}

export interface DailyGameState {
    solved_count: number;
    game_number: number;
    yesterday?: {
        element: Element;
        solved_count: number;
        game_number: number;
    };
    element: Element;
}

export interface UserStatistics {
    gamesPlayed: number;
    winRate: number;
    currentStreak: number;
    maxStreak: number;
    guessDistribution: Record<number, number>;
    bestTime: number | null;
    averageTime: number | null;
    lastPlayed: string | null;
}

export interface GameState {
    currentDay: string;
    dailyCharacter: Character | null;
    guesses: GuessResult[];
    gameStatus: 'in-progress' | 'won' | 'lost';
    startTime: number | null;
    endTime?: number;
    timeTaken?: number;
    hasStarted: boolean;
    statistics: UserStatistics;
}