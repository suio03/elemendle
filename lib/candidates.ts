import elementsData from '@/data/atom.json'
import { compareElements } from '@/lib/element-game'
import type { Element, ElementGuessResult } from '@/types/element'

const ALL_ELEMENTS = Object.values(elementsData) as Element[]

export interface CandidateStage {
    guessNumber: number
    candidates: Element[]
}

export function hasEquivalentFeedback(
    expected: ElementGuessResult,
    actual: ElementGuessResult
): boolean {
    return expected.matches.period.isMatch === actual.matches.period.isMatch &&
        expected.matches.period.isHigher === actual.matches.period.isHigher &&
        expected.matches.group.isMatch === actual.matches.group.isMatch &&
        expected.matches.group.isHigher === actual.matches.group.isHigher &&
        expected.matches.block === actual.matches.block &&
        expected.matches.elementType === actual.matches.elementType &&
        expected.matches.phase === actual.matches.phase &&
        expected.matches.atomicNumber.isMatch === actual.matches.atomicNumber.isMatch &&
        expected.matches.atomicNumber.isHigher === actual.matches.atomicNumber.isHigher &&
        expected.matches.atomicMass.isMatch === actual.matches.atomicMass.isMatch &&
        expected.matches.atomicMass.isHigher === actual.matches.atomicMass.isHigher
}

export function filterCandidateElements(
    guesses: ElementGuessResult[],
    elements: Element[] = ALL_ELEMENTS
): Element[] {
    if (guesses.length === 0) return elements.slice()

    return elements.filter(candidate => guesses.every(guess =>
        hasEquivalentFeedback(guess, compareElements(guess.element, candidate))
    ))
}

export function getCandidateStages(
    guesses: ElementGuessResult[],
    elements: Element[] = ALL_ELEMENTS
): CandidateStage[] {
    const stages: CandidateStage[] = [{ guessNumber: 0, candidates: elements.slice() }]
    let candidates = elements

    for (let index = 0; index < guesses.length; index += 1) {
        const guess = guesses[index]
        candidates = candidates.filter(candidate =>
            hasEquivalentFeedback(guess, compareElements(guess.element, candidate))
        )
        stages.push({ guessNumber: index + 1, candidates })
    }

    return stages
}
