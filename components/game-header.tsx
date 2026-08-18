'use client'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import Logo from "@/public/images/logo.svg"
import Streak from "@/public/images/streak.gif"
import StatsModal from "@/components/stats-modal"
import Language from "@/public/images/language.svg"
import Help from "@/public/images/help.svg"
import { getStoredStatistics, STATISTICS_UPDATED_EVENT } from "@/lib/storage"
import type { ElementStatistics } from '@/types/element'
import { useState, useEffect } from "react"
import { DataTransferUI } from "./data-transfer-ui"
import Data from "@/public/images/data.svg"
import { useTranslations } from "next-intl"
import LanSwitcher from '@/components/lan-switcher'
import { useGameGuide } from '@/contexts/game-guide-context'
import { Link, usePathname } from '@/i18n/routing'
import { CalendarDays, Dices, LibraryBig } from 'lucide-react'

export default function GameHeader() {
    const t = useTranslations('header')
    const practiceT = useTranslations('practice')
    const [stats, setStats] = useState<Pick<ElementStatistics, 'currentStreak'>>({
        currentStreak: 0
    })
    const [isDataModalOpen, setIsDataModalOpen] = useState(false)
    const { toggleGuide } = useGameGuide()
    const pathname = usePathname()
    const isPractice = pathname.startsWith('/practice')
    const isDaily = pathname === '/'

    useEffect(() => {
        setStats(getStoredStatistics())

        const handleStatisticsUpdate = (event: Event) => {
            setStats((event as CustomEvent<ElementStatistics>).detail)
        }
        window.addEventListener(STATISTICS_UPDATED_EVENT, handleStatisticsUpdate)
        return () => window.removeEventListener(STATISTICS_UPDATED_EVENT, handleStatisticsUpdate)
    }, [])

    return (
        <div className="mb-8 text-center max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
                <img src={Logo.src} alt="Logo" className="w-72" />
            </div>
            <nav
                aria-label={practiceT('mode-label')}
                className="mx-auto mb-3 flex w-fit rounded-xl border border-[#9CCAD3]/40 bg-[#10171D]/90 p-1 shadow-lg backdrop-blur-md"
            >
                <Link
                    href="/"
                    aria-current={isDaily ? 'page' : undefined}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF] ${isDaily ? 'bg-[#73B9FF] text-[#071319]' : 'text-[#B9DCE3] hover:bg-white/5'}`}
                >
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    {practiceT('daily')}
                </Link>
                <Link
                    href="/practice"
                    aria-current={isPractice ? 'page' : undefined}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF] ${isPractice ? 'bg-[#73B9FF] text-[#071319]' : 'text-[#B9DCE3] hover:bg-white/5'}`}
                >
                    <Dices className="h-4 w-4" aria-hidden="true" />
                    {practiceT('practice')}
                </Link>
            </nav>
            <DataTransferUI open={isDataModalOpen} onOpenChange={setIsDataModalOpen} />
            <div className="mx-auto mb-4 flex max-w-sm justify-center gap-x-4 rounded-xl border border-[#9CCAD3] bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-2">
                <StatsModal />
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                role="status"
                                aria-label={`${t('streak')}: ${stats.currentStreak}`}
                                className="flex items-center gap-2 pb-2"
                            >
                                <div className="relative transition-transform hover:scale-110">
                                    <img src={Streak.src} alt="Streak" className="w-10" />
                                    <span className="absolute inset-0 left-1/4 font-bold top-1/2 flex items-center justify-center text-black">
                                        {stats.currentStreak}
                                    </span>
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1a1a1a] text-[#9CCAD3] border-[#73B9FF]/30">
                            <p>{t('streak')}</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link href="/collection" aria-label={t('collection')} className="flex h-9 w-9 items-center justify-center rounded-md text-[#E5E5E5] transition hover:scale-110 hover:text-[#9CCAD3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CCAD3]">
                                <LibraryBig className="h-7 w-7" aria-hidden="true" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent className="border-[#73B9FF]/30 bg-[#1a1a1a] text-[#9CCAD3]"><p>{t('collection')}</p></TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                aria-label={t('data-control.tooltip')}
                                onClick={() => setIsDataModalOpen(true)}
                                className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CCAD3]"
                            >
                                <img src={Data.src} alt="" className="w-8 transition-transform hover:scale-110" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1a1a1a] text-[#9CCAD3] border-[#73B9FF]/30">
                            <p>{t('data-control.tooltip')}</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                aria-label={t('how-to')}
                                onClick={toggleGuide}
                                className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CCAD3]"
                            >
                                <img src={Help.src} alt="" className="w-8 transition-transform hover:scale-110" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1a1a1a] text-[#9CCAD3] border-[#73B9FF]/30">
                            <p>{t('how-to')}</p>
                        </TooltipContent>
                    </Tooltip>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <LanSwitcher
                                    label={t('language')}
                                    trigger={
                                        <img
                                            src={Language.src}
                                            alt=""
                                            className="w-8 transition-transform hover:scale-110 cursor-pointer"
                                        />
                                    }
                                />
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1a1a1a] text-[#9CCAD3] border-[#73B9FF]/30">
                                <p>{t('language')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </TooltipProvider>
            </div>
        </div>
    )
}
