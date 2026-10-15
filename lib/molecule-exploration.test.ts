import { beforeEach, describe, expect, it } from 'vitest'
import { addExplorationAtom, checkExploration, composition, createExploration, dismantleExploration, freeAtoms, hintExploration, identifyMolecules, keepExploration, normalizeExploration, possibleDiscoveries, recycleExploration, removeExplorationAtom, solveExploration } from '@/lib/molecule-exploration'
import { MOLECULE_BY_ID } from '@/lib/molecule-orders'
import { getStoredMoleculeData, initialMoleculeData, storeMoleculeData } from '@/lib/molecule-storage'
import { exportGameData, importGameDataFromText } from '@/lib/data-transfer'
import { ATOM_SYMBOLS } from '@/types/molecule-orders'
import type { AtomSymbol, Molecule, MoleculeExploration } from '@/types/molecule-orders'

function assemble(session: MoleculeExploration, atoms: AtomSymbol[]) {
    return atoms.reduce(addExplorationAtom, recycleExploration(session))
}
function keep(session: MoleculeExploration, atoms: AtomSymbol[], id: string, now = 200) {
    return keepExploration(checkExploration(assemble(session, atoms)), id, now)
}
function assertConserved(session: MoleculeExploration) {
    const free = freeAtoms(session)
    const selected = composition(session.selected)
    for (const atom of ATOM_SYMBOLS) {
        const held = session.discoveries.reduce((sum, id) => sum + (MOLECULE_BY_ID.get(id)!.atoms[atom] || 0), 0)
        expect((free[atom] || 0) + (selected[atom] || 0) + held).toBe(session.inventory[atom] || 0)
        expect(free[atom] || 0).toBeGreaterThanOrEqual(0)
    }
}
beforeEach(() => localStorage.clear())

describe('retained molecule assembly', () => {
    it('matches exact compositions and returns all candidates without automatically keeping them', () => {
        expect(identifyMolecules({ H: 2, O: 1 }).map(m => m.id)).toEqual(['water'])
        expect(identifyMolecules({ H: 3, O: 1 })).toEqual([])
        const candidates: Molecule[] = ['a', 'b'].map(id => ({ id, formula: 'C2H6O', atoms: { C: 2, H: 6, O: 1 }, level: 'standard' }))
        expect(identifyMolecules({ C: 2, H: 6, O: 1 }, candidates)).toHaveLength(2)
        const s = checkExploration(assemble(createExploration(), ['H', 'H', 'O']))
        expect(s.discoveries).toEqual([])
        expect(keepExploration(s, 'oxygen')).toBe(s)
    })
    it('reserves atoms on keep; clearing the bench cannot refund retained molecules', () => {
        let s = keep(createExploration(null, () => 0, 100), ['H', 'H', 'O'], 'water')
        expect(s.discoveries).toEqual(['water'])
        expect(s.selected).toEqual([])
        expect(freeAtoms(s)).toMatchObject({ H: 2, O: 2, C: 1 })
        expect(recycleExploration(s)).toBe(s)
        s = addExplorationAtom(s, 'H')
        expect(freeAtoms(s).H).toBe(1)
        s = recycleExploration(s)
        expect(freeAtoms(s).H).toBe(2)
        expect(s.discoveries).toEqual(['water'])
        const duplicate = checkExploration(assemble(s, ['H', 'H', 'O']))
        expect(keepExploration(duplicate, 'water')).toBe(duplicate)
        expect(duplicate.discoveries).toHaveLength(1)
        const restored = dismantleExploration(s, 'water')
        expect(restored.discoveries).toEqual([])
        expect(freeAtoms(restored)).toEqual(restored.inventory)
        for (const state of [s, duplicate, restored]) assertConserved(state)
    })
    it('rejects overdraws and supports undoing an individual atom', () => {
        let s = keep(createExploration(), ['H', 'H', 'H', 'H', 'C'], 'methane')
        expect(addExplorationAtom(s, 'H')).toBe(s)
        s = assemble(s, ['O', 'O', 'O', 'O'])
        expect(s.selected).toHaveLength(3)
        s = checkExploration(s)
        s = removeExplorationAtom(s, 0)
        expect(s.checked).toBe(false)
        expect(s.selected).toHaveLength(2)
        assertConserved(s)
    })
    it('requires simultaneous ownership and removes completion when a molecule is dismantled', () => {
        let s = keep(createExploration(null, () => 0, 100), ['H', 'H', 'O'], 'water', 200)
        s = keep(s, ['C', 'O', 'O'], 'carbon-dioxide', 300)
        s = keep(s, ['H', 'H'], 'hydrogen', 400)
        expect(s.completedAt).toBe(400)
        expect(s.firstCompletedAt).toBe(400)
        expect(Object.values(freeAtoms(s)).every(count => count === 0)).toBe(true)
        s = dismantleExploration(s, 'water')
        expect(s.completedAt).toBeUndefined()
        expect(s.discoveries).toHaveLength(2)
        expect(freeAtoms(s)).toMatchObject({ H: 2, O: 1 })
        s = keep(s, ['H', 'H', 'O'], 'water', 500)
        expect(s.completedAt).toBe(500)
        expect(s.firstCompletedAt).toBe(400)
        expect(normalizeExploration(s)).toEqual(s)
        assertConserved(s)
    })
    it('generates simultaneously solvable trays and hints that respect retained stock', () => {
        const found = new Set<string>()
        for (let i = 0; i < 20; i++) {
            const s = createExploration(createExploration(), () => i / 20, 100)
            const solution = solveExploration(s.inventory)
            expect(solution).toHaveLength(3)
            expect(new Set(solution).size).toBe(3)
            possibleDiscoveries(s.inventory).forEach(m => found.add(m.id))
            assertConserved({ ...s, discoveries: solution! })
        }
        expect(found.size).toBe(12)
        const s = keep(createExploration(), ['H', 'H', 'H', 'H', 'C'], 'methane')
        const stuck = hintExploration(s)
        expect(stuck.hintRequested).toBe(true)
        expect(stuck.hintId).toBeNull()
        expect(hintExploration(dismantleExploration(s, 'methane')).hintId).not.toBeNull()
    })
    it('backs up retained atoms, rejects inconsistent saves and resets old cumulative-discovery rules', () => {
        const exploration = keep(createExploration(null, () => 0, 100), ['H', 'H', 'O'], 'water', 200)
        const data = { ...initialMoleculeData(), exploration, updatedAt: 200 }
        storeMoleculeData(data)
        const backup = exportGameData()
        localStorage.clear()
        expect(importGameDataFromText(backup)).toBe(true)
        expect(getStoredMoleculeData()).toEqual(data)
        expect(normalizeExploration({ ...exploration, rulesVersion: undefined })).toBeNull()
        expect(normalizeExploration({ ...exploration, selected: ['H', 'H', 'H'] })).toBeNull()
        expect(normalizeExploration({ ...exploration, discoveries: ['water', 'methane'] })).toBeNull()
        expect(normalizeExploration({ ...exploration, discoveries: ['water', 'water'] })).toBeNull()
        expect(normalizeExploration({ ...exploration, completedAt: 200 })).toBeNull()
        expect(normalizeExploration({ ...exploration, inventory: { H: 4, O: 1 } })).toBeNull()
    })
})
