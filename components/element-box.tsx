// src/components/PeriodicElementBox.tsx

import React from 'react'
import { ElementCategory } from '@/types/element'

interface ElementBoxProps {
    number: string;
    symbol: string;
    name: string;
    category: ElementCategory;
    onClick?: () => void;
    className?: string;
}

// Helper function to normalize category strings
function normalizeCategory(category: string): ElementCategory {
  // Remove spaces and special characters, keeping only alphanumeric characters
  return category.replace(/\s+/g, '') as ElementCategory;
}

// Color map for different element categories
const categoryColors: Record<ElementCategory, string> = {
    AlkaliMetal: 'bg-[#244d57]',        // Teal-like color
    AlkalineEarthMetal: 'bg-[#622e39]', // Darker pink/red
    TransitionMetal: 'bg-[#433c65]',    // Purple
    PostTransitionMetal: 'bg-[#2f4d47]', // Teal/green
    Metalloid: 'bg-[#523e1b]',          // Brown/gold
    ReactiveNonMetal: 'bg-[#2a4165]',   // Blue
    NobleGas: 'bg-[#623842]',           // Dark pink/red
    Lanthanide: 'bg-[#004a77]',         // Darker blue
    Actinide: 'bg-[#613b28]',           // Darker brown
    Unknown: 'bg-[#46474c]',            // Dark gray
}

const ElementBox: React.FC<ElementBoxProps> = ({ 
    number, 
    symbol, 
    name, 
    category,
    onClick,
    className = ''
}) => {
    const bgColor = categoryColors[normalizeCategory(category)] || categoryColors.Unknown;
    return (
        <div 
            className={`
                relative w-20 h-20 text-white rounded-xl 
                ${bgColor} 
                flex flex-col p-1 
                hover:scale-105 transition-transform duration-300
                ${className}
            `}
        >
            <div className="text-xs absolute top-1 left-1">{number}</div>
            <div className="text-3xl font-bold text-center pt-3">{symbol}</div>
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs self-center text-center">
                {name}
            </div>
        </div>
    )
}

export default ElementBox