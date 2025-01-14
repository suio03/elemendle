import React from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from './ui/card'
import { useTranslations } from 'next-intl'

interface GameTip {
    title: string
    description: string
}

const GameInfoSections = () => {
    const t = useTranslations('game-tips')
    const tips: GameTip[] = Array.from({ length: 5 }, (_, index) => ({
        title: t(`content.${index}.title`),
        description: t(`content.${index}.description`)
    }))
    return (
        <div className="w-full max-w-lg mx-auto space-y-8 mt-4">
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] border-[#9CCAD3] border rounded-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-[#9CCAD3]">{t('title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tips.map((tip, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-lg bg-[#CCCCCC]/10 border border-[#73B9FF]/30"
                            >
                                <h3 className="font-semibold text-lg mb-2 text-red-300">{tip.title}</h3>
                                <p className="text-[#CCCCCC]">{tip.description}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default GameInfoSections