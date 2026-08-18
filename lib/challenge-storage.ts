import type {
    ChallengeAnswer,
    ChallengeData,
    ChallengeMode,
    ChallengeQuestion,
    ChallengeSession
} from '@/types/challenge'

export const CHALLENGE_STORAGE_KEY = 'elemendle-challenges-v1'
const CHALLENGE_SCHEMA_VERSION = 1
const CHALLENGE_MODES: ChallengeMode[] = ['mixed', 'identity', 'extreme', 'odd-one-out']

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === 'object' && value !== null
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function isChallengeQuestion(value: unknown): value is ChallengeQuestion {
    if (!isRecord(value) || typeof value.id !== 'string' || typeof value.answerElementName !== 'string') return false

    if (value.kind === 'identity') {
        return Array.isArray(value.clues) && value.clues.length >= 3 && value.clues.every(clue =>
            isRecord(clue) && typeof clue.property === 'string' && typeof clue.value === 'string'
        )
    }

    if (value.kind === 'extreme') {
        return typeof value.property === 'string' &&
            (value.direction === 'highest' || value.direction === 'lowest') &&
            isStringArray(value.choiceElementNames) &&
            typeof value.answerValue === 'number' && Number.isFinite(value.answerValue)
    }

    if (value.kind === 'odd-one-out') {
        return typeof value.property === 'string' &&
            isStringArray(value.choiceElementNames) &&
            typeof value.commonValue === 'string' &&
            typeof value.answerValue === 'string'
    }

    return false
}

function normalizeAnswers(value: unknown, questions: ChallengeQuestion[]): ChallengeAnswer[] {
    if (!Array.isArray(value)) return []
    const questionIds = new Set(questions.map(question => question.id))
    const seen = new Set<string>()
    const answers: ChallengeAnswer[] = []

    for (const answer of value) {
        if (!isRecord(answer) ||
            typeof answer.questionId !== 'string' ||
            !questionIds.has(answer.questionId) ||
            seen.has(answer.questionId) ||
            typeof answer.selectedElementName !== 'string' ||
            typeof answer.isCorrect !== 'boolean' ||
            typeof answer.answeredAt !== 'number' ||
            !Number.isFinite(answer.answeredAt)) continue

        seen.add(answer.questionId)
        answers.push(answer as unknown as ChallengeAnswer)
    }

    return answers
}

function normalizeSession(value: unknown): ChallengeSession | null {
    if (!isRecord(value) ||
        typeof value.id !== 'string' ||
        !CHALLENGE_MODES.includes(value.mode as ChallengeMode) ||
        !Array.isArray(value.questions) ||
        value.questions.length !== 5 ||
        !value.questions.every(isChallengeQuestion) ||
        typeof value.startedAt !== 'number' ||
        !Number.isFinite(value.startedAt)) return null

    const questions = value.questions as ChallengeQuestion[]
    const currentQuestionIndex = typeof value.currentQuestionIndex === 'number' && Number.isInteger(value.currentQuestionIndex)
        ? Math.min(questions.length - 1, Math.max(0, value.currentQuestionIndex))
        : 0
    const completedAt = typeof value.completedAt === 'number' && Number.isFinite(value.completedAt)
        ? value.completedAt
        : undefined

    return {
        id: value.id,
        mode: value.mode as ChallengeMode,
        questions,
        currentQuestionIndex,
        answers: normalizeAnswers(value.answers, questions),
        startedAt: value.startedAt,
        completedAt
    }
}

export function getInitialChallengeData(): ChallengeData {
    return {
        version: CHALLENGE_SCHEMA_VERSION,
        currentSession: null,
        recentQuestionIds: []
    }
}

export function normalizeChallengeData(value: unknown): ChallengeData {
    if (!isRecord(value) || value.version !== CHALLENGE_SCHEMA_VERSION) return getInitialChallengeData()

    return {
        version: CHALLENGE_SCHEMA_VERSION,
        currentSession: normalizeSession(value.currentSession),
        recentQuestionIds: isStringArray(value.recentQuestionIds)
            ? Array.from(new Set(value.recentQuestionIds)).slice(0, 20)
            : []
    }
}

export function getStoredChallengeData(): ChallengeData {
    if (typeof window === 'undefined') return getInitialChallengeData()

    try {
        return normalizeChallengeData(JSON.parse(localStorage.getItem(CHALLENGE_STORAGE_KEY) || 'null'))
    } catch {
        return getInitialChallengeData()
    }
}

export function storeChallengeData(data: ChallengeData): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(normalizeChallengeData(data)))
    } catch (error) {
        console.error('Failed to save challenge data:', error)
    }
}
