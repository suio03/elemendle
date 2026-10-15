import { z } from 'zod'
import { MOLECULES } from '@/lib/molecule-orders'
import { composition, identifyMolecules } from '@/lib/molecule-exploration'
import { ATOM_SYMBOLS } from '@/types/molecule-orders'
import type { AtomSymbol } from '@/types/molecule-orders'

export const LEARNING_STAGES = ['learn', 'practice', 'compare', 'explore'] as const
export type LearningStage = typeof LEARNING_STAGES[number]
export const LESSONS = {
    learn: ['water', 'carbon-dioxide', 'methane'],
    practice: ['water', 'carbon-dioxide', 'methane'],
    compare: ['water', 'hydrogen-peroxide'],
    explore: []
} satisfies Record<LearningStage, string[]>

export interface MoleculeLearning {
    version: 1
    id: string
    stage: LearningStage
    index: number
    selected: AtomSymbol[]
    checked: boolean
    hintUsed: boolean
    attempts: number
    question: number
    seenIds: string[]
    independentIds: string[]
}

export function createMoleculeLearning(now = Date.now()): MoleculeLearning {
    return { version: 1, id: `learning:${now}`, stage: 'learn', index: 0, selected: [], checked: false, hintUsed: false, attempts: 0, question: 1, seenIds: [], independentIds: [] }
}

export function learningTarget(state: MoleculeLearning) {
    const id = LESSONS[state.stage][state.index]
    return MOLECULES.find(molecule => molecule.id === id)
}

export function learningCorrect(state: MoleculeLearning): boolean {
    if (!state.checked) return false
    const matches = identifyMolecules(composition(state.selected))
    const target = learningTarget(state)
    return target ? matches.some(molecule => molecule.id === target.id) : matches.length > 0
}

export function selectLearningAtom(state: MoleculeLearning, atom: AtomSymbol): MoleculeLearning {
    if (state.selected.length >= 12 || (state.stage !== 'explore' && learningCorrect(state))) return state
    return { ...state, selected: [...state.selected, atom], checked: false }
}

export function removeLearningAtom(state: MoleculeLearning, index: number): MoleculeLearning {
    if ((state.stage !== 'explore' && learningCorrect(state)) || !Number.isInteger(index) || index < 0 || index >= state.selected.length) return state
    return { ...state, selected: state.selected.filter((_, i) => i !== index), checked: false }
}

export function clearLearningModel(state: MoleculeLearning): MoleculeLearning {
    if (state.stage !== 'explore' && learningCorrect(state)) return state
    return { ...state, selected: [], checked: false }
}

export function showLearningHint(state: MoleculeLearning): MoleculeLearning {
    if (state.stage !== 'practice' || state.hintUsed || learningCorrect(state)) return state
    return { ...state, hintUsed: true }
}

export function checkLearningModel(state: MoleculeLearning): MoleculeLearning {
    if (!state.selected.length || state.checked) return state
    const next = { ...state, checked: true, attempts: state.attempts + 1 }
    if (!learningCorrect(next)) return next
    const target = learningTarget(state)
    const ids = target ? [target.id] : identifyMolecules(composition(state.selected)).map(molecule => molecule.id)
    return {
        ...next,
        seenIds: Array.from(new Set([...state.seenIds, ...ids])),
        independentIds: state.stage === 'practice' && !state.hintUsed && state.attempts === 0
            ? Array.from(new Set([...state.independentIds, ...ids]))
            : state.independentIds
    }
}

export function chooseLearningStage(state: MoleculeLearning, stage: LearningStage): MoleculeLearning {
    return { ...state, stage, index: 0, selected: [], checked: false, hintUsed: false, attempts: 0, question: state.question + 1 }
}

export function advanceLearning(state: MoleculeLearning): MoleculeLearning {
    if (state.stage === 'explore' || !learningCorrect(state)) return state
    if (state.index + 1 < LESSONS[state.stage].length) {
        return { ...state, index: state.index + 1, selected: [], checked: false, hintUsed: false, attempts: 0, question: state.question + 1 }
    }
    return chooseLearningStage(state, LEARNING_STAGES[LEARNING_STAGES.indexOf(state.stage) + 1])
}

export function learningDifferences(state: MoleculeLearning) {
    const target = learningTarget(state)
    if (!target) return []
    const selected = composition(state.selected)
    return ATOM_SYMBOLS.map(atom => ({ atom, difference: (target.atoms[atom] || 0) - (selected[atom] || 0) })).filter(item => item.difference !== 0)
}

export function normalizeMoleculeLearning(value: unknown): MoleculeLearning | null {
    const recipeId = z.string().refine(id => MOLECULES.some(molecule => molecule.id === id))
    const parsed = z.object({
        version: z.literal(1), id: z.string().min(1).max(100), stage: z.enum(LEARNING_STAGES), index: z.number().int().min(0).max(2),
        selected: z.array(z.enum(ATOM_SYMBOLS)).max(12), checked: z.boolean(), hintUsed: z.boolean(),
        attempts: z.number().int().nonnegative().max(100000), question: z.number().int().positive(),
        seenIds: z.array(recipeId).max(12), independentIds: z.array(recipeId).max(12)
    }).safeParse(value)
    if (!parsed.success) return null
    const s = parsed.data
    if (s.stage === 'explore' ? s.index !== 0 : s.index >= LESSONS[s.stage].length) return null
    if (s.checked && (!s.selected.length || !s.attempts)) return null
    if (s.hintUsed && s.stage !== 'practice') return null
    if (new Set(s.seenIds).size !== s.seenIds.length || new Set(s.independentIds).size !== s.independentIds.length || s.independentIds.some(id => !s.seenIds.includes(id))) return null
    if (learningCorrect(s)) {
        const target = learningTarget(s)
        const ids = target ? [target.id] : identifyMolecules(composition(s.selected)).map(m => m.id)
        if (ids.some(id => !s.seenIds.includes(id))) return null
    }
    return s
}
