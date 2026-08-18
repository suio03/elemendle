"use client"

import { CircleHelp, FlaskConical } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { MAX_ATTEMPTS } from '@/lib/game-rules'

interface GameProgressProps {
    sessionLabel: string
    title: string
    goal: string
    guessCount: number
    hintsEnabled: boolean
    isComplete: boolean
    onToggleHints: () => void
}

export default function GameProgress({
    sessionLabel,
    title,
    goal,
    guessCount,
    hintsEnabled,
    isComplete,
    onToggleHints
}: GameProgressProps) {
    const t = useTranslations('game-board')
    const remaining = Math.max(0, MAX_ATTEMPTS - guessCount)

    return (
        <section className="mx-auto mb-4 w-full max-w-3xl rounded-2xl border border-[#9CCAD3]/35 bg-[#111820]/80 p-4 text-white shadow-xl backdrop-blur-md">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <span className="rounded-xl bg-[#73B9FF]/15 p-2 text-[#9CCAD3]" aria-hidden="true">
                        <FlaskConical className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9CCAD3]/70">
                            {sessionLabel}
                        </p>
                        <h1 className="mt-1 text-lg font-semibold text-white sm:text-xl">{title}</h1>
                        <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-300">{goal}</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onToggleHints}
                    disabled={isComplete}
                    aria-pressed={hintsEnabled}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#9CCAD3]/35 bg-white/5 px-3 text-sm font-medium text-[#C8E6EC] transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111820] disabled:cursor-default disabled:opacity-70"
                >
                    <CircleHelp className="h-4 w-4" aria-hidden="true" />
                    {hintsEnabled ? t('assist-on') : t('assist-off')}
                </button>
            </div>

            <div className="mt-4">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-200">
                        {t('progress', { used: guessCount, total: MAX_ATTEMPTS })}
                    </span>
                    <span className="text-slate-400">
                        {isComplete ? t('complete') : t('remaining', { count: remaining })}
                    </span>
                </div>
                <div
                    className="h-2 overflow-hidden rounded-full bg-white/10"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={MAX_ATTEMPTS}
                    aria-valuenow={guessCount}
                    aria-label={t('progress', { used: guessCount, total: MAX_ATTEMPTS })}
                >
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[#73B9FF] to-[#9CCAD3] transition-[width] duration-300 motion-reduce:transition-none"
                        style={{ width: `${(guessCount / MAX_ATTEMPTS) * 100}%` }}
                    />
                </div>
            </div>
        </section>
    )
}
