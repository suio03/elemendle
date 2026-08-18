import { describe, expect, it } from 'vitest'
import elementsData from '@/data/atom.json'
import { filterCandidateElements, getCandidateStages, hasEquivalentFeedback } from '@/lib/candidates'
import { compareElements } from '@/lib/element-game'
import type { Element } from '@/types/element'

const elements = Object.values(elementsData) as Element[]
const byName = new Map(elements.map(element => [element.name, element]))

function element(name: string): Element {
    const value = byName.get(name)
    if (!value) throw new Error(`Missing test element: ${name}`)
    return value
}

describe('candidate filtering', () => {
    it('starts with all 118 elements and narrows monotonically', () => {
        const target = element('Gold')
        const guesses = [
            compareElements(element('Mercury'), target),
            compareElements(element('Platinum'), target)
        ]
        const stages = getCandidateStages(guesses, elements)

        expect(stages[0].candidates).toHaveLength(118)
        expect(stages[1].candidates.length).toBeLessThan(118)
        expect(stages[2].candidates.length).toBeLessThanOrEqual(stages[1].candidates.length)
        expect(stages.every(stage => stage.candidates.some(candidate => candidate.name === target.name))).toBe(true)
    })

    it('matches numeric direction and categorical feedback exactly', () => {
        const guess = element('Fluorine')
        const oxygenFeedback = compareElements(guess, element('Oxygen'))

        expect(hasEquivalentFeedback(oxygenFeedback, compareElements(guess, element('Oxygen')))).toBe(true)
        expect(hasEquivalentFeedback(oxygenFeedback, compareElements(guess, element('Neon')))).toBe(false)
        expect(hasEquivalentFeedback(oxygenFeedback, compareElements(guess, element('Chlorine')))).toBe(false)
    })

    it('keeps only candidates that reproduce every visible comparison', () => {
        const target = element('Oxygen')
        const guesses = [
            compareElements(element('Sulfur'), target),
            compareElements(element('Fluorine'), target)
        ]
        const candidates = filterCandidateElements(guesses, elements)

        expect(candidates.some(candidate => candidate.name === target.name)).toBe(true)
        for (const candidate of candidates) {
            guesses.forEach(guess => {
                expect(hasEquivalentFeedback(guess, compareElements(guess.element, candidate))).toBe(true)
            })
        }
    })

    it('reduces a winning guess to its unique element', () => {
        const target = element('Carbon')
        expect(filterCandidateElements([compareElements(target, target)], elements).map(item => item.name)).toEqual(['Carbon'])
    })
})
