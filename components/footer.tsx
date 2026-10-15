import React from 'react'
import { Github } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useLearningCopy } from '@/lib/learning-copy'

const Footer = () => {
    const t = useLearningCopy()
    const currentYear = new Date().getFullYear()

    return (
        <div className="w-full flex flex-col items-center gap-4 py-8">
            <Link href="/learn/periodic-table-riddles" className="inline-flex min-h-11 items-center rounded px-2 text-sm text-[#B9DCE3] underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#73B9FF]">
                {t('Periodic Table Riddles & Answers')}
            </Link>
            <Link href="/learn" className="inline-flex min-h-11 items-center rounded px-2 text-sm text-[#B9DCE3] underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#73B9FF]">
                {t('Learn the Periodic Table')}
            </Link>
            {/* Our other games */}
            <div className="flex flex-col items-center gap-1 text-center text-sm">
                <span className="font-semibold text-white">{t('More daily games')}</span>
                <a href="https://dailyredgame.app/" className="inline-flex min-h-11 items-center rounded px-2 text-[#B9DCE3] underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#73B9FF]">
                    Daily Red Pokémon Game
                </a>
                <span className="text-[#B9DCE3]">{t('Play today’s Pokémon battle vs RED')}</span>
            </div>
            {/* Social Icons Row */}
            <div className="flex items-center justify-center gap-4">
                <a href="https://github.com/suio03/elemendle" target="_blank" rel="noopener noreferrer">
                    <Github className="w-8 h-8 text-white" />
                </a>
            </div>
            {/* Copyright & Privacy */}
            <div className="flex flex-col items-center gap-2 text-sm text-white">
                <div>elemendle.com — {currentYear}</div>
            </div>
        </div>
    )
}

export default Footer
