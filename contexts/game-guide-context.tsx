'use client'
import { createContext, useContext, useState } from 'react'

interface GameGuideContextType {
  isGuideVisible: boolean
  toggleGuide: () => void
}

const GameGuideContext = createContext<GameGuideContextType | undefined>(undefined)

export function GameGuideProvider({ children }: { children: React.ReactNode }) {
  const [isGuideVisible, setIsGuideVisible] = useState(false)

  const toggleGuide = () => setIsGuideVisible(prev => !prev)

  return (
    <GameGuideContext.Provider value={{ isGuideVisible, toggleGuide }}>
      {children}
    </GameGuideContext.Provider>
  )
}

export function useGameGuide() {
  const context = useContext(GameGuideContext)
  if (context === undefined) {
    throw new Error('useGameGuide must be used within a GameGuideProvider')
  }
  return context
} 