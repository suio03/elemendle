export type ChallengeQuestionKind = 'identity' | 'extreme' | 'odd-one-out'
export type ChallengeMode = 'mixed' | ChallengeQuestionKind

export type ChallengeClueProperty = 'period' | 'group' | 'block' | 'phase' | 'element-type'
export type ExtremeProperty = 'atomic-number' | 'atomic-mass' | 'melting-point' | 'boiling-point'
export type OddOneOutProperty = ChallengeClueProperty

export interface ChallengeClue {
    property: ChallengeClueProperty
    value: string
}

interface ChallengeQuestionBase {
    id: string
    kind: ChallengeQuestionKind
    answerElementName: string
}

export interface IdentityChallengeQuestion extends ChallengeQuestionBase {
    kind: 'identity'
    clues: ChallengeClue[]
}

export interface ExtremeChallengeQuestion extends ChallengeQuestionBase {
    kind: 'extreme'
    property: ExtremeProperty
    direction: 'highest' | 'lowest'
    choiceElementNames: string[]
    answerValue: number
}

export interface OddOneOutChallengeQuestion extends ChallengeQuestionBase {
    kind: 'odd-one-out'
    property: OddOneOutProperty
    choiceElementNames: string[]
    commonValue: string
    answerValue: string
}

export type ChallengeQuestion =
    | IdentityChallengeQuestion
    | ExtremeChallengeQuestion
    | OddOneOutChallengeQuestion

export interface ChallengeAnswer {
    questionId: string
    selectedElementName: string
    isCorrect: boolean
    answeredAt: number
}

export interface ChallengeSession {
    id: string
    mode: ChallengeMode
    questions: ChallengeQuestion[]
    currentQuestionIndex: number
    answers: ChallengeAnswer[]
    startedAt: number
    completedAt?: number
}

export interface ChallengeData {
    version: 1
    currentSession: ChallengeSession | null
    recentQuestionIds: string[]
}
