"use client"

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getNumericFeedback } from '@/lib/game-rules'
import { cn } from '@/lib/utils'
import type { ElementGuessResult } from '@/types/element'

interface GuessCardProps {
    guessResult: ElementGuessResult
    guessNumber: number
}

interface PropertyRowProps {
    label: string
    value: string
    feedback: 'exact' | 'higher' | 'lower' | 'mismatch'
}

function PropertyRow({ label, value, feedback }: PropertyRowProps) {
    const t = useTranslations('game-board')
    const exact = feedback === 'exact'
    const symbol = exact ? '✓' : feedback === 'higher' ? '↑' : feedback === 'lower' ? '↓' : '≠'
    const feedbackLabel = exact
        ? t('feedback.exact')
        : feedback === 'higher'
            ? t('feedback.target-higher')
            : feedback === 'lower'
                ? t('feedback.target-lower')
                : t('feedback.not-match')

    return (
        <div className={cn(
            'flex min-w-0 items-center justify-between gap-3 rounded-xl border px-3 py-2.5',
            exact
                ? 'border-emerald-400/35 bg-emerald-500/15'
                : 'border-rose-400/35 bg-rose-500/15'
        )}>
            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400">{label}</p>
                <p className="break-words text-sm font-semibold text-white">{value}</p>
            </div>
            <span
                className={cn(
                    'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-bold',
                    exact ? 'bg-emerald-400/20 text-emerald-200' : 'bg-rose-400/20 text-rose-100'
                )}
                aria-label={feedbackLabel}
                title={feedbackLabel}
            >
                {symbol}
            </span>
        </div>
    )
}

export default function GuessCard({ guessResult, guessNumber }: GuessCardProps) {
    const t = useTranslations('game-board')
    const [expanded, setExpanded] = useState(false)
    const { element, matches } = guessResult

    return (
        <article className="overflow-hidden rounded-2xl border border-white/15 bg-[#111820]/85 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9CCAD3]/70">
                        {t('guess-number', { number: guessNumber })}
                    </p>
                    <a
                        href={element.wiki}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex min-w-0 items-baseline gap-2 rounded text-white hover:text-[#9CCAD3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF]"
                    >
                        <span className="truncate text-lg font-bold">{element.name}</span>
                        <span className="text-sm text-slate-400">{element.symbol}</span>
                    </a>
                </div>
                <span className="rounded-lg border border-[#9CCAD3]/30 bg-[#73B9FF]/10 px-3 py-2 font-mono text-lg font-bold text-[#C8E6EC]">
                    {element.classic.atomic_number}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-2 p-3 min-[360px]:grid-cols-2">
                <PropertyRow
                    label={t('grid.headers.period.label')}
                    value={element.classic.period}
                    feedback={getNumericFeedback(matches.period)}
                />
                <PropertyRow
                    label={t('grid.headers.group.label')}
                    value={element.classic.group}
                    feedback={getNumericFeedback(matches.group)}
                />
                <PropertyRow
                    label={t('grid.headers.atomic.label')}
                    value={element.classic.atomic_number}
                    feedback={getNumericFeedback(matches.atomicNumber)}
                />
                <PropertyRow
                    label={t('grid.headers.mass.label')}
                    value={element.classic.atomic_mass}
                    feedback={getNumericFeedback(matches.atomicMass)}
                />
            </div>

            {expanded && (
                <div id={`guess-${guessNumber}-details`} className="grid grid-cols-1 gap-2 px-3 pb-3 min-[360px]:grid-cols-2">
                    <PropertyRow
                        label={t('grid.headers.block.label')}
                        value={element.classic.block}
                        feedback={matches.block ? 'exact' : 'mismatch'}
                    />
                    <PropertyRow
                        label={t('grid.headers.type.label')}
                        value={element.classic.element_type}
                        feedback={matches.elementType ? 'exact' : 'mismatch'}
                    />
                    <PropertyRow
                        label={t('grid.headers.phase.label')}
                        value={element.classic['phase-at-stp']}
                        feedback={matches.phase ? 'exact' : 'mismatch'}
                    />
                </div>
            )}

            <button
                type="button"
                onClick={() => setExpanded(value => !value)}
                aria-expanded={expanded}
                aria-controls={`guess-${guessNumber}-details`}
                className="flex w-full items-center justify-center gap-2 border-t border-white/10 px-4 py-3 text-sm font-medium text-[#B9DCE3] transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#73B9FF]"
            >
                {expanded ? t('hide-details') : t('show-details')}
                <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
            </button>
        </article>
    )
}
