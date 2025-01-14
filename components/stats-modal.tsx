"use client"

import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { UserStatistics } from "@/types/game"
import { getStoredStatistics } from "@/lib/storage"
import Stats from '@/public/images/stats.svg'
import { useTranslations } from "next-intl"

export default function StatsModal() {
    const t = useTranslations('header')
    const [statistics, setStatistics] = useState<UserStatistics | null>(null)

    useEffect(() => {
        setStatistics(getStoredStatistics())
    }, [])

    if (!statistics) return null

    const formatTime = (seconds: number | null): string => {
        if (!seconds) return "--"
        if (seconds < 60) return `${seconds.toFixed(2)}s`
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = (seconds % 60).toFixed(2)
        if (minutes < 60) return `${minutes}m ${remainingSeconds}s`
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60
        return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="inline-block">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-8 transition-transform hover:scale-110 cursor-pointer -mr-3">
                                    <img src={Stats.src} alt="Stats" className="w-8 mt-2" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="text-[#9CCAD3] bg-black border-0">
                                <p>{t('stats.tooltip')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white border-[#73B9FF]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Statistics</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatBox
                            label={t('stats.play')}
                            value={statistics.gamesPlayed.toString()}
                        />
                        <StatBox
                            label={t('stats.win-rate')}
                            value={`${Math.round(statistics.winRate * 100)}%`}
                        />
                        <StatBox
                            label={t('stats.current-streak')}
                            value={statistics.currentStreak.toString()}
                        />
                        <StatBox
                            label={t('stats.max-streak')}
                            value={statistics.maxStreak.toString()}
                        />
                    </div>

                    {/* Time Stats */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">{t('stats.time-stats')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <StatBox
                                label={t('stats.best-time')}
                                value={formatTime(statistics.bestTime)}
                            />
                            <StatBox
                                label={t('stats.average-time')}
                                value={formatTime(statistics.averageTime)}
                            />
                        </div>
                    </div>

                    {/* Guess Distribution */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">{t('stats.game-distribution')}</h3>
                        <div className="space-y-2">
                            {Object.entries(statistics.guessDistribution).map(([guess, count]) => (
                                <div key={guess} className="flex items-center gap-2">
                                    <span className="w-8 text-right">{guess}</span>
                                    <div className="flex-1 bg-[#73B9FF]/20 rounded-full h-6 overflow-hidden">
                                        <div
                                            className="bg-[#73B9FF] h-full transition-all duration-500"
                                            style={{
                                                width: `${count > 0 ? (count / Math.max(...Object.values(statistics.guessDistribution)) * 100) : 0}%`
                                            }}
                                        >
                                            <span className="px-2 font-medium">{count}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

interface StatBoxProps {
    label: string
    value: string
}

function StatBox({ label, value }: StatBoxProps) {
    return (
        <div className="bg-[#CCCCCC]/20 rounded-xl py-2 text-center">
            <div className="text-sm text-gray-300">{label}</div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    )
}