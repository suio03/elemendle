"use client"

import { Gauge, Lightbulb } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { PracticeDifficulty } from '@/types/practice'

interface PracticeDifficultyPickerProps {
    value: PracticeDifficulty
    onChange: (difficulty: PracticeDifficulty) => void
    compact?: boolean
}

export default function PracticeDifficultyPicker({
    value,
    onChange,
    compact = false
}: PracticeDifficultyPickerProps) {
    const t = useTranslations('practice')
    const options: Array<{
        value: PracticeDifficulty
        icon: typeof Gauge
        title: string
        description: string
    }> = [
        {
            value: 'easy',
            icon: Lightbulb,
            title: t('difficulty.easy.title'),
            description: t('difficulty.easy.description')
        },
        {
            value: 'standard',
            icon: Gauge,
            title: t('difficulty.standard.title'),
            description: t('difficulty.standard.description')
        }
    ]

    return (
        <div
            role="radiogroup"
            aria-label={t('difficulty.label')}
            className={cn('grid gap-3 sm:grid-cols-2', compact && 'gap-2')}
        >
            {options.map(option => {
                const selected = value === option.value
                const Icon = option.icon

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'group flex min-w-0 items-start gap-3 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D151C]',
                            selected
                                ? 'border-[#73B9FF] bg-[#73B9FF]/15 shadow-[0_0_24px_rgba(115,185,255,0.12)]'
                                : 'border-white/10 bg-white/[0.03] hover:border-[#9CCAD3]/40 hover:bg-white/[0.06]',
                            compact && 'rounded-xl p-3'
                        )}
                    >
                        <span className={cn(
                            'rounded-xl p-2',
                            selected ? 'bg-[#73B9FF]/20 text-[#C8E6EC]' : 'bg-white/5 text-slate-400'
                        )}>
                            <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                            <span className="block font-bold text-white">{option.title}</span>
                            <span className="mt-1 block text-xs leading-relaxed text-slate-400">{option.description}</span>
                        </span>
                    </button>
                )
            })}
        </div>
    )
}
