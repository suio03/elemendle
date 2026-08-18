"use client"

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'react-hot-toast'
import elementsData from '@/data/atom.json'
import { compareElements, isWinningGuess, validateElementGuess } from '@/lib/element-game'
import { MAX_ATTEMPTS } from '@/lib/game-rules'
import { calculateTimeTaken } from '@/lib/storage'
import { markGamePlayed, trackEvent } from '@/lib/analytics'
import type { Element, ElementGameSessionState, GameMode } from '@/types/element'

export interface UseElementGameOptions<State extends ElementGameSessionState> {
    mode: GameMode
    targetElement: Element
    createInitialState: () => State
    saveState: (state: State) => void
    settleState?: (state: State, timeTaken: number) => State
    onWin?: () => void
}

export function useElementGame<State extends ElementGameSessionState>({
    mode,
    targetElement,
    createInitialState,
    saveState,
    settleState,
    onWin
}: UseElementGameOptions<State>) {
    const t = useTranslations('game-board')
    const locale = useLocale()
    const [gameState, setGameState] = useState<State>(createInitialState)
    const [input, setInput] = useState('')
    const [filteredElements, setFilteredElements] = useState<Element[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
    const hasTrackedStartRef = useRef(gameState.guesses.length > 0)
    const isSubmittingRef = useRef(false)

    useEffect(() => {
        saveState(gameState)
    }, [gameState, saveState])

    const updateGameState = useCallback((update: (current: State) => State) => {
        setGameState(update)
    }, [])

    const handleInput = (value: string) => {
        setInput(value)
        setActiveSuggestionIndex(0)

        if (!value.trim()) {
            setShowSuggestions(false)
            setFilteredElements([])
            return
        }

        const searchTerm = value.trim().toLowerCase()
        const filtered = Object.values(elementsData)
            .filter(element => {
                const nameMatch = element.name.toLowerCase().includes(searchTerm)
                const symbolMatch = element.symbol.toLowerCase().includes(searchTerm)
                const notAlreadyGuessed = !gameState.guesses.some(
                    guess => guess.element.name === element.name
                )
                return (nameMatch || symbolMatch) && notAlreadyGuessed
            })
            .sort((left, right) => {
                const leftIsExact = left.name.toLowerCase() === searchTerm ||
                    left.symbol.toLowerCase() === searchTerm
                const rightIsExact = right.name.toLowerCase() === searchTerm ||
                    right.symbol.toLowerCase() === searchTerm

                if (leftIsExact !== rightIsExact) return leftIsExact ? -1 : 1
                return left.name.localeCompare(right.name)
            })
            .slice(0, 5)

        setFilteredElements(filtered)
        setShowSuggestions(filtered.length > 0)

        if (!gameState.hasStarted) {
            updateGameState(current => current.hasStarted ? current : {
                ...current,
                hasStarted: true,
                startTime: Date.now()
            })
        }
    }

    const handleGuess = useCallback((selectedElement?: Element) => {
        if (isSubmittingRef.current || gameState.gameStatus !== 'in-progress') return false

        const validatedElement = selectedElement || validateElementGuess(input, elementsData)
        if (!validatedElement) {
            toast.error(t('invalid-guess'))
            return false
        }

        if (gameState.guesses.some(guess => guess.element.name === validatedElement.name)) {
            toast.error(t('already-guessed'))
            return false
        }

        isSubmittingRef.current = true
        try {
            if (!hasTrackedStartRef.current) {
                hasTrackedStartRef.current = true
                markGamePlayed()
                trackEvent('game_started', { locale, mode })
            }

            const guessResult = compareElements(validatedElement, targetElement)
            const guesses = [...gameState.guesses, guessResult]
            const won = isWinningGuess(guessResult)
            const lost = guesses.length >= MAX_ATTEMPTS && !won
            const completed = won || lost
            const endTime = Date.now()
            const timeTaken = calculateTimeTaken(gameState.startTime, endTime)

            let nextState = {
                ...gameState,
                guesses,
                gameStatus: won ? 'won' : lost ? 'lost' : 'in-progress',
                endTime: completed ? endTime : undefined,
                timeTaken: completed ? timeTaken : undefined
            } as State

            trackEvent('guess_submitted', {
                mode,
                attemptNumber: guesses.length
            })

            if (completed) {
                if (settleState) nextState = settleState(nextState, timeTaken)
                trackEvent('game_completed', {
                    mode,
                    result: won ? 'won' : 'lost',
                    attempts: guesses.length,
                    assistEnabled: nextState.revealedHints.length > 0 || nextState.candidateMapUsed
                })
            }

            setGameState(nextState)
            setInput('')
            setFilteredElements([])
            setShowSuggestions(false)
            setActiveSuggestionIndex(0)

            if (won) onWin?.()
            return true
        } catch (error) {
            console.error('Error while submitting guess:', error)
            return false
        } finally {
            isSubmittingRef.current = false
        }
    }, [gameState, input, locale, mode, onWin, settleState, t, targetElement])

    const selectElement = (element: Element) => {
        setInput(element.name)
        setShowSuggestions(false)
        handleGuess(element)
    }

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            setShowSuggestions(false)
            return
        }

        if (showSuggestions && filteredElements.length > 0) {
            if (event.key === 'ArrowDown') {
                event.preventDefault()
                setActiveSuggestionIndex(index => (index + 1) % filteredElements.length)
                return
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault()
                setActiveSuggestionIndex(index =>
                    index === 0 ? filteredElements.length - 1 : index - 1
                )
                return
            }

            if (event.key === 'Enter') {
                event.preventDefault()
                selectElement(filteredElements[activeSuggestionIndex])
                return
            }
        }

        if (event.key === 'Enter') {
            event.preventDefault()
            handleGuess()
        }
    }

    const setHintsEnabled = () => {
        updateGameState(current => ({
            ...current,
            hintsEnabled: !current.hintsEnabled,
            candidateMapEnabled: current.hintsEnabled ? false : current.candidateMapEnabled
        }))
    }

    const setCandidateMapEnabled = (enabled: boolean) => {
        if (!gameState.hintsEnabled) return
        updateGameState(current => ({
            ...current,
            candidateMapEnabled: enabled,
            candidateMapUsed: current.candidateMapUsed || enabled
        }))
    }

    const revealHint = (hintIndex: number) => {
        if (!gameState.hintsEnabled || gameState.revealedHints.includes(hintIndex)) return

        updateGameState(current => ({
            ...current,
            revealedHints: [...current.revealedHints, hintIndex].sort((left, right) => left - right),
            dismissedHints: current.dismissedHints.filter(index => index !== hintIndex)
        }))
        trackEvent('hint_used', { mode, hintNumber: hintIndex + 1 })
    }

    const dismissHint = (hintIndex: number) => {
        updateGameState(current => ({
            ...current,
            dismissedHints: current.dismissedHints.includes(hintIndex)
                ? current.dismissedHints
                : [...current.dismissedHints, hintIndex]
        }))
    }

    const restoreHint = (hintIndex: number) => {
        updateGameState(current => ({
            ...current,
            dismissedHints: current.dismissedHints.filter(index => index !== hintIndex)
        }))
    }

    return {
        gameState,
        input,
        filteredElements,
        showSuggestions,
        activeSuggestionIndex,
        handleInput,
        handleInputKeyDown,
        handleGuess,
        selectElement,
        setHintsEnabled,
        setCandidateMapEnabled,
        revealHint,
        dismissHint,
        restoreHint
    }
}
