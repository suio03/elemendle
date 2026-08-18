"use client"

import { useEffect, useState } from 'react'
import { BookOpen, Check, Clock3, Flame, Gauge, LibraryBig, Lightbulb, RotateCcw, Share2, Sparkles, Trophy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'react-hot-toast'
import ElementBox from '@/components/element-box'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import PracticeDifficultyPicker from '@/components/practice-difficulty-picker'
import { getShareGrid } from '@/lib/game-rules'
import { trackEvent } from '@/lib/analytics'
import type { Element, ElementCategory, ElementGuessResult, GameMode } from '@/types/element'
import type { PracticeDifficulty } from '@/types/practice'
import type { DiscoveryOutcome } from '@/types/progression'

interface GameResultProps {
    mode: GameMode
    result: 'won' | 'lost'
    attempts: number
    timeTaken: number
    assistUsed: boolean
    element: Element
    guesses: ElementGuessResult[]
    gameNumber?: number
    streak?: number
    difficulty?: PracticeDifficulty
    nextDifficulty?: PracticeDifficulty
    onDifficultyChange?: (difficulty: PracticeDifficulty) => void
    onPlayAgain?: () => void
    discovery?: DiscoveryOutcome | null
}

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m ${remainingSeconds}s`
}

function getTimeUntilNextGame(): string {
    const now = new Date()
    const next = new Date(now)
    next.setUTCHours(24, 0, 0, 0)
    const seconds = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000))
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return [hours, minutes, seconds % 60].map(value => String(value).padStart(2, '0')).join(':')
}

export default function GameResult({
    mode,
    result,
    attempts,
    timeTaken,
    assistUsed,
    element,
    guesses,
    gameNumber,
    streak = 0,
    difficulty = 'standard',
    nextDifficulty = difficulty,
    onDifficultyChange,
    onPlayAgain,
    discovery
}: GameResultProps) {
    const t = useTranslations('result')
    const [countdown, setCountdown] = useState(getTimeUntilNextGame)
    const won = result === 'won'
    const isPractice = mode === 'practice'

    useEffect(() => {
        if (isPractice) return
        const timer = window.setInterval(() => setCountdown(getTimeUntilNextGame()), 1000)
        return () => window.clearInterval(timer)
    }, [isPractice])

    const shareText = [
        t(isPractice
            ? won ? 'practice-share-win' : 'practice-share-loss'
            : won ? 'share-win' : 'share-loss', {
            gameNumber: gameNumber || 0,
            attempts
        }),
        getShareGrid(guesses),
        'https://elemendle.com'
    ].join('\n\n')

    const handleShare = async () => {
        trackEvent('share_clicked', { mode, result })

        try {
            if (navigator.share) {
                await navigator.share({ title: 'Elemendle', text: shareText })
            } else {
                await navigator.clipboard.writeText(shareText)
                toast.success(t('copied'))
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return
            toast.error(t('share-error'))
        }
    }

    const metrics = isPractice
        ? [
            { icon: Trophy, label: t('attempts'), value: `${attempts} / 9` },
            { icon: Clock3, label: t('time'), value: formatDuration(timeTaken) },
            { icon: Gauge, label: t('difficulty'), value: t(`difficulty-${difficulty}`) },
            { icon: Lightbulb, label: t('assist'), value: assistUsed ? t('assisted') : t('no-hints') }
        ]
        : [
            { icon: Trophy, label: t('attempts'), value: `${attempts} / 9` },
            { icon: Clock3, label: t('time'), value: formatDuration(timeTaken) },
            { icon: Flame, label: t('streak'), value: String(streak) },
            { icon: Lightbulb, label: t('assist'), value: assistUsed ? t('assisted') : t('no-hints') }
        ]

    return (
        <section className="mx-auto mt-6 w-full max-w-3xl overflow-hidden rounded-3xl border border-[#9CCAD3]/40 bg-[#0D151C]/95 text-white shadow-2xl backdrop-blur-xl">
            <div className="border-b border-white/10 bg-gradient-to-br from-[#73B9FF]/20 via-transparent to-emerald-400/10 px-5 py-7 text-center sm:px-8">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#73B9FF]/15 text-[#BFE7EF]">
                    {won ? <Check className="h-7 w-7" aria-hidden="true" /> : <BookOpen className="h-6 w-6" aria-hidden="true" />}
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9CCAD3]/75">
                    {isPractice
                        ? t('practice-label', { difficulty: t(`difficulty-${difficulty}`) })
                        : t('game-number', { number: gameNumber || 0 })}
                </p>
                <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                    {t(isPractice
                        ? won ? 'practice-won-title' : 'practice-lost-title'
                        : won ? 'won-title' : 'lost-title')}
                </h2>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-300">
                    {t(isPractice
                        ? won ? 'practice-won-summary' : 'practice-lost-summary'
                        : won ? 'won-summary' : 'lost-summary')}
                </p>
            </div>

            <div className="space-y-7 p-5 sm:p-8">
                <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#9CCAD3]">{t('performance')}</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {metrics.map(({ icon: Icon, label, value }) => (
                            <div key={label} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                                <Icon className="mb-2 h-4 w-4 text-[#9CCAD3]" aria-hidden="true" />
                                <p className="text-xs text-slate-400">{label}</p>
                                <p className="mt-1 break-words text-base font-bold text-white">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {discovery ? (
                    <div className="rounded-2xl border border-emerald-200/25 bg-emerald-200/[0.07] p-4">
                        <div className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-200/10 text-emerald-100"><LibraryBig className="h-5 w-5" aria-hidden="true" /></span>
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">{t(discovery.isNew ? 'new-discovery' : 'collection-updated')}</p>
                                <p className="mt-1 text-lg font-black">{t('collection-count', { count: discovery.discoveredCount, total: 118 })}</p>
                                <p className="mt-1 text-xs leading-relaxed text-slate-400">{t(discovery.isNew ? 'new-discovery-description' : 'collection-updated-description', { element: element.name })}</p>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#9CCAD3]">{t('learn')}</h3>
                    <div className="flex flex-col gap-4 rounded-2xl border border-[#9CCAD3]/20 bg-[#73B9FF]/[0.07] p-4 sm:flex-row sm:items-center">
                        <a
                            href={element.wiki}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="self-start rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF] sm:self-auto"
                        >
                            <ElementBox
                                number={element.classic.atomic_number}
                                symbol={element.symbol}
                                name={element.name}
                                category={element.classic.element_type as ElementCategory}
                                className="h-20 w-20 shrink-0"
                            />
                        </a>
                        <div className="min-w-0">
                            <p className="text-lg font-bold text-white">{element.name} · {element.symbol}</p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#9CCAD3]">{t('did-you-know')}</p>
                            <p className="mt-1 break-words text-sm leading-relaxed text-slate-300">
                                {element.hints.properties[0] || t('fact-fallback')}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#9CCAD3]">{t('next')}</h3>
                    {isPractice && onDifficultyChange ? (
                        <div className="mb-3">
                            <p className="mb-2 text-xs font-medium text-slate-400">{t('choose-next-difficulty')}</p>
                            <PracticeDifficultyPicker
                                value={nextDifficulty}
                                onChange={onDifficultyChange}
                                compact
                            />
                        </div>
                    ) : null}
                    <div className="grid gap-3 sm:grid-cols-2">
                        {isPractice ? (
                            <Button
                                type="button"
                                onClick={onPlayAgain}
                                className="min-h-14 rounded-xl bg-[#73B9FF] text-[#071319] hover:bg-[#8BC8E4]"
                            >
                                <RotateCcw className="mr-2 h-5 w-5" aria-hidden="true" />
                                {t('play-again')}
                            </Button>
                        ) : (
                            <Button asChild className="h-auto min-h-14 justify-start rounded-xl bg-[#73B9FF] px-4 py-3 text-left text-[#071319] hover:bg-[#8BC8E4]">
                                <Link href="/practice">
                                    <Sparkles className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />
                                    <span><span className="block font-bold">{t('practice-next')}</span><span className="block text-xs font-normal opacity-75">{t('practice-next-description')}</span></span>
                                </Link>
                            </Button>
                        )}
                        <Button asChild variant="outline" className="min-h-14 rounded-xl border-emerald-200/25 bg-emerald-200/[0.05] text-emerald-100 hover:bg-emerald-200/10 hover:text-white">
                            <Link href="/collection"><LibraryBig className="mr-2 h-5 w-5" aria-hidden="true" />{t('view-collection')}</Link>
                        </Button>
                    </div>
                    <Button type="button" variant="ghost" onClick={handleShare} className="mt-3 w-full text-slate-400 hover:bg-white/5 hover:text-white">
                        <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />{t('share')}
                    </Button>
                    {!isPractice ? (
                        <p className="mt-4 text-center text-xs text-slate-500">
                            {t('next-element', { countdown })}
                        </p>
                    ) : null}
                </div>
            </div>
        </section>
    )
}
