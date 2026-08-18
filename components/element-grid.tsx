"use client"

import { useTranslations } from 'next-intl'
import ElementBox from '@/components/element-box'
import { getNumericFeedback } from '@/lib/game-rules'
import { cn } from '@/lib/utils'
import type { ElementCategory, ElementGuessResult } from '@/types/element'

interface ElementGridProps {
    guessResult: ElementGuessResult
}

interface FeedbackCellProps {
    value: string
    feedback: 'exact' | 'higher' | 'lower' | 'mismatch'
}

function FeedbackCell({ value, feedback }: FeedbackCellProps) {
    const t = useTranslations('game-board.feedback')
    const exact = feedback === 'exact'
    const symbol = exact ? '✓' : feedback === 'higher' ? '↑' : feedback === 'lower' ? '↓' : '≠'
    const label = exact
        ? t('exact')
        : feedback === 'higher'
            ? t('target-higher')
            : feedback === 'lower'
                ? t('target-lower')
                : t('not-match')

    return (
        <div className={cn(
            'flex min-h-20 min-w-0 flex-col items-center justify-center rounded-xl border p-2 text-center',
            exact
                ? 'border-emerald-400/40 bg-emerald-600/80'
                : 'border-rose-300/35 bg-rose-700/80'
        )}>
            <span className="max-w-full whitespace-normal break-words text-xs font-semibold text-white">{value}</span>
            <span className="mt-1 text-lg font-bold text-white" aria-label={label} title={label}>{symbol}</span>
        </div>
    )
}

export default function ElementGrid({ guessResult }: ElementGridProps) {
    const { element, matches } = guessResult

    return (
        <div className="grid grid-cols-8 gap-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
            <a
                href={element.wiki}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF]"
            >
                <ElementBox
                    number={element.classic.atomic_number}
                    symbol={element.symbol}
                    name={element.name}
                    category={element.classic.element_type as ElementCategory}
                />
            </a>
            <FeedbackCell value={element.classic.period} feedback={getNumericFeedback(matches.period)} />
            <FeedbackCell value={element.classic.group} feedback={getNumericFeedback(matches.group)} />
            <FeedbackCell value={element.classic.block} feedback={matches.block ? 'exact' : 'mismatch'} />
            <FeedbackCell value={element.classic.element_type} feedback={matches.elementType ? 'exact' : 'mismatch'} />
            <FeedbackCell value={element.classic['phase-at-stp']} feedback={matches.phase ? 'exact' : 'mismatch'} />
            <FeedbackCell value={element.classic.atomic_number} feedback={getNumericFeedback(matches.atomicNumber)} />
            <FeedbackCell value={element.classic.atomic_mass} feedback={getNumericFeedback(matches.atomicMass)} />
        </div>
    )
}
