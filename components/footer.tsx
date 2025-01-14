import React from 'react'
import { Github } from 'lucide-react'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <div className="w-full flex flex-col items-center gap-4 py-8">
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