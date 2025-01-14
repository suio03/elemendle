'use client'

import { useState, useEffect } from 'react'
import type { Element, ElementGameState } from '@/types/element'
import { ENDPOINTS } from '@/app/api/client/endpoints'

interface DailyGameResponse {
    success: boolean
    error?: string
    data?: {
        element: Element
        game_number: number
        solved_count: number
        yesterday?: {
            game_number: number
            element: Element
        }
    }
}

interface UseGameAPIReturn {
    dailyGame: {
        element: Element
        game_number: number
        solved_count: number
        yesterday?: {
            game_number: number
            element: Element
        }
    } | null
    isLoading: boolean
    error: Error | null
    incrementCompletions: () => Promise<void>
}

export function useGameAPI(): UseGameAPIReturn {
    const [dailyGame, setDailyGame] = useState<UseGameAPIReturn['dailyGame']>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        fetchDailyGame()
    }, [])

    async function fetchDailyGame() {
        try {
            const response = await fetch(ENDPOINTS.daily.get)
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            setDailyGame(data.data)
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch daily game'))
        } finally {
            setIsLoading(false)
        }
    }

    async function incrementCompletions() {
        try {
            const response = await fetch(ENDPOINTS.daily.increment, {
                method: 'POST'
            })
            const data = await response.json()
            if (!data.success) throw new Error(data.error)
            
            // Refresh daily game data
            await fetchDailyGame()
        } catch (err) {
            console.error('Failed to increment completions:', err)
        }
    }

    return {
        dailyGame,
        isLoading,
        error,
        incrementCompletions
    }
} 