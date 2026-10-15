import moleculeData from '@/data/molecules.json'
import { ATOM_SYMBOLS } from '@/types/molecule-orders'
import type { AtomInventory, Molecule, MoleculeDifficulty, MoleculeMode, MoleculePuzzle, MoleculeSession } from '@/types/molecule-orders'

export const MOLECULES = moleculeData as Molecule[]
export const MOLECULE_BY_ID = new Map(MOLECULES.map(molecule => [molecule.id, molecule]))

export function canBuild(inventory: AtomInventory, recipeId: string): boolean {
    const molecule = MOLECULE_BY_ID.get(recipeId)
    return Boolean(molecule && ATOM_SYMBOLS.every(atom => (inventory[atom] || 0) >= (molecule.atoms[atom] || 0)))
}

export function remainingAtoms(puzzle: MoleculePuzzle, builds: string[]): AtomInventory | null {
    const remaining = { ...puzzle.inventory }
    for (const id of builds) {
        if (!puzzle.recipeIds.includes(id) || !canBuild(remaining, id)) return null
        const molecule = MOLECULE_BY_ID.get(id)!
        for (const atom of ATOM_SYMBOLS) remaining[atom] = (remaining[atom] || 0) - (molecule.atoms[atom] || 0)
    }
    return remaining
}

export function isEmpty(inventory: AtomInventory): boolean {
    return ATOM_SYMBOLS.every(atom => !inventory[atom])
}

// A bounded composition puzzle solver, not a chemical reaction predictor.
export function solveOrder(inventory: AtomInventory, recipeIds: string[]): string[] | null {
    const failed = new Set<string>()
    function visit(remaining: AtomInventory): string[] | null {
        if (isEmpty(remaining)) return []
        const key = ATOM_SYMBOLS.map(atom => remaining[atom] || 0).join(',')
        if (failed.has(key)) return null
        for (const id of recipeIds) {
            const next = remainingAtoms({ id: '', inventory: remaining, recipeIds }, [id])
            if (!next) continue
            const result = visit(next)
            if (result) return [id, ...result]
        }
        failed.add(key)
        return null
    }
    return visit(inventory)
}

export function puzzleId(inventory: AtomInventory, recipeIds: string[]): string {
    return `${ATOM_SYMBOLS.map(atom => inventory[atom] || 0).join(',')}:${[...recipeIds].sort().join(',')}`
}

function puzzle(inventory: AtomInventory, recipeIds: string[]): MoleculePuzzle {
    return { id: puzzleId(inventory, recipeIds), inventory, recipeIds }
}

export const TUTORIAL_PUZZLES: MoleculePuzzle[] = [
    puzzle({ H: 2, O: 1 }, ['water', 'hydrogen']),
    puzzle({ H: 4, O: 2, C: 1 }, ['water', 'carbon-dioxide', 'hydrogen'])
]

function shuffled<T>(values: T[], random: () => number): T[] {
    const result = [...values]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))))
        ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

// Small, validated catalogues are built only when that difficulty is played.
const catalogues = new Map<MoleculeDifficulty, MoleculePuzzle[]>()
function getCatalogue(difficulty: MoleculeDifficulty): MoleculePuzzle[] {
    const cached = catalogues.get(difficulty)
    if (cached) return cached
    const pool = MOLECULES.filter(item => difficulty === 'standard' || item.level === 'easy')
    const result = new Map<string, MoleculePuzzle>()
    for (let a = 0; a < pool.length; a++) {
        for (let b = a + 1; b < pool.length; b++) {
            for (const counts of [[1, 1], [1, 2], [2, 1], [2, 2]]) {
                const inventory: AtomInventory = {}
                for (const atom of ATOM_SYMBOLS) {
                    const count = (pool[a].atoms[atom] || 0) * counts[0] + (pool[b].atoms[atom] || 0) * counts[1]
                    if (count) inventory[atom] = count
                }
                const values = Object.values(inventory)
                if (values.length < 2 || values.length > 3 || values.reduce((sum, n) => sum + n, 0) > 18) continue
                const decoys = pool.filter(item => item !== pool[a] && item !== pool[b] && canBuild(inventory, item.id))
                for (const decoy of decoys) {
                    const ids = [pool[a].id, pool[b].id, decoy.id]
                    // A useful choice: at least one affordable recipe can leave an unsolvable remainder.
                    const remainder = remainingAtoms(puzzle(inventory, ids), [decoy.id])!
                    if (solveOrder(remainder, ids) !== null) continue
                    if (difficulty === 'standard') {
                        const extra = decoys.find(item => !ids.includes(item.id))
                        if (!extra) continue
                        ids.push(extra.id)
                        if (solveOrder(remainder, ids) !== null) continue
                    }
                    const next = puzzle(inventory, ids)
                    result.set(next.id, next)
                }
            }
        }
    }
    const catalogue = Array.from(result.values())
    catalogues.set(difficulty, catalogue)
    return catalogue
}

export function createMoleculeSession(mode: MoleculeMode, recentIds: string[] = [], random = Math.random, now = Date.now()): MoleculeSession {
    let puzzles: MoleculePuzzle[]
    if (mode === 'tutorial') {
        puzzles = TUTORIAL_PUZZLES.map(item => ({ ...item, inventory: { ...item.inventory }, recipeIds: [...item.recipeIds] }))
    } else {
        const catalogue = shuffled(getCatalogue(mode), random)
        const fresh = catalogue.filter(item => !recentIds.includes(item.id))
        const selected = [...fresh, ...catalogue.filter(item => recentIds.includes(item.id))].slice(0, 3)
        if (selected.length !== 3) throw new Error('Molecule orders require three distinct puzzles')
        puzzles = selected.map(item => ({ ...item, inventory: { ...item.inventory }, recipeIds: shuffled(item.recipeIds, random) }))
    }
    return {
        id: `molecules:${now}:${Math.floor(random() * 1e9)}`,
        mode, puzzles, builds: puzzles.map(() => []), round: 0, undos: 0, startedAt: now
    }
}

export function isRoundSolved(session: MoleculeSession): boolean {
    const remaining = remainingAtoms(session.puzzles[session.round], session.builds[session.round])
    return remaining !== null && isEmpty(remaining)
}

export function buildMolecule(session: MoleculeSession, recipeId: string, now = Date.now()): MoleculeSession {
    if (session.completedAt !== undefined || isRoundSolved(session)) return session
    const builds = session.builds.map(items => [...items])
    builds[session.round].push(recipeId)
    if (remainingAtoms(session.puzzles[session.round], builds[session.round]) === null) return session
    const next = { ...session, builds }
    if (isRoundSolved(next) && next.round === next.puzzles.length - 1) next.completedAt = now
    return next
}

export function undoMolecule(session: MoleculeSession): MoleculeSession {
    if (session.completedAt !== undefined || isRoundSolved(session) || session.builds[session.round].length === 0) return session
    return { ...session, undos: session.undos + 1, builds: session.builds.map((items, index) => index === session.round ? items.slice(0, -1) : items) }
}

export function advanceMoleculeRound(session: MoleculeSession): MoleculeSession {
    if (session.completedAt !== undefined || !isRoundSolved(session)) return session
    return { ...session, round: session.round + 1 }
}
