"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { CircleHelp, SendHorizontal, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import ReactConfetti from 'react-confetti'
import { useReducedMotion } from 'framer-motion'
import ElementBox from '@/components/element-box'
import CandidateMap from '@/components/candidate-map'
import ElementGrid from '@/components/element-grid'
import GameProgress from '@/components/game-progress'
import GuessCard from '@/components/guess-card'
import { Button } from '@/components/ui/button'
import { getNextHintUnlockAttempt, getUnlockedHintCount } from '@/lib/game-rules'
import { useElementGame, type UseElementGameOptions } from '@/hooks/use-element-game'
import type { Element, ElementCategory, ElementGameSessionState } from '@/types/element'

interface ElementGameSurfaceProps<State extends ElementGameSessionState>
    extends UseElementGameOptions<State> {
    sessionLabel: string
    title: string
    goal: string
    hintUnlockAttempts: readonly number[]
    statusContent?: ReactNode
    footerContent?: ReactNode
    renderResult: (state: State) => ReactNode
}

function useViewportSize() {
    const [size, setSize] = useState({ width: 0, height: 0 })

    useEffect(() => {
        const updateSize = () => setSize({
            width: window.innerWidth,
            height: window.innerHeight
        })
        updateSize()
        window.addEventListener('resize', updateSize)
        return () => window.removeEventListener('resize', updateSize)
    }, [])

    return size
}

export default function ElementGameSurface<State extends ElementGameSessionState>({
    mode,
    targetElement,
    createInitialState,
    saveState,
    settleState,
    onWin,
    sessionLabel,
    title,
    goal,
    hintUnlockAttempts,
    statusContent,
    footerContent,
    renderResult
}: ElementGameSurfaceProps<State>) {
    const t = useTranslations('game-board')
    const shouldReduceMotion = useReducedMotion()
    const { width, height } = useViewportSize()
    const [isConfettiActive, setIsConfettiActive] = useState(false)
    const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const inputPanelRef = useRef<HTMLDivElement>(null)
    const previousGuessCountRef = useRef(0)

    const handleWin = useCallback(() => {
        if (!shouldReduceMotion) {
            setIsConfettiActive(true)
            if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current)
            confettiTimerRef.current = setTimeout(() => setIsConfettiActive(false), 5000)
        }
        onWin?.()
    }, [onWin, shouldReduceMotion])

    const {
        gameState,
        input,
        filteredElements,
        showSuggestions,
        activeSuggestionIndex,
        handleInput,
        handleInputKeyDown,
        handleGuess,
        selectElement,
        setHintsEnabled,
        setCandidateMapEnabled,
        revealHint,
        dismissHint,
        restoreHint
    } = useElementGame({
        mode,
        targetElement,
        createInitialState,
        saveState,
        settleState,
        onWin: handleWin
    })

    useEffect(() => () => {
        if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current)
    }, [])

    useEffect(() => {
        const guessCount = gameState.guesses.length
        if (guessCount > previousGuessCountRef.current && gameState.gameStatus === 'in-progress') {
            inputPanelRef.current?.scrollIntoView({
                behavior: shouldReduceMotion ? 'auto' : 'smooth',
                block: 'center'
            })
            inputRef.current?.focus({ preventScroll: true })
        }
        previousGuessCountRef.current = guessCount
    }, [gameState.gameStatus, gameState.guesses.length, shouldReduceMotion])

    const headerInfo = ['element', 'period', 'group', 'block', 'type', 'phase', 'atomic', 'mass'] as const
    const hintCount = getUnlockedHintCount(
        gameState.guesses.length,
        targetElement.hints.properties.length,
        hintUnlockAttempts
    )
    const nextHintAttempt = hintCount < targetElement.hints.properties.length
        ? getNextHintUnlockAttempt(gameState.guesses.length, hintUnlockAttempts)
        : null
    const inputId = `${mode}-element-guess`
    const suggestionsId = `${mode}-element-suggestions`

    return (
        <div className="mx-auto w-full max-w-6xl overflow-x-clip pb-8">
            {isConfettiActive && !shouldReduceMotion ? (
                <ReactConfetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={350}
                    gravity={0.25}
                />
            ) : null}

            <GameProgress
                sessionLabel={sessionLabel}
                title={title}
                goal={goal}
                guessCount={gameState.guesses.length}
                hintsEnabled={gameState.hintsEnabled}
                isComplete={gameState.gameStatus !== 'in-progress'}
                onToggleHints={setHintsEnabled}
            />

            {gameState.guesses.length > 0 ? (
                <section aria-label={t('guess-history')}>
                    <div className="space-y-3 lg:hidden">
                        {gameState.guesses.map((guess, index) => (
                            <GuessCard
                                key={`${guess.element.name}-${index}`}
                                guessResult={guess}
                                guessNumber={index + 1}
                            />
                        ))}
                    </div>

                    <div className="hidden overflow-x-auto rounded-2xl border border-white/10 bg-black/25 p-4 lg:block">
                        <div className="min-w-[900px]">
                            <div className="mb-3 grid grid-cols-8 gap-2">
                                {headerInfo.map(header => (
                                    <div
                                        key={header}
                                        className="min-w-0 border-b border-[#9CCAD3]/35 pb-2 text-center text-xs font-semibold uppercase tracking-wider text-[#C8E6EC]"
                                        title={t(`grid.headers.${header}.description`)}
                                    >
                                        {t(`grid.headers.${header}.label`)}
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3 [content-visibility:auto]">
                                {gameState.guesses.map((guess, index) => (
                                    <ElementGrid key={`${guess.element.name}-${index}`} guessResult={guess} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto mt-3 flex max-w-xl flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-slate-300" aria-label={t('feedback-legend')}>
                        <span><strong className="text-emerald-200">✓</strong> {t('feedback.exact')}</span>
                        <span><strong className="text-rose-200">↑</strong> {t('feedback.target-higher')}</span>
                        <span><strong className="text-rose-200">↓</strong> {t('feedback.target-lower')}</span>
                        <span><strong className="text-rose-200">≠</strong> {t('feedback.not-match')}</span>
                    </div>
                </section>
            ) : null}

            {gameState.gameStatus === 'in-progress' ? (
                <CandidateMap
                    guesses={gameState.guesses}
                    enabled={gameState.candidateMapEnabled}
                    assistEnabled={gameState.hintsEnabled}
                    onEnabledChange={setCandidateMapEnabled}
                />
            ) : null}

            {gameState.gameStatus === 'in-progress' ? (
                <div ref={inputPanelRef} className="mx-auto mt-4 w-full max-w-3xl rounded-2xl border border-[#9CCAD3]/35 bg-gradient-to-br from-[#141C24]/95 to-[#202A33]/95 p-4 text-white shadow-xl sm:p-6">
                    <div className="mb-4 rounded-xl border border-white/10 bg-black/15 p-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#C8E6EC]">
                            <CircleHelp className="h-4 w-4" aria-hidden="true" />
                            {t('hints-title')}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-slate-400">{t('hints-no-penalty')}</p>

                        {gameState.hintsEnabled ? (
                            <div className="mt-3 space-y-2">
                                {Array.from({ length: hintCount }, (_, hintIndex) => {
                                    const revealed = gameState.revealedHints.includes(hintIndex)
                                    const dismissed = gameState.dismissedHints.includes(hintIndex)

                                    if (!revealed) {
                                        return (
                                            <Button
                                                key={hintIndex}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => revealHint(hintIndex)}
                                                className="w-full border-[#9CCAD3]/35 bg-[#73B9FF]/10 text-[#C8E6EC] hover:bg-[#73B9FF]/20 hover:text-white"
                                            >
                                                {t('reveal-hint', { number: hintIndex + 1 })}
                                            </Button>
                                        )
                                    }

                                    if (dismissed) {
                                        return (
                                            <button
                                                key={hintIndex}
                                                type="button"
                                                onClick={() => restoreHint(hintIndex)}
                                                className="w-full rounded-lg border border-dashed border-[#9CCAD3]/30 px-3 py-2 text-left text-xs text-[#B9DCE3] hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF]"
                                            >
                                                {t('show-hint-again', { number: hintIndex + 1 })}
                                            </button>
                                        )
                                    }

                                    return (
                                        <div key={hintIndex} className="flex items-start justify-between gap-3 rounded-xl border border-amber-200/20 bg-amber-300/10 p-3 text-sm text-amber-50">
                                            <p className="min-w-0 break-words">
                                                <span className="font-bold">{t('hint-label', { number: hintIndex + 1 })}</span>{' '}
                                                {targetElement.hints.properties[hintIndex]}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => dismissHint(hintIndex)}
                                                aria-label={t('close-hint', { number: hintIndex + 1 })}
                                                className="shrink-0 rounded p-1 text-amber-100 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100"
                                            >
                                                <X className="h-4 w-4" aria-hidden="true" />
                                            </button>
                                        </div>
                                    )
                                })}

                                {nextHintAttempt ? (
                                    <p className="text-xs text-slate-400">
                                        {t('next-hint', { attempt: nextHintAttempt })}
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-400">{t('all-hints-unlocked')}</p>
                                )}
                            </div>
                        ) : (
                            <p className="mt-3 text-xs text-slate-400">{t('assist-disabled-message')}</p>
                        )}
                    </div>

                    <form
                        onSubmit={event => {
                            event.preventDefault()
                            handleGuess()
                        }}
                        className="flex items-start gap-2"
                    >
                        <div className="relative min-w-0 flex-1">
                            <label htmlFor={inputId} className="sr-only">{t('input-label')}</label>
                            <input
                                ref={inputRef}
                                id={inputId}
                                type="text"
                                value={input}
                                onChange={event => handleInput(event.target.value)}
                                onKeyDown={handleInputKeyDown}
                                placeholder={t('input-placeholder')}
                                autoComplete="off"
                                role="combobox"
                                aria-autocomplete="list"
                                aria-expanded={showSuggestions}
                                aria-controls={suggestionsId}
                                aria-activedescendant={showSuggestions ? `${mode}-element-option-${activeSuggestionIndex}` : undefined}
                                className="h-14 w-full rounded-xl border border-white/10 bg-white/10 px-4 text-[#D7EEF2] placeholder:text-[#9CCAD3]/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF]"
                            />

                            {showSuggestions && filteredElements.length > 0 ? (
                                <div
                                    id={suggestionsId}
                                    role="listbox"
                                    className="absolute z-50 mt-2 max-h-[22rem] w-full overflow-y-auto rounded-xl border border-[#73B9FF]/35 bg-[#17212A] p-2 shadow-2xl"
                                >
                                    {filteredElements.map((element, index) => (
                                        <button
                                            id={`${mode}-element-option-${index}`}
                                            key={element.name}
                                            type="button"
                                            role="option"
                                            aria-selected={index === activeSuggestionIndex}
                                            onMouseDown={event => event.preventDefault()}
                                            onClick={() => selectElement(element)}
                                            className={`flex w-full min-w-0 items-center gap-3 rounded-lg p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF] ${index === activeSuggestionIndex ? 'bg-[#73B9FF]/15' : 'hover:bg-white/5'}`}
                                        >
                                            <ElementBox
                                                number={element.classic.atomic_number}
                                                symbol={element.symbol}
                                                name={element.name}
                                                category={element.classic.element_type as ElementCategory}
                                                className="h-14 w-14 shrink-0"
                                            />
                                            <span className="min-w-0">
                                                <span className="block truncate font-medium text-[#C8E6EC]">
                                                    {element.name} ({element.symbol})
                                                </span>
                                                <span className="block break-words text-xs leading-relaxed text-slate-400">
                                                    {t('suggestion-details', {
                                                        group: element.classic.group,
                                                        period: element.classic.period,
                                                        phase: element.classic['phase-at-stp']
                                                    })}
                                                </span>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                        <Button
                            type="submit"
                            aria-label={t('submit')}
                            className="h-14 w-14 shrink-0 rounded-xl bg-[#3F83A5] text-white hover:bg-[#4F96B8] focus-visible:ring-[#9CCAD3]"
                        >
                            <SendHorizontal className="h-5 w-5" aria-hidden="true" />
                        </Button>
                    </form>
                </div>
            ) : null}

            {statusContent}
            {gameState.gameStatus !== 'in-progress' ? renderResult(gameState) : null}
            {footerContent}
        </div>
    )
}
