import { getCurrentUTCDay } from '@/lib/utils'
import type { ChallengeMode, ChallengeQuestionKind } from '@/types/challenge'

type GameMode = 'daily' | 'practice'
type GameResult = 'won' | 'lost'

interface AnalyticsEvents {
    learn_quiz_started: { lesson: 'clues' | 'first-20' }
    learn_quiz_answered: { lesson: 'clues' | 'first-20'; question: number; correct: boolean }
    learn_quiz_completed: { lesson: 'clues' | 'first-20'; correctAnswers: number; total: number }
    game_loaded: {
        locale: string
        mode: GameMode
        daysSinceLastPlay?: number
    }
    game_started: {
        locale: string
        mode: GameMode
    }
    guess_submitted: {
        mode: GameMode
        attemptNumber: number
    }
    hint_used: {
        mode: GameMode
        hintNumber: number
    }
    game_completed: {
        mode: GameMode
        result: GameResult
        attempts: number
        assistEnabled: boolean
    }
    share_clicked: {
        mode: GameMode
        result: GameResult
    }
    practice_started: {
        difficulty: 'easy' | 'standard'
    }
    challenge_started: {
        challengeMode: ChallengeMode
    }
    challenge_answered: {
        questionType: ChallengeQuestionKind
        questionNumber: number
        correct: boolean
    }
    challenge_completed: {
        challengeMode: ChallengeMode
        correctAnswers: number
    }
    collection_opened: {
        discoveredCount: number
    }
}

type PlausibleOptions = { props: Record<string, string | number | boolean | undefined> }
type PlausibleTracker = {
    (eventName: string, options: PlausibleOptions): void
    q?: [string, PlausibleOptions][]
}

type RecountTracker = {
    (eventName: string, options: PlausibleOptions): void
    q?: unknown[]
}

declare global {
    interface Window {
        dataLayer?: unknown[]
        gtag?: (...args: unknown[]) => void
        plausible?: PlausibleTracker
        recount?: RecountTracker
    }
}

const LAST_PLAY_DATE_KEY = 'elemendle-last-play-date'

export function trackEvent<EventName extends keyof AnalyticsEvents>(
    eventName: EventName,
    properties: AnalyticsEvents[EventName]
): void {
    if (typeof window === 'undefined') return

    // Preserve early events until the asynchronously loaded Plausible script drains q.
    try {
        if (!window.plausible) {
            const queuedTracker: PlausibleTracker = (name, options) => {
                queuedTracker.q?.push([name, options])
            }
            queuedTracker.q = []
            window.plausible = queuedTracker
        }
        window.plausible(eventName, { props: properties })
    } catch {
        // Analytics must not interrupt gameplay or the other analytics provider.
    }

    try {
        window.recount?.(eventName, { props: properties })
    } catch {
        // Recount runs alongside Plausible and must not affect it or gameplay.
    }

    try {
        window.dataLayer = window.dataLayer || []
        const gtag = window.gtag || function gtag(...args: unknown[]) {
            window.dataLayer?.push(args)
        }
        gtag('event', eventName, properties)
    } catch {
        // A blocked or failing provider must not affect game state updates.
    }
}

export function trackPageView(pathname: string): void {
    if (typeof window === 'undefined') return

    window.dataLayer = window.dataLayer || []
    const gtag = window.gtag || function gtag(...args: unknown[]) {
        window.dataLayer?.push(args)
    }
    gtag('event', 'page_view', {
        page_location: window.location.href,
        page_path: pathname,
        page_title: document.title
    })
}

export function getDaysSinceLastPlay(today = getCurrentUTCDay()): number | undefined {
    if (typeof window === 'undefined') return undefined

    const previousDay = localStorage.getItem(LAST_PLAY_DATE_KEY)
    if (!previousDay) return undefined

    const currentTime = Date.parse(`${today}T00:00:00.000Z`)
    const previousTime = Date.parse(`${previousDay}T00:00:00.000Z`)
    if (!Number.isFinite(currentTime) || !Number.isFinite(previousTime)) return undefined

    return Math.max(0, Math.floor((currentTime - previousTime) / 86_400_000))
}

export function markGamePlayed(today = getCurrentUTCDay()): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(LAST_PLAY_DATE_KEY, today)
}
