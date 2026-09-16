import React from 'react'
import { Github } from 'lucide-react'
import Link from 'next/link'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <div className="w-full flex flex-col items-center gap-4 py-8">
            <Link href="/learn/periodic-table-riddles" hrefLang="en" lang="en" className="inline-flex min-h-11 items-center rounded px-2 text-sm text-[#B9DCE3] underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#73B9FF]">
                Periodic Table Riddles &amp; Answers (English)
            </Link>
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
