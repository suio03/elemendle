'use client'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import Logo from "@/public/images/logo.svg"
import Streak from "@/public/images/streak.gif"
import Classic from "@/public/images/classic.png"
import Ability from "@/public/images/ability.png"
import StatsModal from "@/components/stats-modal"
import Language from "@/public/images/language.svg"
import Help from "@/public/images/help.svg"
import { getStoredStatistics } from "@/lib/storage"
import { useState, useEffect } from "react"
import { DataTransferUI } from "./data-transfer-ui"
import Data from "@/public/images/data.svg"
import { useTranslations } from "next-intl"
import LanSwitcher from '@/components/lan-switcher'

export default function GameHeader() {
    const t = useTranslations('header')
    const [stats, setStats] = useState(() => ({
        currentStreak: 0,
    }))
    const [isDataModalOpen, setIsDataModalOpen] = useState(false)

    useEffect(() => {
        setStats(getStoredStatistics())
    }, [])

    return (
        <div className="mb-8 text-center max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
                <img src={Logo.src} alt="Logo" className="w-72" />
            </div>
            {/* <div className="flex justify-center gap-4 mb-6 -mt-12">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <div className="rounded-full p-0 w-16 h-16 bg-white/50 transition-transform hover:scale-110 cursor-pointer hover:bg-white/60">
                                <img src={Classic.src} alt="Classic" className="w-16 h-16" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-950 text-white border-red-800">
                            <p>Classic Mode</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <div className="rounded-full p-0 w-16 h-16 bg-white/50 transition-transform hover:scale-110 cursor-pointer hover:bg-white/60">
                                <img src={Ability.src} alt="Ability" className="w-16 h-16 p-2" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-950 text-white border-red-800">
                            <p>Ability Mode</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div> */}
            <DataTransferUI open={isDataModalOpen} onOpenChange={setIsDataModalOpen} />
            <div className="flex justify-center gap-x-6 mb-4 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-xl p-2 max-w-xs mx-auto border-[#9CCAD3] border">
                <StatsModal />
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 pb-2 cursor-pointer">
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
                        <TooltipTrigger>
                            <img
                                src={Data.src}
                                alt="Data Transfer"
                                onClick={() => setIsDataModalOpen(true)}
                                className="w-8 transition-transform hover:scale-110 cursor-pointer"
                            />
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1a1a1a] text-[#9CCAD3] border-[#73B9FF]/30">
                            <p>{t('data-control.tooltip')}</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <img
                                src={Help.src}
                                alt="Help"
                                onClick={() => {
                                    const howToPlay = document.getElementById('how-to-play')
                                    howToPlay?.scrollIntoView({ behavior: 'smooth' })
                                }}
                                className="w-8 transition-transform hover:scale-110 cursor-pointer"
                            />
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1a1a1a] text-[#9CCAD3] border-[#73B9FF]/30">
                            <p>{t('how-to')}</p>
                        </TooltipContent>
                    </Tooltip>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <LanSwitcher
                                    trigger={
                                        <img
                                            src={Language.src}
                                            alt="Language"
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