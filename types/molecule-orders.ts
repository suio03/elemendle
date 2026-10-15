import type { MoleculeLearning } from '@/lib/molecule-learning'

export const ATOM_SYMBOLS = ['H', 'O', 'C', 'N'] as const
export type AtomSymbol = typeof ATOM_SYMBOLS[number]
export type AtomInventory = Partial<Record<AtomSymbol, number>>
export type MoleculeDifficulty = 'easy' | 'standard'
export type MoleculeMode = MoleculeDifficulty | 'tutorial'

export interface Molecule {
    id: string
    formula: string
    atoms: AtomInventory
    level: MoleculeDifficulty
}

export interface MoleculePuzzle {
    id: string
    inventory: AtomInventory
    recipeIds: string[]
}

export interface MoleculeSession {
    id: string
    mode: MoleculeMode
    puzzles: MoleculePuzzle[]
    builds: string[][]
    round: number
    undos: number
    startedAt: number
    completedAt?: number
}

export interface MoleculeExploration {
    rulesVersion: 2
    hintRequested: boolean
    firstCompletedAt?: number
    id: string
    inventory: AtomInventory
    selected: AtomSymbol[]
    discoveries: string[]
    checked: boolean
    hintId: string | null
    checks: number
    startedAt: number
    completedAt?: number
}

export interface MoleculeData {
    learning?: MoleculeLearning | null
    exploration?: MoleculeExploration | null
    version: 1
    tutorialCompleted: boolean
    difficulty: MoleculeDifficulty
    session: MoleculeSession | null
    recentPuzzleIds: string[]
    updatedAt: number
}
