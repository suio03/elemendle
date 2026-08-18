import elementsData from '@/data/atom.json'
import type { Element } from '@/types/element'
import type {
    ChallengeAnswer,
    ChallengeClue,
    ChallengeClueProperty,
    ChallengeMode,
    ChallengeQuestion,
    ChallengeQuestionKind,
    ChallengeSession,
    ExtremeChallengeQuestion,
    ExtremeProperty,
    IdentityChallengeQuestion,
    OddOneOutChallengeQuestion,
    OddOneOutProperty
} from '@/types/challenge'

export const CHALLENGE_LENGTH = 5
export const RECENT_QUESTION_LIMIT = 20

const ALL_ELEMENTS = Object.values(elementsData) as Element[]
const CLUE_PROPERTIES: ChallengeClueProperty[] = ['period', 'group', 'block', 'phase', 'element-type']
const EXTREME_PROPERTIES: ExtremeProperty[] = ['atomic-number', 'atomic-mass', 'melting-point', 'boiling-point']
const ODD_ONE_OUT_PROPERTIES: OddOneOutProperty[] = ['period', 'group', 'block', 'phase', 'element-type']
const MIXED_SEQUENCE: ChallengeQuestionKind[] = ['identity', 'extreme', 'odd-one-out', 'identity', 'extreme']

interface CreateQuestionOptions {
    elements?: Element[]
    random?: () => number
}

interface CreateSessionOptions extends CreateQuestionOptions {
    now?: number
    recentQuestionIds?: string[]
}

function pick<T>(items: T[], random: () => number): T {
    if (items.length === 0) throw new Error('Cannot pick from an empty list')
    const index = Math.min(items.length - 1, Math.max(0, Math.floor(random() * items.length)))
    return items[index]
}

function shuffle<T>(items: T[], random: () => number): T[] {
    const shuffled = [...items]
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.min(index, Math.max(0, Math.floor(random() * (index + 1))))
        ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
    }
    return shuffled
}

export function getChallengePropertyValue(
    element: Element,
    property: ChallengeClueProperty
): string {
    switch (property) {
        case 'period': return element.classic.period
        case 'group': return element.classic.group
        case 'block': return element.classic.block
        case 'phase': return element.classic['phase-at-stp']
        case 'element-type': return element.classic.element_type
    }
}

export function getExtremeValue(element: Element, property: ExtremeProperty): number | null {
    const rawValue = property === 'atomic-number'
        ? element.classic.atomic_number
        : property === 'atomic-mass'
            ? element.classic.atomic_mass
            : property === 'melting-point'
                ? element['melting-point']
                : element['boiling-point']

    if (rawValue === null) return null
    const value = Number.parseFloat(rawValue)
    return Number.isFinite(value) ? value : null
}

function getIdentitySignature(element: Element): string {
    return CLUE_PROPERTIES.map(property => getChallengePropertyValue(element, property)).join('|')
}

export function createIdentityQuestion({
    elements = ALL_ELEMENTS,
    random = Math.random
}: CreateQuestionOptions = {}): IdentityChallengeQuestion {
    const signatureCounts = new Map<string, number>()
    for (const element of elements) {
        const signature = getIdentitySignature(element)
        signatureCounts.set(signature, (signatureCounts.get(signature) || 0) + 1)
    }

    const eligible = elements.filter(element =>
        element.classic.element_type !== 'Unknown' &&
        signatureCounts.get(getIdentitySignature(element)) === 1
    )
    if (eligible.length === 0) throw new Error('Identity challenges require a uniquely describable element')

    const target = pick(eligible, random)
    const orderedProperties = shuffle(CLUE_PROPERTIES, random)
    const clues: ChallengeClue[] = []

    for (const property of orderedProperties) {
        clues.push({ property, value: getChallengePropertyValue(target, property) })
        const matches = elements.filter(element => clues.every(clue =>
            getChallengePropertyValue(element, clue.property) === clue.value
        ))
        if (clues.length >= 3 && matches.length === 1) break
    }

    const clueId = clues.map(clue => `${clue.property}:${clue.value}`).sort().join('|')
    return {
        id: `identity:${target.name}:${clueId}`,
        kind: 'identity',
        answerElementName: target.name,
        clues
    }
}

export function createExtremeQuestion({
    elements = ALL_ELEMENTS,
    random = Math.random
}: CreateQuestionOptions = {}): ExtremeChallengeQuestion {
    const property = pick(EXTREME_PROPERTIES, random)
    const direction = random() < 0.5 ? 'lowest' : 'highest'
    const uniqueByValue = new Map<number, Element>()

    for (const element of shuffle(elements, random)) {
        const value = getExtremeValue(element, property)
        if (value !== null && !uniqueByValue.has(value)) uniqueByValue.set(value, element)
    }

    const candidates = shuffle(Array.from(uniqueByValue.values()), random).slice(0, 4)
    if (candidates.length < 4) throw new Error('Extreme challenges require four distinct numeric values')

    let answer = candidates[0]
    let answerValue = getExtremeValue(answer, property) as number
    for (const candidate of candidates.slice(1)) {
        const value = getExtremeValue(candidate, property) as number
        if ((direction === 'highest' && value > answerValue) || (direction === 'lowest' && value < answerValue)) {
            answer = candidate
            answerValue = value
        }
    }

    const choiceElementNames = shuffle(candidates, random).map(element => element.name)
    return {
        id: `extreme:${property}:${direction}:${[...choiceElementNames].sort().join(',')}`,
        kind: 'extreme',
        answerElementName: answer.name,
        property,
        direction,
        choiceElementNames,
        answerValue
    }
}

export function createOddOneOutQuestion({
    elements = ALL_ELEMENTS,
    random = Math.random
}: CreateQuestionOptions = {}): OddOneOutChallengeQuestion {
    const viableProperties = ODD_ONE_OUT_PROPERTIES.filter(property => {
        const counts = new Map<string, number>()
        for (const element of elements) {
            const value = getChallengePropertyValue(element, property)
            counts.set(value, (counts.get(value) || 0) + 1)
        }
        return Array.from(counts.values()).some(count => count >= 3) && counts.size > 1
    })
    const property = pick(viableProperties, random)
    const groups = new Map<string, Element[]>()

    for (const element of elements) {
        const value = getChallengePropertyValue(element, property)
        groups.set(value, [...(groups.get(value) || []), element])
    }

    const commonEntries = Array.from(groups.entries()).filter(([, group]) => group.length >= 3)
    const [commonValue, commonElements] = pick(commonEntries, random)
    const outliers = elements.filter(element => getChallengePropertyValue(element, property) !== commonValue)
    const answer = pick(outliers, random)
    const answerValue = getChallengePropertyValue(answer, property)
    const choices = [...shuffle(commonElements, random).slice(0, 3), answer]
    const choiceElementNames = shuffle(choices, random).map(element => element.name)

    return {
        id: `odd:${property}:${commonValue}:${answer.name}:${[...choiceElementNames].sort().join(',')}`,
        kind: 'odd-one-out',
        answerElementName: answer.name,
        property,
        choiceElementNames,
        commonValue,
        answerValue
    }
}

export function createChallengeQuestion(
    kind: ChallengeQuestionKind,
    options: CreateQuestionOptions = {}
): ChallengeQuestion {
    if (kind === 'identity') return createIdentityQuestion(options)
    if (kind === 'extreme') return createExtremeQuestion(options)
    return createOddOneOutQuestion(options)
}

export function createChallengeSession(
    mode: ChallengeMode,
    {
        elements = ALL_ELEMENTS,
        random = Math.random,
        now = Date.now(),
        recentQuestionIds = []
    }: CreateSessionOptions = {}
): ChallengeSession {
    const recent = new Set(recentQuestionIds)
    const used = new Set<string>()
    const questions: ChallengeQuestion[] = []

    for (let index = 0; index < CHALLENGE_LENGTH; index += 1) {
        const kind = mode === 'mixed' ? MIXED_SEQUENCE[index] : mode
        let question = createChallengeQuestion(kind, { elements, random })

        for (let attempt = 0; attempt < 40 && (recent.has(question.id) || used.has(question.id)); attempt += 1) {
            question = createChallengeQuestion(kind, { elements, random })
        }

        used.add(question.id)
        questions.push(question)
    }

    return {
        id: `challenge:${now}:${mode}`,
        mode,
        questions,
        currentQuestionIndex: 0,
        answers: [],
        startedAt: now
    }
}

export function answerChallengeQuestion(
    session: ChallengeSession,
    selectedElementName: string,
    now = Date.now()
): ChallengeSession {
    if (session.completedAt) return session
    const question = session.questions[session.currentQuestionIndex]
    if (!question || session.answers.some(answer => answer.questionId === question.id)) return session

    const answer: ChallengeAnswer = {
        questionId: question.id,
        selectedElementName,
        isCorrect: selectedElementName === question.answerElementName,
        answeredAt: now
    }

    return { ...session, answers: [...session.answers, answer] }
}

export function advanceChallengeSession(session: ChallengeSession, now = Date.now()): ChallengeSession {
    if (session.completedAt) return session
    const question = session.questions[session.currentQuestionIndex]
    const hasAnswered = question && session.answers.some(answer => answer.questionId === question.id)
    if (!hasAnswered) return session

    if (session.currentQuestionIndex >= session.questions.length - 1) {
        return { ...session, completedAt: now }
    }

    return { ...session, currentQuestionIndex: session.currentQuestionIndex + 1 }
}

export function addRecentQuestionIds(recentIds: string[], questions: ChallengeQuestion[]): string[] {
    return Array.from(new Set([
        ...questions.map(question => question.id),
        ...recentIds
    ])).slice(0, RECENT_QUESTION_LIMIT)
}

export function getChallengeScore(session: ChallengeSession): number {
    return session.answers.filter(answer => answer.isCorrect).length
}

export function getElementByName(name: string): Element | undefined {
    return ALL_ELEMENTS.find(element => element.name === name)
}
