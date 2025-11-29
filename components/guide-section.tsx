'use client'
import { useEffect, useRef } from 'react'
import { useGameGuide } from '@/contexts/game-guide-context'
import HowToPlay from './how-to-play'
import Features from './features'
import Tips from './tips'
import Faq from './faq'
import { motion, AnimatePresence } from 'framer-motion'

export function GuideSection() {
    const { isGuideVisible } = useGameGuide()
    const guideRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!isGuideVisible || !guideRef.current) return

        const timeoutId = window.setTimeout(() => {
            guideRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
        }, 150)

        return () => window.clearTimeout(timeoutId)
    }, [isGuideVisible])

    return (
        <AnimatePresence>
            {isGuideVisible && (
                <motion.div
                    ref={guideRef}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                >
                    <HowToPlay />
                    <Features />
                    <Tips />
                    <Faq />
                </motion.div>
            )}
        </AnimatePresence>
    )
} 