"use client"

import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Atom, Play } from 'lucide-react'
import { useTranslations } from 'next-intl'
import ElementGameSurface from '@/components/element-game-surface'
import GameResult from '@/components/game-result'
import PracticeDifficultyPicker from '@/components/practice-difficulty-picker'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { trackEvent } from '@/lib/analytics'
import { useProgression } from '@/hooks/use-progression'
import { getDiscoveryOutcome, recordElementDiscovery } from '@/lib/progression'
import {
    addRecentPracticeTarget,
    createPracticeGame,
    getPracticeHintUnlockAttempts,
    selectPracticeTarget
} from '@/lib/practice'
import { getStoredPracticeData, storePracticeData } from '@/lib/practice-storage'
import { getStoredGameState } from '@/lib/storage'
import type { PracticeData, PracticeDifficulty, PracticeGameState } from '@/types/practice'

export default function ClassicPracticeBoard() {
    const t = useTranslations('practice')
    const [practiceData, setPracticeData] = useState<PracticeData | null>(null)

    useEffect(() => {
        setPracticeData(getStoredPracticeData())
    }, [])

    const updateDifficulty = (difficulty: PracticeDifficulty) => {
        if (!practiceData) return
        const next = { ...practiceData, difficulty }
        setPracticeData(next)
        storePracticeData(next)
    }

    const startPractice = () => {
        if (!practiceData) return
        const dailyElementName = getStoredGameState().dailyElement?.name
        const targetElement = selectPracticeTarget({
            dailyElementName,
            recentTargets: practiceData.recentTargets
        })
        const currentGame = createPracticeGame(targetElement, practiceData.difficulty)
        const next: PracticeData = {
            ...practiceData,
            currentGame,
            recentTargets: addRecentPracticeTarget(practiceData.recentTargets, targetElement.name)
        }

        setPracticeData(next)
        storePracticeData(next)
        trackEvent('practice_started', { difficulty: practiceData.difficulty })
    }

    const saveCurrentGame = useCallback((currentGame: PracticeGameState) => {
        setPracticeData(current => {
            if (!current) return current
            const next = { ...current, currentGame }
            storePracticeData(next)
            return next
        })
    }, [])

    if (!practiceData) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center" role="status">
                <div className="animate-pulse text-[#C8E6EC] motion-reduce:animate-none">{t('loading')}</div>
            </div>
        )
    }

    if (!practiceData.currentGame) {
        return (
            <section className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-[#9CCAD3]/40 bg-[#0D151C]/95 text-white shadow-2xl backdrop-blur-xl">
                <div className="relative overflow-hidden border-b border-white/10 px-5 py-8 text-center sm:px-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(115,185,255,0.2),transparent_55%)]" />
                    <div className="relative">
                        <Link
                            href="/practice"
                            className="absolute left-0 top-0 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#B9DCE3] hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF]"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            {t('back-to-challenges')}
                        </Link>
                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#9CCAD3]/30 bg-[#73B9FF]/10 text-[#C8E6EC] shadow-[0_0_35px_rgba(115,185,255,0.16)]">
                            <Atom className="h-7 w-7" aria-hidden="true" />
                        </span>
                        <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-[#9CCAD3]/70">{t('eyebrow')}</p>
                        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t('welcome-title')}</h1>
                        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">{t('welcome-description')}</p>
                    </div>
                </div>

                <div className="space-y-5 p-5 sm:p-8">
                    <div>
                        <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#9CCAD3]">{t('choose-difficulty')}</h2>
                        <PracticeDifficultyPicker
                            value={practiceData.difficulty}
                            onChange={updateDifficulty}
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={startPractice}
                        className="h-14 w-full rounded-xl bg-[#73B9FF] text-base font-bold text-[#071319] hover:bg-[#8BC8E4]"
                    >
                        <Play className="mr-2 h-5 w-5 fill-current" aria-hidden="true" />
                        {t('start')}
                    </Button>
                    <p className="text-center text-xs leading-relaxed text-slate-500">{t('local-note')}</p>
                </div>
            </section>
        )
    }

    return (
        <LoadedPracticeGame
            key={practiceData.currentGame.id}
            game={practiceData.currentGame}
            nextDifficulty={practiceData.difficulty}
            onDifficultyChange={updateDifficulty}
            onPlayAgain={startPractice}
            saveState={saveCurrentGame}
        />
    )
}

function LoadedPracticeGame({
    game,
    nextDifficulty,
    onDifficultyChange,
    onPlayAgain,
    saveState
}: {
    game: PracticeGameState
    nextDifficulty: PracticeDifficulty
    onDifficultyChange: (difficulty: PracticeDifficulty) => void
    onPlayAgain: () => void
    saveState: (state: PracticeGameState) => void
}) {
    const t = useTranslations('practice')
    const progression = useProgression()
    const createInitialState = useCallback(() => game, [game])
    const settleState = useCallback((state: PracticeGameState, timeTaken: number) => {
        if (state.gameStatus === 'won') {
            recordElementDiscovery({
                eventId: `classic:${game.id}`,
                elementName: game.targetElement.name,
                source: 'classic',
                attempts: state.guesses.length,
                timeTaken
            })
        }
        return state
    }, [game.id, game.targetElement.name])

    return (
        <ElementGameSurface
            mode="practice"
            targetElement={game.targetElement}
            createInitialState={createInitialState}
            saveState={saveState}
            settleState={settleState}
            sessionLabel={t('session-label', { difficulty: t(`difficulty.${game.difficulty}.title`) })}
            title={t('game-title')}
            goal={t('game-goal')}
            hintUnlockAttempts={getPracticeHintUnlockAttempts(game.difficulty)}
            renderResult={state => (
                <GameResult
                    mode="practice"
                    result={state.gameStatus === 'won' ? 'won' : 'lost'}
                    attempts={state.guesses.length}
                    timeTaken={state.timeTaken || 0}
                    assistUsed={state.revealedHints.length > 0 || state.candidateMapUsed}
                    element={game.targetElement}
                    guesses={state.guesses}
                    difficulty={game.difficulty}
                    nextDifficulty={nextDifficulty}
                    onDifficultyChange={onDifficultyChange}
                    onPlayAgain={onPlayAgain}
                    discovery={progression ? getDiscoveryOutcome(progression, `classic:${game.id}`, game.targetElement.name) : null}
                />
            )}
            footerContent={(
                <div className="mt-5 text-center">
                    <Link
                        href="/practice"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#B9DCE3] hover:bg-black/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF]"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        {t('back-to-challenges')}
                    </Link>
                </div>
            )}
        />
    )
}
