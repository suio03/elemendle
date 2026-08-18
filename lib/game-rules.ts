import type { ElementGuessResult } from '@/types/element'

export const MAX_ATTEMPTS = 9
export const HINT_UNLOCK_ATTEMPTS = [5, 7, 8] as const
export const EASY_HINT_UNLOCK_ATTEMPTS = [3, 5, 7] as const

export function getUnlockedHintCount(
    guessCount: number,
    availableHints: number,
    unlockAttempts: readonly number[] = HINT_UNLOCK_ATTEMPTS
): number {
    return Math.min(
        availableHints,
        unlockAttempts.filter(attempt => guessCount >= attempt).length
    )
}

export function getNextHintUnlockAttempt(
    guessCount: number,
    unlockAttempts: readonly number[] = HINT_UNLOCK_ATTEMPTS
): number | null {
    return unlockAttempts.find(attempt => guessCount < attempt) ?? null
}

export function getNumericFeedback(comparison: { isMatch: boolean; isHigher: boolean }): 'exact' | 'higher' | 'lower' {
    if (comparison.isMatch) return 'exact'
    return comparison.isHigher ? 'lower' : 'higher'
}

export function getGuessShareRow(guess: ElementGuessResult): string {
    const numeric = [
        guess.matches.period,
        guess.matches.group,
        guess.matches.atomicNumber,
        guess.matches.atomicMass
    ]
    const categorical = [
        guess.matches.block,
        guess.matches.elementType,
        guess.matches.phase
    ]

    return [
        ...numeric.map(match => match.isMatch ? '🟩' : '🟥'),
        ...categorical.map(match => match ? '🟩' : '🟥')
    ].join('')
}

export function getShareGrid(guesses: ElementGuessResult[]): string {
    return guesses.map(getGuessShareRow).join('\n')
}
