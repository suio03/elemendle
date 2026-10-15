import { beforeEach, describe, expect, it } from 'vitest'
import { advanceLearning, checkLearningModel, chooseLearningStage, clearLearningModel, createMoleculeLearning, learningCorrect, learningDifferences, learningTarget, normalizeMoleculeLearning, selectLearningAtom, showLearningHint } from '@/lib/molecule-learning'
import { getStoredMoleculeData, initialMoleculeData, storeMoleculeData } from '@/lib/molecule-storage'
import { exportGameData, importGameDataFromText } from '@/lib/data-transfer'
import type { MoleculeLearning } from '@/lib/molecule-learning'
import type { AtomSymbol } from '@/types/molecule-orders'

function answer(state: MoleculeLearning, atoms: AtomSymbol[]) {
    return checkLearningModel(atoms.reduce(selectLearningAtom, state))
}
beforeEach(() => localStorage.clear())

describe('molecule learning pathway', () => {
    it('moves from guided learning to recall and comparison only after a correct composition', () => {
        let s = createMoleculeLearning(100)
        expect(advanceLearning(s)).toBe(s)
        s = answer(s, ['H', 'H', 'O'])
        expect(learningCorrect(s)).toBe(true)
        expect(s.seenIds).toEqual(['water'])
        expect(s.independentIds).toEqual([])
        expect(checkLearningModel(s)).toBe(s)
        s = answer(advanceLearning(s), ['C', 'O', 'O'])
        s = answer(advanceLearning(s), ['C', 'H', 'H', 'H', 'H'])
        s = advanceLearning(s)
        expect(s.stage).toBe('practice')
        expect(s.selected).toEqual([])
        expect(s.hintUsed).toBe(false)
        expect(learningTarget(s)?.id).toBe('water')
    })
    it('counts only an unhinted first-attempt recall answer as independent', () => {
        const s = chooseLearningStage(createMoleculeLearning(), 'practice')
        expect(answer(s, ['H', 'H', 'O']).independentIds).toEqual(['water'])
        expect(answer(showLearningHint(s), ['H', 'H', 'O']).independentIds).toEqual([])
        let wrong = answer(s, ['H', 'H'])
        expect(learningDifferences(wrong)).toEqual([{ atom: 'O', difference: 1 }])
        wrong = answer(wrong, ['O'])
        expect(learningCorrect(wrong)).toBe(true)
        expect(wrong.independentIds).toEqual([])
        expect(wrong.attempts).toBe(2)
        const cleared = clearLearningModel(showLearningHint(s))
        expect(cleared.hintUsed).toBe(true)
    })
    it('explains missing and excess atoms and keeps comparison separate from recall credit', () => {
        const s = answer(createMoleculeLearning(), ['C', 'O', 'O'])
        expect(learningDifferences(s)).toEqual([{ atom: 'H', difference: 2 }, { atom: 'O', difference: -1 }, { atom: 'C', difference: -1 }])
        let compare = chooseLearningStage(s, 'compare')
        compare = advanceLearning(answer(compare, ['H', 'H', 'O']))
        expect(learningTarget(compare)?.id).toBe('hydrogen-peroxide')
        compare = answer(compare, ['H', 'H', 'O', 'O'])
        expect(compare.independentIds).toEqual([])
        expect(advanceLearning(compare).stage).toBe('explore')
    })
    it('keeps the model separate from learning records during free exploration', () => {
        let s = answer(chooseLearningStage(createMoleculeLearning(), 'explore'), ['H', 'H', 'O'])
        s = clearLearningModel(s)
        expect(s.selected).toEqual([])
        expect(s.seenIds).toEqual(['water'])
        s = answer(s, ['H', 'H', 'O'])
        expect(s.seenIds).toEqual(['water'])
        expect(s.independentIds).toEqual([])
    })
    it('restores hints and wrong attempts, rejects corrupt state and preserves learning when importing an old backup', () => {
        const learning = answer(showLearningHint(chooseLearningStage(createMoleculeLearning(100), 'practice')), ['H'])
        const data = { ...initialMoleculeData(), learning, updatedAt: 200 }
        storeMoleculeData(data)
        const backup = exportGameData()
        localStorage.clear()
        expect(importGameDataFromText(backup)).toBe(true)
        expect(getStoredMoleculeData()).toEqual(data)
        expect(normalizeMoleculeLearning({ ...learning, index: 9 })).toBeNull()
        expect(normalizeMoleculeLearning({ ...learning, attempts: 0 })).toBeNull()
        expect(normalizeMoleculeLearning({ ...learning, selected: ['X'] })).toBeNull()
        expect(normalizeMoleculeLearning({ ...learning, independentIds: ['water'], seenIds: [] })).toBeNull()
        const old = JSON.parse(backup)
        delete old.moleculeOrders.learning
        old.moleculeOrders.updatedAt = 300
        expect(importGameDataFromText(JSON.stringify(old))).toBe(true)
        expect(getStoredMoleculeData().learning).toEqual(learning)
    })
})
