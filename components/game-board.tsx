"use client"

import { useState, useEffect } from "react"
import { useWindowSize } from 'react-use'
import { Element, ElementGameState, ElementCategory } from "@/types/element"
import { getStoredGameState, storeGameState, validateAndUpdateGameState, updateStatistics, addToHistory, calculateTimeTaken } from "@/lib/storage"
import { compareElements, isWinningGuess, validateElementGuess } from "@/lib/element-game"
import ElementGrid from "@/components/element-grid"
import { toast } from "react-hot-toast"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import elementsData from "@/data/atom.json"
import { SendHorizonal } from "lucide-react"
import { Button } from "./ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import ColorIndicator from "./color-indicator"
import VictoryScreen from "./victory-screen"
import ReactConfetti from "react-confetti"
import ShareResult from "./share-result"
import { useGameAPI } from '@/app/hooks/useGameAPI'
import { useTranslations } from 'next-intl'
import ElementBox from "@/components/element-box"
const MAX_ATTEMPTS = 8

interface HeaderInfo {
    key: string
    label: string
    description: string
}

const HINTS_THRESHOLD = {
    FIRST: 5,  // Show first hint after 5 incorrect guesses
    SECOND: 7, // Show second hint after 7 incorrect guesses
    THIRD: 8   // Show third hint at last attempt
}

export default function GameBoard() {
    const t = useTranslations('game-board')

    const headerInfo: HeaderInfo[] = [
        {
            key: "element",
            label: t('grid.headers.element.label'),
            description: t('grid.headers.element.description')
        },
        {
            key: "period",
            label: t('grid.headers.period.label'),
            description: t('grid.headers.period.description')
        },
        {
            key: "group",
            label: t('grid.headers.group.label'),
            description: t('grid.headers.group.description')
        },
        {
            key: "block",
            label: t('grid.headers.block.label'),
            description: t('grid.headers.block.description')
        },
        {
            key: "element_type",
            label: t('grid.headers.type.label'),
            description: t('grid.headers.type.description')
        },
        {
            key: "phase",
            label: t('grid.headers.phase.label'),
            description: t('grid.headers.phase.description')
        },
        {
            key: "atomic_number",
            label: t('grid.headers.atomic.label'),
            description: t('grid.headers.atomic.description')
        },
        {
            key: "atomic_mass",
            label: t('grid.headers.mass.label'),
            description: t('grid.headers.mass.description')
        }
    ]
    const { dailyGame, isLoading, error, incrementCompletions } = useGameAPI()
    const [gameState, setGameState] = useState<ElementGameState>(() => getStoredGameState())
    const [input, setInput] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const { width, height } = useWindowSize()
    const [isConfettiActive, setIsConfettiActive] = useState(false)
    const [filteredElements, setFilteredElements] = useState<Element[]>([])
    const [currentHint, setCurrentHint] = useState<number | null>(null)

    const colorItems = [
        {
            color: "bg-green-600",
            label: t('color-indicators.correct.label'),
            tooltip: t('color-indicators.correct.description')
        },
        {
            color: "bg-red-600",
            label: t('color-indicators.incorrect.label'),
            tooltip: t('color-indicators.incorrect.description')
        },
        {
            color: "bg-red-600",
            label: t('color-indicators.higher.label'),
            tooltip: t('color-indicators.higher.description')
        },
        {
            color: "bg-red-600",
            label: t('color-indicators.lower.label'),
            tooltip: t('color-indicators.lower.description')
        }
    ]

    useEffect(() => {
        if (isLoading || !dailyGame) return

        const validatedState = validateAndUpdateGameState(
            gameState,
            dailyGame.game_number,
            dailyGame.element
        )

        setGameState(validatedState)
        storeGameState(validatedState)
        setIsClient(true)
    }, [isLoading, dailyGame])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-pulse text-muted-foreground">
                    Loading today&apos;s character...
                </div>
            </div>
        )
    }

    if (error || !dailyGame) {
        return (
            <div className="text-center text-destructive">
                Failed to load game. Please try again later.
            </div>
        )
    }

    if (!gameState) return null

    const handleInput = (value: string) => {
        setInput(value)
        if (!value.length) {
            setShowSuggestions(false)
            setFilteredElements([])
            return
        }

        const searchTerm = value.toLowerCase()
        const filtered = Object.values(elementsData)
            .filter(element => {
                const nameMatch = element.name.toLowerCase().includes(searchTerm)
                const symbolMatch = element.symbol.toLowerCase().includes(searchTerm)
                const notAlreadyGuessed = !gameState.guesses.some(g => g.element.name === element.name)
                return (nameMatch || symbolMatch) && notAlreadyGuessed
            })
            .slice(0, 5)

        setFilteredElements(filtered)
        setShowSuggestions(filtered.length > 0)

        // Handle first input for game start
        if (!gameState?.hasStarted && value.length === 1) {
            const newState = {
                ...gameState,
                hasStarted: true,
                startTime: Date.now()
            }
            setGameState(newState)
            storeGameState(newState)
        }
    }

    const handleElementSelect = (element: Element) => {
        setInput(element.name)
        setShowSuggestions(false)
        handleGuess(element)
    }

    const getCurrentHint = (guessCount: number) => {
        if (guessCount >= HINTS_THRESHOLD.THIRD) return 2  // Third hint (index 2)
        if (guessCount >= HINTS_THRESHOLD.SECOND) return 1 // Second hint (index 1)
        if (guessCount >= HINTS_THRESHOLD.FIRST) return 0  // First hint (index 0)
        return null
    }

    const handleGuess = async (selectedElement?: Element) => {
        if (!gameState.dailyElement || gameState.gameStatus !== "in-progress") return

        const validatedElement = selectedElement || validateElementGuess(input, elementsData)
        if (!validatedElement) {
            toast.error("Invalid guess")
            return
        }

        if (gameState.guesses.some(g => g.element.name === validatedElement.name)) {
            toast.error("Already guessed")
            return
        }

        try {
            const guessResult = compareElements(validatedElement, gameState.dailyElement)
            const newGuesses = [...gameState.guesses, guessResult]
            const isWon = isWinningGuess(guessResult)
            const isLost = newGuesses.length >= MAX_ATTEMPTS && !isWon

            const endTime = Date.now()
            const timeToSolve = calculateTimeTaken(gameState.startTime, endTime)

            const newState: ElementGameState = {
                ...gameState,
                guesses: newGuesses,
                gameStatus: isWon ? "won" : isLost ? "lost" : "in-progress",
                endTime: isWon || isLost ? endTime : undefined,
                timeTaken: isWon || isLost ? timeToSolve : undefined
            }

            setGameState(newState)
            storeGameState(newState)

            if (isWon) {
                setIsConfettiActive(true)
                setTimeout(() => setIsConfettiActive(false), 5000)
                await incrementCompletions()
                updateStatistics(newState, timeToSolve)
                addToHistory(newState, timeToSolve)
                toast.success("Congratulations!")
            } else if (isLost) {
                updateStatistics(newState, timeToSolve)
                toast.error("Game over")
            }

            setInput("")
            setShowSuggestions(false)

            const nextHint = getCurrentHint(newGuesses.length)
            if (nextHint !== currentHint) {
                setCurrentHint(nextHint)
                if (nextHint !== null) {
                    toast.success(`Hint: ${dailyGame.element.hints.properties[nextHint]}`, {
                        duration: 5000
                    })
                }
            }
        } catch (error) {
            console.error('Error in handleGuess:', error)
        }
    }
    return (
        <div className="w-full">
            <div className="p-6 rounded-xl shadow-xl max-w-lg mx-auto bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white border border-[#9CCAD3]">
                {gameState.guesses.length >= MAX_ATTEMPTS || gameState.gameStatus === "lost" ? (
                    <div className="text-center p-4 bg-red-950/50 rounded-xl mb-6">
                        <p className="text-red-200 mb-2">{t('game-over')}</p>
                        <p className="text-xl font-bold text-white">
                            {t('correct-answer')}: <span className="text-green-400">{gameState.dailyElement?.name}</span>
                        </p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-center mb-8 text-[#9CCAD3]">
                            {t('title')}
                        </h2>
                        {isConfettiActive && (
                            <ReactConfetti
                                width={width}
                                height={height}
                                recycle={false}
                                numberOfPieces={500}
                                gravity={0.3}
                            />
                        )}
                        {currentHint !== null && (
                            <div className="mb-4 p-3 bg-blue-950/30 rounded-lg">
                                <p className="text-blue-200 text-sm font-medium">
                                    Hint {currentHint + 1}: {dailyGame.element.hints.properties[currentHint]}
                                </p>
                            </div>
                        )}
                        {gameState.guesses.length < MAX_ATTEMPTS ? (
                            <div className="flex gap-2 mb-6">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => handleInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                                        placeholder={t('input-placeholder')}
                                        disabled={gameState.gameStatus !== "in-progress"}
                                        className="w-full h-14 bg-[#CCCCCC]/20 text-[#9CCAD3] placeholder:text-[#9CCAD3]/50 rounded-xl px-4 border-0 disabled:opacity-50"
                                    />
                                    {showSuggestions && input && filteredElements.length > 0 && (
                                        <div className="absolute w-full bg-[#2d2d2d] rounded-xl mt-1 z-50 shadow-lg border border-[#73B9FF]/30 p-2 space-y-2">
                                            {filteredElements.map((element) => (
                                                <button
                                                    key={element.name}
                                                    onClick={() => handleElementSelect(element)}
                                                    className="w-full flex items-center gap-3 p-2 hover:bg-slate-900/50 cursor-pointer rounded-xl"
                                                >
                                                    <ElementBox
                                                        number={element.classic.atomic_number}
                                                        symbol={element.symbol}
                                                        name={element.name}
                                                        category={element.classic.element_type as ElementCategory}
                                                        className="w-16 h-16 shrink-0"
                                                    />
                                                    <div className="flex flex-col items-start">
                                                        <span className="font-medium text-[#9CCAD3]">
                                                            {element.name} ({element.symbol})
                                                        </span>
                                                        <span className="text-sm text-[#9CCAD3]/70">
                                                            Group {element.classic.group} • Period {element.classic.period} • {element.classic["phase-at-stp"]}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="default"
                                    className="h-14 w-14 bg-[#73B9FF]/40 hover:bg-[#73B9FF]/60 text-white rounded-xl"
                                    onClick={() => handleGuess()}
                                >
                                    <SendHorizonal className="h-6 w-6" />
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center p-4 bg-red-950/50 rounded-xl mb-6">
                                <p className="text-red-200 mb-2">{t('game-over')}</p>
                                <p className="text-xl font-bold text-white">
                                    {t('correct-answer')}: <span className="text-[#9CCAD3]">{gameState.dailyElement?.name}</span>
                                </p>
                            </div>
                        )}

                        {/* <div className="text-center text-white/90 text-lg font-medium">
                            {isClient && gameState.gameStatus === "in-progress" && gameState.guesses.length < MAX_ATTEMPTS && (
                                <p className="text-red-300">
                                    {MAX_ATTEMPTS - gameState.guesses.length} {t('remaining-guesses')}
                                </p>
                            )}
                        </div> */}
                    </>
                )}
            </div>
            <p className="text-center text-white font-medium my-4">
                <span className="text-red-300">{dailyGame.solved_count}</span> {t('solved-count', { count: dailyGame.solved_count })}
            </p>
            {
                gameState.gameStatus === "in-progress" && (
                    <div className="relative w-full flex justify-center">
                        {gameState.guesses.length > 0 && (

                            <ScrollArea className="w-full max-w-[700px] whitespace-nowrap rounded-lg">
                                <div className="w-[700px]">
                                    <div className="p-4">
                                        <div className="grid grid-cols-8 gap-2 mb-4">
                                            {headerInfo.map((header) => (
                                                <div
                                                    key={header.key}
                                                    className="text-sm font-semibold text-center text-white group relative border-b-2 pb-2"
                                                    title={header.description}
                                                >
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                {header.label}
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{header.description}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-4">
                                            {gameState.guesses.map((guess, index) => (
                                                <ElementGrid
                                                    key={index}
                                                    guessResult={guess}
                                                    targetElement={gameState.dailyElement!}
                                                />
                                            ))}
                                        </div>
                                        )
                                    </div>
                                </div>
                                <ScrollBar orientation="horizontal" className="bg-red-950/40" />
                            </ScrollArea>
                        )}
                    </div>
                )
            }

            {
                gameState.guesses.length > 0 && (
                    <div>
                        <div className="mt-2 text-sm text-red-200 text-center md:hidden">
                            Scroll horizontally to see more information
                        </div>
                        <ColorIndicator items={colorItems} />
                    </div>
                )
            }

            {dailyGame.yesterday && (
                <div className="my-4 p-4 rounded-xl w-full max-w-lg mx-auto">
                    <h3 className="font-semibold mb-2 text-white">
                        {t('yesterday-character')} <span className="text-red-300">#{dailyGame.yesterday.game_number}</span> <span className="text-red-300 text-semibold text-2xl">{dailyGame.yesterday.element.name}</span>
                    </h3>
                </div>
            )}
            {
                gameState.gameStatus === "won" && (
                    <div>
                        <VictoryScreen
                            attempts={gameState.guesses.length}
                            timeTaken={gameState.timeTaken || 0}
                            streak={gameState.statistics.currentStreak}
                            isOneShot={gameState.guesses.length === 1}
                            element={gameState.dailyElement!}
                        />
                        <ShareResult
                            attempts={gameState.guesses.length}
                            timeTaken={gameState.timeTaken || 0}
                        />
                    </div>
                )
            }
        </div>
    )
}