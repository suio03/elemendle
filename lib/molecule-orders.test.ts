import { beforeEach, describe, expect, it } from 'vitest'
import elements from '@/data/atom.json'
import { advanceMoleculeRound, buildMolecule, canBuild, createMoleculeSession, isEmpty, isRoundSolved, MOLECULES, puzzleId, remainingAtoms, solveOrder, TUTORIAL_PUZZLES, undoMolecule } from '@/lib/molecule-orders'
import { getStoredMoleculeData, initialMoleculeData, MOLECULE_STORAGE_KEY, normalizeMoleculeData, normalizeMoleculeSession, storeMoleculeData } from '@/lib/molecule-storage'
import { exportGameData, importGameDataFromText } from '@/lib/data-transfer'
import type { MoleculeSession } from '@/types/molecule-orders'

function random(seed: number) {
    return () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
        return seed / 4294967296
    }
}
function finish(session: MoleculeSession): MoleculeSession {
    let next = session
    while (!next.completedAt) {
        const p = next.puzzles[next.round]
        const solution = solveOrder(remainingAtoms(p, next.builds[next.round])!, p.recipeIds)!
        for (const id of solution) next = buildMolecule(next, id, 500)
        if (!next.completedAt) next = advanceMoleculeRound(next)
    }
    return next
}

beforeEach(() => localStorage.clear())

describe('molecule catalogue and puzzle generation', () => {
    it('contains 12 unique formula-accurate recipes referencing real element symbols', () => {
        expect(MOLECULES).toHaveLength(12)
        expect(new Set(MOLECULES.map(m => m.id)).size).toBe(12)
        expect(MOLECULES.filter(m => m.level === 'easy')).toHaveLength(6)
        const symbols = new Set(Object.values(elements).map(e => e.symbol))
        for (const molecule of MOLECULES) {
            const parsed = Object.fromEntries(Array.from(molecule.formula.matchAll(/([A-Z][a-z]?)(\d*)/g)).map(([, atom, count]) => [atom, Number(count || 1)]))
            expect(parsed).toEqual(molecule.atoms)
            for (const [atom, count] of Object.entries(molecule.atoms)) {
                expect(symbols.has(atom)).toBe(true)
                expect(Number.isInteger(count) && count > 0).toBe(true)
            }
        }
    })

    it.each(['easy', 'standard'] as const)('generates varied, small, solvable %s orders with meaningful choices', difficulty => {
        const ids = new Set<string>()
        const recipes = new Set<string>()
        let recent: string[] = []
        for (let seed = 1; seed <= 100; seed++) {
            const session = createMoleculeSession(difficulty, recent, random(seed), 100)
            expect(session.puzzles).toHaveLength(3)
            expect(normalizeMoleculeSession(session)).toEqual(session)
            expect(new Set(session.puzzles.map(p => p.id)).size).toBe(3)
            for (const p of session.puzzles) {
                expect(recent).not.toContain(p.id)
                expect(p.recipeIds).toHaveLength(difficulty === 'easy' ? 3 : 4)
                expect(Object.keys(p.inventory).length).toBeLessThanOrEqual(3)
                expect(Object.values(p.inventory).reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(18)
                const solution = solveOrder(p.inventory, p.recipeIds)
                expect(solution).not.toBeNull()
                expect(isEmpty(remainingAtoms(p, solution!)!)).toBe(true)
                expect(p.recipeIds.every(id => canBuild(p.inventory, id))).toBe(true)
                expect(p.recipeIds.some(id => solveOrder(remainingAtoms(p, [id])!, p.recipeIds) === null)).toBe(true)
                p.recipeIds.forEach(id => recipes.add(id))
                ids.add(p.id)
            }
            recent = [...session.puzzles.map(p => p.id), ...recent].slice(0, 30)
        }
        expect(ids.size).toBeGreaterThan(35)
        expect(recipes.size).toBe(difficulty === 'easy' ? 6 : 12)
    })

    it('accepts different valid combinations and rejects foreign recipes or overspending', () => {
        const p = { id: '', inventory: { H: 4, O: 2 }, recipeIds: ['water', 'hydrogen', 'oxygen'] }
        expect(isEmpty(remainingAtoms(p, ['water', 'water'])!)).toBe(true)
        expect(isEmpty(remainingAtoms(p, ['hydrogen', 'oxygen', 'hydrogen'])!)).toBe(true)
        expect(remainingAtoms(p, ['water', 'water', 'water'])).toBeNull()
        expect(remainingAtoms(p, ['methane'])).toBeNull()
        expect(canBuild(p.inventory, 'unknown')).toBe(false)
    })
})

describe('session lifecycle and persistence', () => {
    it('teaches two orders, identifies dead ends, and restores atoms on undo', () => {
        let session = createMoleculeSession('tutorial', [], random(1), 100)
        expect(session.puzzles).toEqual(TUTORIAL_PUZZLES)
        expect(advanceMoleculeRound(session)).toBe(session)
        session = buildMolecule(session, 'hydrogen')
        const remaining = remainingAtoms(session.puzzles[0], session.builds[0])!
        expect(solveOrder(remaining, session.puzzles[0].recipeIds)).toBeNull()
        session = undoMolecule(session)
        expect(session.builds[0]).toEqual([])
        expect(session.undos).toBe(1)
        expect(remainingAtoms(session.puzzles[0], [])).toEqual(session.puzzles[0].inventory)
        const done = finish(session)
        expect(done.completedAt).toBe(500)
        expect(isRoundSolved(done)).toBe(true)
        expect(buildMolecule(done, 'water')).toBe(done)
        expect(advanceMoleculeRound(done)).toBe(done)
        expect(undoMolecule(done)).toBe(done)
        expect(normalizeMoleculeSession(done)).toEqual(done)
    })

    it('restores partial and completed games and rejects corrupt or impossible states', () => {
        const session = buildMolecule(createMoleculeSession('tutorial', [], random(4), 100), 'hydrogen')
        const data = { ...initialMoleculeData(), session, updatedAt: 200 }
        expect(storeMoleculeData(data)).toBe(true)
        expect(getStoredMoleculeData()).toEqual(data)
        expect(normalizeMoleculeSession({ ...session, round: 2 })).toBeNull()
        expect(normalizeMoleculeSession({ ...session, round: 1 })).toBeNull()
        expect(normalizeMoleculeSession({ ...session, completedAt: 200 })).toBeNull()
        expect(normalizeMoleculeSession({ ...session, builds: [['unknown'], []] })).toBeNull()
        const p = { inventory: { H: 1, O: 1 }, recipeIds: ['water', 'hydrogen'] }
        expect(normalizeMoleculeSession({ ...session, puzzles: [{ ...p, id: puzzleId(p.inventory, p.recipeIds) }, session.puzzles[1]] })).toBeNull()
        const done = { ...data, session: finish(undoMolecule(session)) }
        storeMoleculeData(done)
        expect(getStoredMoleculeData()).toEqual(done)
        localStorage.setItem(MOLECULE_STORAGE_KEY, 'invalid json')
        expect(getStoredMoleculeData()).toEqual(initialMoleculeData())
        expect(normalizeMoleculeData({ ...data, version: 2 })).toEqual(initialMoleculeData())
    })

    it('round-trips orders through backup without overwriting newer progress or resetting tutorial completion', () => {
        const data = { ...initialMoleculeData(), tutorialCompleted: true, session: createMoleculeSession('standard', [], random(2), 100), updatedAt: 200 }
        storeMoleculeData(data)
        const exported = exportGameData()
        localStorage.clear()
        expect(importGameDataFromText(exported)).toBe(true)
        expect(getStoredMoleculeData()).toEqual(data)
        const newer = { ...data, session: buildMolecule(data.session, data.session.puzzles[0].recipeIds[0]), updatedAt: 300 }
        storeMoleculeData(newer)
        expect(importGameDataFromText(exported)).toBe(true)
        expect(getStoredMoleculeData()).toEqual(newer)
    })
})
