"use client"

import { useEffect, useState } from 'react'
import {
    getStoredProgressionData,
    PROGRESSION_UPDATED_EVENT
} from '@/lib/progression'
import type { ProgressionData } from '@/types/progression'

export function useProgression(): ProgressionData | null {
    const [progression, setProgression] = useState<ProgressionData | null>(null)

    useEffect(() => {
        setProgression(getStoredProgressionData())
        const update = (event: Event) => setProgression((event as CustomEvent<ProgressionData>).detail)
        window.addEventListener(PROGRESSION_UPDATED_EVENT, update)
        return () => window.removeEventListener(PROGRESSION_UPDATED_EVENT, update)
    }, [])

    return progression
}
