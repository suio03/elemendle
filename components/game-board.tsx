"use client"

import { useCallback, useEffect, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useGameAPI } from '@/app/hooks/useGameAPI'
import ElementGameSurface from '@/components/element-game-surface'
import GameResult from '@/components/game-result'
import { useProgression } from '@/hooks/use-progression'
import { getDaysSinceLastPlay, trackEvent } from '@/lib/analytics'
import { HINT_UNLOCK_ATTEMPTS } from '@/lib/game-rules'
import { getDiscoveryOutcome, recordElementDiscovery } from '@/lib/progression'
import {
    addToHistory,
    getStoredGameState,
    storeGameState,
    updateStatistics,
    validateAndUpdateGameState
} from '@/lib/storage'
import type { Element, ElementGameState } from '@/types/element'

interface DailyGame {
    element: Element
    game_number: number
    solved_count: number
    yesterday?: {
        game_number: number
        element: Element
    }
}

export default function GameBoard() {
    const t = useTranslations('game-board')
    const locale = useLocale()
    const { dailyGame, isLoading, error, incrementCompletions } = useGameAPI()
    const loadedGameRef = useRef<number | null>(null)

    useEffect(() => {
        if (!dailyGame || loadedGameRef.current === dailyGame.game_number) return

        loadedGameRef.current = dailyGame.game_number
        trackEvent('game_loaded', {
            locale,
            mode: 'daily',
            daysSinceLastPlay: getDaysSinceLastPlay()
        })
    }, [dailyGame, locale])

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center" role="status">
                <div className="animate-pulse text-[#C8E6EC] motion-reduce:animate-none">{t('loading')}</div>
            </div>
        )
    }

    if (error || !dailyGame) {
        return (
            <div className="mx-auto my-12 max-w-lg rounded-xl border border-rose-300/30 bg-rose-950/70 p-5 text-center text-rose-100" role="alert">
                {t('load-error')}
            </div>
        )
    }

    return (
        <LoadedDailyGame
            key={dailyGame.game_number}
            dailyGame={dailyGame}
            incrementCompletions={incrementCompletions}
        />
    )
}

function LoadedDailyGame({
    dailyGame,
    incrementCompletions
}: {
    dailyGame: DailyGame
    incrementCompletions: () => Promise<void>
}) {
    const t = useTranslations('game-board')
    const progression = useProgression()
    const discoveryEventId = `daily:${dailyGame.game_number}`
    const createInitialState = useCallback(() => validateAndUpdateGameState(
        getStoredGameState(),
        dailyGame.game_number,
        dailyGame.element
    ), [dailyGame.element, dailyGame.game_number])
    const settleState = useCallback((state: ElementGameState, timeTaken: number) => {
        const statistics = updateStatistics(state, timeTaken)
        const settled = { ...state, statistics }
        addToHistory(settled, timeTaken)
        if (state.gameStatus === 'won') {
            recordElementDiscovery({
                eventId: discoveryEventId,
                elementName: dailyGame.element.name,
                source: 'daily',
                attempts: state.guesses.length,
                timeTaken
            })
        }
        return settled
    }, [dailyGame.element.name, discoveryEventId])
    const handleWin = useCallback(() => {
        void incrementCompletions()
    }, [incrementCompletions])

    return (
        <ElementGameSurface
            mode="daily"
            targetElement={dailyGame.element}
            createInitialState={createInitialState}
            saveState={storeGameState}
            settleState={settleState}
            onWin={handleWin}
            sessionLabel={t('game-number', { number: dailyGame.game_number })}
            title={t('title')}
            goal={t('goal')}
            hintUnlockAttempts={HINT_UNLOCK_ATTEMPTS}
            statusContent={(
                <p className="my-4 text-center text-sm font-medium text-slate-300">
                    <span className="font-bold text-rose-200">{dailyGame.solved_count}</span>{' '}
                    {t('solved-count', { count: dailyGame.solved_count })}
                </p>
            )}
            footerContent={dailyGame.yesterday ? (
                <div className="mx-auto my-5 w-full max-w-lg rounded-xl border border-white/10 bg-black/20 p-4 text-center text-sm text-slate-300">
                    {t('yesterday-element', {
                        gameNumber: dailyGame.yesterday.game_number,
                        element: dailyGame.yesterday.element.name
                    })}
                </div>
            ) : null}
            renderResult={state => (
                <GameResult
                    mode="daily"
                    result={state.gameStatus === 'won' ? 'won' : 'lost'}
                    attempts={state.guesses.length}
                    timeTaken={state.timeTaken || 0}
                    assistUsed={state.revealedHints.length > 0 || state.candidateMapUsed}
                    element={dailyGame.element}
                    guesses={state.guesses}
                    gameNumber={dailyGame.game_number}
                    streak={state.statistics.currentStreak}
                    discovery={progression ? getDiscoveryOutcome(progression, discoveryEventId, dailyGame.element.name) : null}
                />
            )}
        />
    )
}
