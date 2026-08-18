"use client"

import { useMemo } from 'react'
import { ChevronDown, ChevronUp, Radar } from 'lucide-react'
import { useTranslations } from 'next-intl'
import elementsData from '@/data/atom.json'
import { getCandidateStages } from '@/lib/candidates'
import { getPeriodicPositions } from '@/lib/progression'
import { cn } from '@/lib/utils'
import type { Element, ElementGuessResult } from '@/types/element'

const elements = Object.values(elementsData) as Element[]
const elementByAtomicNumber = new Map(
    elements.map(element => [Number(element.classic.atomic_number), element])
)
const periodicPositions = getPeriodicPositions()

interface CandidateMapProps {
    guesses: ElementGuessResult[]
    enabled: boolean
    assistEnabled: boolean
    onEnabledChange: (enabled: boolean) => void
}

export default function CandidateMap({
    guesses,
    enabled,
    assistEnabled,
    onEnabledChange
}: CandidateMapProps) {
    const t = useTranslations('game-board.candidates')
    const stages = useMemo(
        () => enabled ? getCandidateStages(guesses, elements) : null,
        [enabled, guesses]
    )
    const remainingNames = useMemo(
        () => new Set(stages?.at(-1)?.candidates.map(element => element.name) || []),
        [stages]
    )

    if (guesses.length === 0) return null

    return (
        <section className="mx-auto mt-4 w-full max-w-3xl overflow-hidden rounded-2xl border border-[#9CCAD3]/25 bg-[#101820]/85 text-white shadow-lg backdrop-blur-md">
            <button
                type="button"
                onClick={() => onEnabledChange(!enabled)}
                disabled={!assistEnabled}
                aria-expanded={enabled}
                className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#73B9FF] disabled:cursor-not-allowed disabled:opacity-55 sm:px-5"
            >
                <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
                        <Radar className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-sm font-bold text-[#D7EEF2]">{t('title')}</span>
                        <span className="block text-xs leading-relaxed text-slate-400">
                            {assistEnabled ? t('description') : t('assist-required')}
                        </span>
                    </span>
                </span>
                {enabled ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-[#9CCAD3]" aria-hidden="true" />
                ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-[#9CCAD3]" aria-hidden="true" />
                )}
            </button>

            {enabled && stages ? (
                <div className="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
                    <div className="flex flex-wrap items-center gap-2" aria-label={t('trail-label')}>
                        {stages.map((stage, index) => (
                            <div key={stage.guessNumber} className="flex items-center gap-2">
                                {index > 0 ? <span className="text-xs text-slate-600" aria-hidden="true">→</span> : null}
                                <span
                                    className={cn(
                                        'rounded-full border px-2.5 py-1 text-xs font-bold tabular-nums',
                                        index === stages.length - 1
                                            ? 'border-cyan-200/35 bg-cyan-300/15 text-cyan-50'
                                            : 'border-white/10 bg-white/5 text-slate-400'
                                    )}
                                    aria-label={stage.guessNumber === 0
                                        ? t('initial-count', { count: stage.candidates.length })
                                        : t('guess-count', { guess: stage.guessNumber, count: stage.candidates.length })}
                                >
                                    {stage.candidates.length}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#9CCAD3]/70">{t('remaining-label')}</p>
                            <p className="mt-1 text-2xl font-black tabular-nums text-cyan-50" aria-live="polite">
                                {t('remaining-count', { count: remainingNames.size })}
                            </p>
                        </div>
                        <p className="max-w-xs text-right text-xs leading-relaxed text-slate-400">{t('map-help')}</p>
                    </div>

                    <div className="mt-4 overflow-x-auto pb-2" tabIndex={0} aria-label={t('map-label')}>
                        <div
                            className="grid min-w-[38rem] grid-cols-[repeat(18,minmax(0,1fr))] grid-rows-[repeat(10,2rem)] gap-1"
                            role="img"
                            aria-label={t('map-summary', { count: remainingNames.size })}
                        >
                            {periodicPositions.map(position => {
                                const element = position.atomicNumber
                                    ? elementByAtomicNumber.get(position.atomicNumber)
                                    : null
                                const isRemaining = element ? remainingNames.has(element.name) : false

                                return (
                                    <span
                                        key={position.atomicNumber || position.placeholder}
                                        className={cn(
                                            'flex min-w-0 items-center justify-center rounded border text-[0.62rem] font-black transition-colors',
                                            position.placeholder
                                                ? 'border-dashed border-[#9CCAD3]/20 text-[#9CCAD3]/45'
                                                : isRemaining
                                                    ? 'border-cyan-100/50 bg-cyan-300/20 text-cyan-50 shadow-[0_0_12px_rgba(103,232,249,0.18)]'
                                                    : 'border-white/[0.04] bg-black/15 text-slate-600'
                                        )}
                                        style={{ gridRow: position.row, gridColumn: position.column }}
                                        aria-label={element
                                            ? isRemaining
                                                ? t('candidate-element', { element: element.name })
                                                : t('excluded-element', { element: element.name })
                                            : t(`series.${position.placeholder}`)}
                                    >
                                        {element ? element.symbol : position.placeholder === 'lanthanide' ? '57–71' : '89–103'}
                                    </span>
                                )
                            })}
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    )
}
