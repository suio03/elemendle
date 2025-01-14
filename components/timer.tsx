import React, { useEffect, useState } from 'react'

interface AnimatedDigitProps {
    value: string
    isLast?: boolean
}

const AnimatedDigit: React.FC<AnimatedDigitProps> = ({ value, isLast }) => {
    return (
        <div className={`relative w-16 h-20 flex items-center justify-center
      ${isLast ? 'animate-pulse' : ''}`}
        >
            <span className={`text-6xl font-medium text-white
        ${isLast ? 'opacity-60' : ''}
        transition-all duration-300
        drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`}
            >
                {value}
            </span>
        </div>
    )
}

interface CountdownTimerProps {
    endTime?: Date
    onComplete?: () => void
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
    endTime = new Date(new Date().setHours(24, 0, 0, 0)),
    onComplete
}) => {
    const [timeLeft, setTimeLeft] = useState({
        hours: '00',
        minutes: '00',
        seconds: '00'
    })

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date()
            const difference = endTime.getTime() - now.getTime()

            if (difference <= 0) {
                setTimeLeft({ hours: '00', minutes: '00', seconds: '00' })
                onComplete?.()
                return
            }

            const hours = Math.floor(difference / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)

            setTimeLeft({
                hours: String(hours).padStart(2, '0'),
                minutes: String(minutes).padStart(2, '0'),
                seconds: String(seconds).padStart(2, '0')
            })
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)

        return () => clearInterval(timer)
    }, [endTime, onComplete])

    return (
        <div className="flex flex-col items-center space-y-4">
            <h2 className="text-2xl text-white mb-4">Next champion in</h2>

            <div className="flex items-center space-x-2">
                {/* Hours */}
                <AnimatedDigit value={timeLeft.hours[0]} />
                <AnimatedDigit value={timeLeft.hours[1]} />

                <span className="text-6xl text-white">:</span>

                {/* Minutes */}
                <AnimatedDigit value={timeLeft.minutes[0]} />
                <AnimatedDigit value={timeLeft.minutes[1]} />

                <span className="text-6xl text-white">:</span>

                {/* Seconds */}
                <AnimatedDigit value={timeLeft.seconds[0]} />
                <AnimatedDigit value={timeLeft.seconds[1]} isLast={true} />
            </div>

            <p className="text-gray-400 text-sm italic mt-4">
                Time zone: Europe (Midnight at UTC+2)
            </p>
        </div>
    )
}

// Add the required keyframes animation
const styles = `
  @keyframes slideIn {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .slide-in {
    animation: slideIn 0.3s ease-out;
  }
`

// Add styles to document head
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
}

export default CountdownTimer