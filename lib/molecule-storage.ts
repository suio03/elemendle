import { normalizeMoleculeLearning } from '@/lib/molecule-learning'
import { normalizeExploration } from '@/lib/molecule-exploration'
import { z } from 'zod'
import { ATOM_SYMBOLS } from '@/types/molecule-orders'
import type { MoleculeData, MoleculeSession } from '@/types/molecule-orders'
import { MOLECULE_BY_ID, isEmpty, puzzleId, remainingAtoms, solveOrder } from '@/lib/molecule-orders'

export const MOLECULE_STORAGE_KEY = 'elemendle-molecule-orders-v1'
export const MOLECULE_UPDATED_EVENT = 'elemendle-molecules-updated'
const count = z.number().int().min(0).max(18)
const inventory = z.object({ H: count.optional(), O: count.optional(), C: count.optional(), N: count.optional() }).strict()
const recipeId = z.string().refine(id => MOLECULE_BY_ID.has(id))
const timestamp = z.number().finite().nonnegative()
const sessionSchema = z.object({
    id: z.string().min(1).max(100),
    mode: z.enum(['tutorial', 'easy', 'standard']),
    puzzles: z.array(z.object({ id: z.string().max(300), inventory, recipeIds: z.array(recipeId).min(2).max(4) })).min(2).max(3),
    builds: z.array(z.array(recipeId).max(9)).min(2).max(3),
    round: z.number().int().min(0).max(2),
    undos: z.number().int().nonnegative().max(100000),
    startedAt: timestamp,
    completedAt: timestamp.optional()
})

export function normalizeMoleculeSession(value: unknown): MoleculeSession | null {
    const parsed = sessionSchema.safeParse(value)
    if (!parsed.success) return null
    const session = parsed.data
    const length = session.mode === 'tutorial' ? 2 : 3
    if (session.puzzles.length !== length || session.builds.length !== length || session.round >= length) return null
    for (let i = 0; i < length; i++) {
        const p = session.puzzles[i]
        const total = ATOM_SYMBOLS.reduce((sum, atom) => sum + (p.inventory[atom] || 0), 0)
        if (!total || total > 18 || new Set(p.recipeIds).size !== p.recipeIds.length || p.id !== puzzleId(p.inventory, p.recipeIds)) return null
        if (solveOrder(p.inventory, p.recipeIds) === null) return null
        const remaining = remainingAtoms(p, session.builds[i])
        if (!remaining || (i < session.round && !isEmpty(remaining)) || (i > session.round && session.builds[i].length > 0)) return null
    }
    const finalRemaining = remainingAtoms(session.puzzles[length - 1], session.builds[length - 1])!
    const complete = session.round === length - 1 && isEmpty(finalRemaining)
    if (complete !== (session.completedAt !== undefined)) return null
    if (session.completedAt !== undefined && session.completedAt < session.startedAt) return null
    return session
}

export function initialMoleculeData(): MoleculeData {
    return { version: 1, tutorialCompleted: false, difficulty: 'easy', session: null, recentPuzzleIds: [], updatedAt: 0 }
}

export function normalizeMoleculeData(value: unknown): MoleculeData {
    const schema = z.object({
        version: z.literal(1), tutorialCompleted: z.boolean(), difficulty: z.enum(['easy', 'standard']),
        learning: z.unknown().optional(), session: z.unknown(), exploration: z.unknown().optional(), recentPuzzleIds: z.array(z.string().max(300)).max(30), updatedAt: timestamp
    })
    const parsed = schema.safeParse(value)
    if (!parsed.success) return initialMoleculeData()
    const result: MoleculeData = { ...parsed.data, learning: undefined, exploration: undefined, session: normalizeMoleculeSession(parsed.data.session) }
    if (parsed.data.exploration !== undefined) result.exploration = normalizeExploration(parsed.data.exploration)
    else delete result.exploration
    if (parsed.data.learning !== undefined) result.learning = normalizeMoleculeLearning(parsed.data.learning)
    else delete result.learning
    return result
}

export function getStoredMoleculeData(): MoleculeData {
    if (typeof window === 'undefined') return initialMoleculeData()
    try {
        return normalizeMoleculeData(JSON.parse(localStorage.getItem(MOLECULE_STORAGE_KEY) || 'null'))
    } catch {
        return initialMoleculeData()
    }
}

export function storeMoleculeData(data: MoleculeData): boolean {
    try {
        localStorage.setItem(MOLECULE_STORAGE_KEY, JSON.stringify(data))
        window.dispatchEvent(new Event(MOLECULE_UPDATED_EVENT))
        return true
    } catch {
        return false
    }
}

export function mergeMoleculeData(current: MoleculeData, imported: MoleculeData): MoleculeData {
    const latest = imported.updatedAt > current.updatedAt ? imported : current
    return {
        ...latest,
        ...(latest.learning === undefined && current.learning !== undefined ? { learning: current.learning } : {}),
        ...(latest.exploration === undefined && current.exploration !== undefined ? { exploration: current.exploration } : {}),
        tutorialCompleted: current.tutorialCompleted || imported.tutorialCompleted,
        recentPuzzleIds: Array.from(new Set([...latest.recentPuzzleIds, ...current.recentPuzzleIds, ...imported.recentPuzzleIds])).slice(0, 30)
    }
}
