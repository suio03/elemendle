import { beforeEach, describe, expect, it } from 'vitest'
import elementsData from '@/data/atom.json'
import {
    addRecentQuestionIds,
    advanceChallengeSession,
    answerChallengeQuestion,
    createChallengeSession,
    createExtremeQuestion,
    createIdentityQuestion,
    createOddOneOutQuestion,
    getChallengePropertyValue,
    getExtremeValue
} from '@/lib/challenge'
import {
    CHALLENGE_STORAGE_KEY,
    getInitialChallengeData,
    getStoredChallengeData,
    storeChallengeData
} from '@/lib/challenge-storage'
import { PRACTICE_STORAGE_KEY } from '@/lib/practice-storage'

const elements = Object.values(elementsData)
const randomValues = [0.13, 0.87, 0.31, 0.66, 0.22, 0.74, 0.48, 0.91]
const createRandom = () => {
    let index = 0
    return () => randomValues[index++ % randomValues.length]
}

describe('challenge question generation', () => {
    it('creates an identity definition that matches exactly one element', () => {
        const question = createIdentityQuestion({ random: createRandom() })
        const matches = elements.filter(element => question.clues.every(clue =>
            getChallengePropertyValue(element, clue.property) === clue.value
        ))

        expect(question.clues.length).toBeGreaterThanOrEqual(3)
        expect(matches.map(element => element.name)).toEqual([question.answerElementName])
        expect(matches[0].classic.element_type).not.toBe('Unknown')
    })

    it('selects the true numeric extreme from four distinct choices', () => {
        const question = createExtremeQuestion({ random: createRandom() })
        const values = question.choiceElementNames.map(name => {
            const element = elements.find(candidate => candidate.name === name)!
            return getExtremeValue(element, question.property)!
        })
        const expected = question.direction === 'highest' ? Math.max(...values) : Math.min(...values)

        expect(new Set(values).size).toBe(4)
        expect(question.answerValue).toBe(expected)
    })

    it('creates one stated-property outlier among four choices', () => {
        const question = createOddOneOutQuestion({ random: createRandom() })
        const values = question.choiceElementNames.map(name => {
            const element = elements.find(candidate => candidate.name === name)!
            return getChallengePropertyValue(element, question.property)
        })

        expect(values.filter(value => value === question.commonValue)).toHaveLength(3)
        expect(values.filter(value => value === question.answerValue)).toHaveLength(1)
    })

    it('builds a five-question mixed session containing every question type', () => {
        const session = createChallengeSession('mixed', { now: 100, random: createRandom() })

        expect(session.questions).toHaveLength(5)
        expect(new Set(session.questions.map(question => question.kind))).toEqual(
            new Set(['identity', 'extreme', 'odd-one-out'])
        )
    })
})

describe('challenge session flow and storage', () => {
    beforeEach(() => localStorage.clear())

    it('answers once, advances, and completes only after question five', () => {
        let session = createChallengeSession('mixed', { now: 100, random: createRandom() })
        const first = session.questions[0]
        session = answerChallengeQuestion(session, first.answerElementName, 110)
        session = answerChallengeQuestion(session, 'Hydrogen', 111)

        expect(session.answers).toHaveLength(1)
        expect(session.answers[0].isCorrect).toBe(true)

        session = advanceChallengeSession(session, 120)
        expect(session.currentQuestionIndex).toBe(1)
        expect(session.completedAt).toBeUndefined()
    })

    it('persists independently from Classic Practice data', () => {
        const classicValue = JSON.stringify({ classic: true })
        localStorage.setItem(PRACTICE_STORAGE_KEY, classicValue)
        const currentSession = createChallengeSession('identity', { now: 100, random: createRandom() })
        const data = {
            ...getInitialChallengeData(),
            currentSession,
            recentQuestionIds: addRecentQuestionIds([], currentSession.questions)
        }

        storeChallengeData(data)

        expect(getStoredChallengeData().currentSession?.id).toBe('challenge:100:identity')
        expect(localStorage.getItem(PRACTICE_STORAGE_KEY)).toBe(classicValue)
    })

    it('recovers from damaged local data', () => {
        localStorage.setItem(CHALLENGE_STORAGE_KEY, '{broken')
        expect(getStoredChallengeData()).toEqual(getInitialChallengeData())
    })
})
