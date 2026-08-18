import type { Element, ElementGameSessionState } from '@/types/element'

export type PracticeDifficulty = 'easy' | 'standard'

export interface PracticeGameState extends ElementGameSessionState {
    id: string
    difficulty: PracticeDifficulty
    targetElement: Element
    createdAt: number
}

export interface PracticeData {
    version: 1
    difficulty: PracticeDifficulty
    currentGame: PracticeGameState | null
    recentTargets: string[]
}
