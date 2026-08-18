import elementsData from '@/data/atom.json'
import { EASY_HINT_UNLOCK_ATTEMPTS, HINT_UNLOCK_ATTEMPTS } from '@/lib/game-rules'
import { getInitialStatistics } from '@/lib/storage'
import type { Element } from '@/types/element'
import type { PracticeDifficulty, PracticeGameState } from '@/types/practice'

const RECENT_TARGET_LIMIT = 5

interface SelectPracticeTargetOptions {
    dailyElementName?: string
    recentTargets?: string[]
    random?: () => number
    elements?: Element[]
}

export function selectPracticeTarget({
    dailyElementName,
    recentTargets = [],
    random = Math.random,
    elements = Object.values(elementsData)
}: SelectPracticeTargetOptions = {}): Element {
    if (elements.length === 0) throw new Error('Practice requires at least one element')

    const recent = new Set(recentTargets.slice(0, RECENT_TARGET_LIMIT))
    const withoutDailyOrRecent = elements.filter(element =>
        element.name !== dailyElementName && !recent.has(element.name)
    )
    const withoutDaily = elements.filter(element => element.name !== dailyElementName)
    const candidates = withoutDailyOrRecent.length > 0
        ? withoutDailyOrRecent
        : withoutDaily.length > 0
            ? withoutDaily
            : elements
    const randomIndex = Math.min(
        candidates.length - 1,
        Math.max(0, Math.floor(random() * candidates.length))
    )

    return candidates[randomIndex]
}

export function createPracticeGame(
    targetElement: Element,
    difficulty: PracticeDifficulty,
    now = Date.now()
): PracticeGameState {
    return {
        id: `practice:${now}:${targetElement.classic.atomic_number}`,
        difficulty,
        targetElement,
        createdAt: now,
        guesses: [],
        gameStatus: 'in-progress',
        startTime: null,
        hasStarted: false,
        hintsEnabled: true,
        revealedHints: [],
        dismissedHints: [],
        candidateMapEnabled: false,
        candidateMapUsed: false,
        statistics: getInitialStatistics()
    }
}

export function getPracticeHintUnlockAttempts(difficulty: PracticeDifficulty): readonly number[] {
    return difficulty === 'easy' ? EASY_HINT_UNLOCK_ATTEMPTS : HINT_UNLOCK_ATTEMPTS
}

export function addRecentPracticeTarget(recentTargets: string[], targetName: string): string[] {
    return [targetName, ...recentTargets.filter(name => name !== targetName)].slice(0, RECENT_TARGET_LIMIT)
}
