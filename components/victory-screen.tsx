import React, { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Timer } from 'lucide-react'
import type { Element, ElementCategory } from '@/types/element'
import { useTranslations } from 'next-intl'
import ElementBox from './element-box'
interface DigitProps {
    value: string
    isLast?: boolean
}

const Digit: React.FC<DigitProps> = ({ value }) => {
    const [prevValue, setPrevValue] = useState(value)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        if (value !== prevValue) {
            setIsAnimating(true)
            const timer = setTimeout(() => {
                setIsAnimating(false)
                setPrevValue(value)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [value, prevValue])

    return (
        <div className="relative inline-block w-5 h-16  rounded-md overflow-hidden">
            <div
                className={`absolute w-full h-full flex items-center justify-center  animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,theme(colors.gray.200),theme(colors.indigo.200),theme(colors.gray.50),theme(colors.indigo.300),theme(colors.gray.200))] bg-[length:200%_auto] bg-clip-text pb-8 font-nacelle text-transparent text-4xl font-bold
                    ${isAnimating ? 'animate-slide-up-out' : ''}`}
            >
                {prevValue}
            </div>
            {isAnimating && (
                <div
                    className="absolute w-full h-full flex items-center justify-center text-4xl font-mono animate-slide-up-in"
                >
                    {value}
                </div>
            )}
        </div>
    )
}

interface VictoryScreenProps {
    attempts: number
    timeTaken: number
    streak: number
    isOneShot: boolean
    element: Element
}

function formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`
}

const VictoryScreen = ({
    attempts = 1,
    timeTaken = 0,
    streak = 1,
    isOneShot = true,
    element
}: VictoryScreenProps) => {
    const t = useTranslations('victory')
    const [timeDigits, setTimeDigits] = useState({
        hours: ['0', '0'],
        minutes: ['0', '0'],
        seconds: ['0', '0']
    })

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date()
            const midnight = new Date()
            midnight.setUTCHours(24, 0, 0, 0)
            const diff = Math.max(0, midnight.getTime() - now.getTime())

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            setTimeDigits({
                hours: String(hours).padStart(2, '0').split(''),
                minutes: String(minutes).padStart(2, '0').split(''),
                seconds: String(seconds).padStart(2, '0').split('')
            })
        }

        calculateTimeRemaining()
        const timer = setInterval(calculateTimeRemaining, 1000)
        return () => clearInterval(timer)
    }, [])


    return (
        <Card className="w-full max-w-lg mx-auto bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white border-[#9CCAD3] border">
            <CardContent className="my-6">
                {/* Victory Title */}
                <div className="text-center">
                    <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,theme(colors.gray.200),theme(colors.indigo.200),theme(colors.gray.50),theme(colors.indigo.300),theme(colors.gray.200))] bg-[length:200%_auto] bg-clip-text pb-8 font-nacelle text-transparent text-5xl font-bold mb-8">{t('title')}</h2>
                </div>

                {/* Character Result */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-4 pb-8">
                        <a href={element.wiki} target="_blank" rel="noopener noreferrer">
                            <ElementBox
                                number={element.classic.atomic_number}
                                symbol={element.symbol}
                                name={element.name}
                                category={element.classic.element_type as ElementCategory}
                                className="w-16 h-16 shrink-0"
                            />
                        </a>
                        {/* <h3 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,theme(colors.gray.200),theme(colors.indigo.200),theme(colors.gray.50),theme(colors.indigo.300),theme(colors.gray.200))] bg-[length:200%_auto] bg-clip-text font-nacelle text-transparent text-4xl font-bold">{element.name}</h3> */}
                    </div>
                </div>

                {/* Time and Attempts Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2">
                            <Timer className="w-5 h-5 text-blue-600/40" />
                            <p className="text-lg">{t('time-taken')}:</p>
                        </div>
                        <p className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,theme(colors.gray.200),theme(colors.indigo.200),theme(colors.gray.50),theme(colors.indigo.300),theme(colors.gray.200))] bg-[length:200%_auto] bg-clip-text pb-8 font-nacelle text-transparent text-2xl font-bold">{formatTime(timeTaken)}</p>
                    </div>
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2">
                            <Trophy className="w-5 h-5 text-blue-600/40" />
                            <p className="text-lg">{t('attempts')}:</p>
                        </div>
                        <p className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,theme(colors.gray.200),theme(colors.indigo.200),theme(colors.gray.50),theme(colors.indigo.300),theme(colors.gray.200))] bg-[length:200%_auto] bg-clip-text pb-8 font-nacelle text-transparent text-2xl font-bold">{attempts}</p>
                    </div>
                </div>
                <div className="my-4">
                    <p className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,theme(colors.gray.200),theme(colors.indigo.200),theme(colors.gray.50),theme(colors.indigo.300),theme(colors.gray.200))] bg-[length:200%_auto] bg-clip-text pb-8 font-nacelle text-transparent text-center text-2xl">{t('next-element')}</p>
                    <div className="flex justify-center items-center gap-1">
                        {timeDigits.hours.map((digit, i) => (
                            <React.Fragment key={`h${i}`}>
                                <Digit value={digit} />
                                {i === timeDigits.hours.length - 1 && (
                                    <span className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,theme(colors.gray.200),theme(colors.indigo.200),theme(colors.gray.50),theme(colors.indigo.300),theme(colors.gray.200))] bg-[length:200%_auto] bg-clip-text pb-8 font-nacelle text-transparent text-4xl font-bold mx-1">:</span>
                                )}
                            </React.Fragment>
                        ))}
                        {timeDigits.minutes.map((digit, i) => (
                            <React.Fragment key={`m${i}`}>
                                <Digit value={digit} />
                                {i === timeDigits.minutes.length - 1 && (
                                    <span className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,theme(colors.gray.200),theme(colors.indigo.200),theme(colors.gray.50),theme(colors.indigo.300),theme(colors.gray.200))] bg-[length:200%_auto] bg-clip-text pb-8 font-nacelle text-transparent text-4xl font-bold mx-1">:</span>
                                )}
                            </React.Fragment>
                        ))}
                        {timeDigits.seconds.map((digit, i) => (
                            <Digit key={`s${i}`} value={digit} />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default VictoryScreen