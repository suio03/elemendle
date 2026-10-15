import { z } from 'zod'
import { MOLECULES } from '@/lib/molecule-orders'
import { ATOM_SYMBOLS } from '@/types/molecule-orders'
import type { AtomInventory, AtomSymbol, Molecule, MoleculeExploration } from '@/types/molecule-orders'

const TRAY_SOLUTIONS = [
    ['water', 'carbon-dioxide', 'hydrogen'],
    ['hydrogen', 'oxygen', 'ammonia'],
    ['methane', 'hydrogen', 'nitrogen'],
    ['water', 'methane', 'oxygen'],
    ['nitrous-oxide', 'nitric-oxide', 'nitrogen-dioxide']
]
const TRAYS = TRAY_SOLUTIONS.map(ids => {
    const inventory: AtomInventory = {}
    for (const id of ids) {
        const molecule = MOLECULES.find(item => item.id === id)!
        for (const atom of ATOM_SYMBOLS) inventory[atom] = (inventory[atom] || 0) + (molecule.atoms[atom] || 0)
    }
    return inventory
})
export const DISCOVERY_GOAL = 3

export function composition(selected: AtomSymbol[]): AtomInventory {
    const atoms: AtomInventory = {}
    for (const atom of selected) atoms[atom] = (atoms[atom] || 0) + 1
    return atoms
}

export function identifyMolecules(atoms: AtomInventory, catalogue: Molecule[] = MOLECULES): Molecule[] {
    return catalogue.filter(molecule => ATOM_SYMBOLS.every(atom => (atoms[atom] || 0) === (molecule.atoms[atom] || 0)))
}

export function possibleDiscoveries(inventory: AtomInventory): Molecule[] {
    return MOLECULES.filter(molecule => ATOM_SYMBOLS.every(atom => (inventory[atom] || 0) >= (molecule.atoms[atom] || 0)))
}

export function createExploration(previous?: MoleculeExploration | null, random = Math.random, now = Date.now()): MoleculeExploration {
    const trays = TRAYS.filter(tray => JSON.stringify(tray) !== JSON.stringify(previous?.inventory))
    const index = previous ? Math.min(trays.length - 1, Math.max(0, Math.floor(random() * trays.length))) : 0
    return { rulesVersion: 2, hintRequested: false, id: `explore:${now}:${Math.floor(random() * 1e9)}`, inventory: { ...trays[index] }, selected: [], discoveries: [], checked: false, hintId: null, checks: 0, startedAt: now }
}

// Stock is owned by either the tray, the assembly area, or a retained molecule.
export function freeAtoms(session: MoleculeExploration, includeSelected = true): AtomInventory {
    const used = includeSelected ? composition(session.selected) : {}
    for (const id of session.discoveries) {
        const molecule = MOLECULES.find(item => item.id === id)!
        for (const atom of ATOM_SYMBOLS) used[atom] = (used[atom] || 0) + (molecule.atoms[atom] || 0)
    }
    return Object.fromEntries(ATOM_SYMBOLS.map(atom => [atom, (session.inventory[atom] || 0) - (used[atom] || 0)]))
}

export function solveExploration(inventory: AtomInventory, retained: string[] = []): string[] | null {
    const required = DISCOVERY_GOAL - retained.length
    function search(stock: AtomInventory, chosen: string[]): string[] | null {
        if (chosen.length >= required) return chosen
        for (const molecule of possibleDiscoveries(stock)) {
            if (retained.includes(molecule.id) || chosen.includes(molecule.id)) continue
            const next = Object.fromEntries(ATOM_SYMBOLS.map(atom => [atom, (stock[atom] || 0) - (molecule.atoms[atom] || 0)]))
            const solution = search(next, [...chosen, molecule.id])
            if (solution) return solution
        }
        return null
    }
    return search(inventory, [])
}

export function addExplorationAtom(session: MoleculeExploration, atom: AtomSymbol): MoleculeExploration {
    if ((freeAtoms(session)[atom] || 0) <= 0) return session
    return { ...session, selected: [...session.selected, atom], checked: false }
}

export function removeExplorationAtom(session: MoleculeExploration, index: number): MoleculeExploration {
    if (!Number.isInteger(index) || index < 0 || index >= session.selected.length) return session
    return { ...session, selected: session.selected.filter((_, i) => i !== index), checked: false }
}

export function checkExploration(session: MoleculeExploration): MoleculeExploration {
    if (!session.selected.length || session.checked) return session
    return { ...session, checked: true, checks: session.checks + 1 }
}

export function keepExploration(session: MoleculeExploration, id: string, now = Date.now()): MoleculeExploration {
    if (!session.checked || session.discoveries.includes(id) || !identifyMolecules(composition(session.selected)).some(m => m.id === id)) return session
    const discoveries = [...session.discoveries, id]
    const completedAt = discoveries.length >= DISCOVERY_GOAL ? session.completedAt ?? now : undefined
    return { ...session, discoveries, selected: [], checked: false, hintId: null, hintRequested: false, completedAt, firstCompletedAt: session.firstCompletedAt ?? completedAt }
}

export function dismantleExploration(session: MoleculeExploration, id: string): MoleculeExploration {
    if (!session.discoveries.includes(id)) return session
    const discoveries = session.discoveries.filter(item => item !== id)
    return { ...session, discoveries, hintId: null, hintRequested: false, completedAt: discoveries.length >= DISCOVERY_GOAL ? session.completedAt : undefined }
}

export function recycleExploration(session: MoleculeExploration): MoleculeExploration {
    if (!session.selected.length && !session.hintRequested) return session
    return { ...session, selected: [], checked: false, hintId: null, hintRequested: false }
}

export function hintExploration(session: MoleculeExploration): MoleculeExploration {
    const solution = solveExploration(freeAtoms(session, false), session.discoveries)
    return { ...session, hintRequested: true, hintId: solution?.[0] ?? null }
}

export function normalizeExploration(value: unknown): MoleculeExploration | null {
    const count = z.number().int().min(0).max(12)
    const timestamp = z.number().finite().nonnegative()
    const parsed = z.object({
        rulesVersion: z.literal(2), hintRequested: z.boolean(),
        id: z.string().min(1).max(100),
        inventory: z.object({ H: count.optional(), O: count.optional(), C: count.optional(), N: count.optional() }).strict(),
        selected: z.array(z.enum(ATOM_SYMBOLS)).max(18),
        discoveries: z.array(z.string()).max(MOLECULES.length),
        checked: z.boolean(), hintId: z.string().nullable(), checks: z.number().int().min(0).max(100000),
        startedAt: timestamp, completedAt: timestamp.optional(), firstCompletedAt: timestamp.optional()
    }).safeParse(value)
    // Old exploration counted historical discoveries without reserving atoms; do not reinterpret those as retained molecules.
    if (!parsed.success) return null
    const s = parsed.data
    if (Object.values(s.inventory).reduce((sum, n) => sum + n, 0) > 18 || solveExploration(s.inventory) === null) return null
    const possible = possibleDiscoveries(s.inventory).map(m => m.id)
    if (new Set(s.discoveries).size !== s.discoveries.length || s.discoveries.some(id => !possible.includes(id))) return null
    if (Object.values(freeAtoms(s)).some(count => count < 0)) return null
    if (s.hintId !== null && (!s.hintRequested || s.discoveries.includes(s.hintId) || !possibleDiscoveries(freeAtoms(s, false)).some(m => m.id === s.hintId))) return null
    if (s.checked && (!s.selected.length || s.checks === 0)) return null
    if ((s.discoveries.length >= DISCOVERY_GOAL) !== (s.completedAt !== undefined)) return null
    if (s.completedAt !== undefined && (s.completedAt < s.startedAt || s.firstCompletedAt === undefined || s.firstCompletedAt > s.completedAt)) return null
    if (s.firstCompletedAt !== undefined && s.firstCompletedAt < s.startedAt) return null
    return s
}
