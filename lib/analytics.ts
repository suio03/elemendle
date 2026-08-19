import { getCurrentUTCDay } from '@/lib/utils'
import type { ChallengeMode, ChallengeQuestionKind } from '@/types/challenge'

type GameMode = 'daily' | 'practice'
type GameResult = 'won' | 'lost'

interface AnalyticsEvents {
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

declare global {
    interface Window {
        dataLayer?: unknown[]
        gtag?: (...args: unknown[]) => void
    }
}

const LAST_PLAY_DATE_KEY = 'elemendle-last-play-date'

export function trackEvent<EventName extends keyof AnalyticsEvents>(
    eventName: EventName,
    properties: AnalyticsEvents[EventName]
): void {
    if (typeof window === 'undefined') return

    window.dataLayer = window.dataLayer || []
    const gtag = window.gtag || function gtag(...args: unknown[]) {
        window.dataLayer?.push(args)
    }
    gtag('event', eventName, properties)
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
