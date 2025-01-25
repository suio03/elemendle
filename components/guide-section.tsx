'use client'
import { useGameGuide } from '@/contexts/game-guide-context'
import HowToPlay from './how-to-play'
import Features from './features'
import Tips from './tips'
import Faq from './faq'
import { motion, AnimatePresence } from 'framer-motion'

export function GuideSection() {
    const { isGuideVisible } = useGameGuide()

    return (
        <AnimatePresence>
            {isGuideVisible && (
                <motion.div
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