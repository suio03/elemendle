"use client"

import { ElementGuessResult, Element } from "@/types/element"
import ElementBox from "./element-box"
import Arrow from "@/public/images/arrow.svg"
import ArrowUp from "@/public/images/arrow-up.svg"
import { motion } from "framer-motion"

interface ElementGridProps {
    guessResult: ElementGuessResult
    targetElement: Element
}

export default function ElementGrid({ guessResult, targetElement }: ElementGridProps) {
    const { element, matches } = guessResult

    function getNumericComparison(guessValue: string, targetValue: string) {
        const guessNum = parseFloat(guessValue)
        const targetNum = parseFloat(targetValue)
        return {
            isMatch: guessNum === targetNum,
            isHigher: guessNum > targetNum
        }
    }

    function getBackgroundColor(header: string, matchResult: any) {
        if (["ATOMIC NUMBER", "ATOMIC MASS", "PERIOD", "GROUP"].includes(header)) {
            const comparison = getNumericComparison(
                header === "ATOMIC NUMBER" ? element.classic.atomic_number :
                    header === "ATOMIC MASS" ? element.classic.atomic_mass :
                        header === "PERIOD" ? element.classic.period :
                            element.classic.group,
                header === "ATOMIC NUMBER" ? targetElement.classic.atomic_number :
                    header === "ATOMIC MASS" ? targetElement.classic.atomic_mass :
                        header === "PERIOD" ? targetElement.classic.period :
                            targetElement.classic.group
            )
            return comparison.isMatch ? "bg-green-600" : "bg-red-600"
        }
        return matchResult ? "bg-green-600" : "bg-red-600"
    }

    function getCellContent(header: string, value: string, matchResult: any) {
        if (["ATOMIC NUMBER", "ATOMIC MASS", "PERIOD", "GROUP"].includes(header)) {
            const comparison = getNumericComparison(value,
                header === "ATOMIC NUMBER" ? targetElement.classic.atomic_number :
                    header === "ATOMIC MASS" ? targetElement.classic.atomic_mass :
                        header === "PERIOD" ? targetElement.classic.period :
                            targetElement.classic.group
            )
            return (
                <div className="flex flex-col items-center justify-center relative h-full w-full">
                    <span className="relative z-10 font-semibold text-red-100">
                        {value}
                    </span>
                    {!comparison.isMatch && (
                        <img
                            src={comparison.isHigher ? Arrow.src : ArrowUp.src}
                            alt="direction indicator"
                            className="w-16 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 opacity-50"
                        />
                    )}
                </div>
            )
        }
        return <span className="text-xs font-semibold text-red-100 whitespace-normal break-words w-full text-center">{value}</span>
    }

    const container = {
        hidden: { opacity: 1 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    }

    const item = {
        hidden: { opacity: 0, x: -20 },
        show: {
            opacity: 1,
            x: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    }

    return (
        <motion.div
            className="grid grid-cols-8 gap-2"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {/* Element Box */}
            <motion.div variants={item}>
                <a href={element.wiki} target="_blank" rel="noopener noreferrer">
                    <ElementBox
                        number={element.classic.atomic_number}
                        symbol={element.symbol}
                        name={element.name}
                        category={element.classic.element_type as any}
                    />
                </a>
            </motion.div>

            {/* Period */}
            <motion.div variants={item} className={`${getBackgroundColor("PERIOD", matches.period.isMatch)} rounded-lg p-2 flex items-center justify-center min-h-[5rem] relative`}>
                {getCellContent("PERIOD", element.classic.period, matches.period)}
            </motion.div>

            {/* Group */}
            <motion.div variants={item} className={`${getBackgroundColor("GROUP", matches.group.isMatch)} rounded-lg p-2 flex items-center justify-center min-h-[5rem] relative`}>
                {getCellContent("GROUP", element.classic.group, matches.group)}
            </motion.div>

            {/* Block */}
            <motion.div variants={item} className={`${getBackgroundColor("BLOCK", matches.block)} rounded-lg p-2 flex items-center justify-center min-h-[5rem] relative`}>
                {getCellContent("BLOCK", element.classic.block, matches.block)}
            </motion.div>

            {/* Element Type */}
            <motion.div variants={item} className={`${getBackgroundColor("ELEMENT TYPE", matches.elementType)} rounded-lg p-2 flex items-center justify-center min-h-[5rem] relative`}>
                {getCellContent("ELEMENT TYPE", element.classic.element_type, matches.elementType)}
            </motion.div>

            {/* Phase */}
            <motion.div variants={item} className={`${getBackgroundColor("PHASE", matches.phase)} rounded-lg p-2 flex items-center justify-center min-h-[5rem] relative`}>
                {getCellContent("PHASE", element.classic["phase-at-stp"], matches.phase)}
            </motion.div>

            {/* Atomic Number */}
            <motion.div variants={item} className={`${getBackgroundColor("ATOMIC NUMBER", matches.atomicNumber.isMatch)} rounded-lg p-2 flex items-center justify-center min-h-[5rem] relative`}>
                {getCellContent("ATOMIC NUMBER", element.classic.atomic_number, matches.atomicNumber)}
            </motion.div>

            {/* Atomic Mass */}
            <motion.div variants={item} className={`${getBackgroundColor("ATOMIC MASS", matches.atomicMass.isMatch)} rounded-lg p-2 flex items-center justify-center min-h-[5rem] relative`}>
                {getCellContent("ATOMIC MASS", element.classic.atomic_mass, matches.atomicMass)}
            </motion.div>
        </motion.div>
    )
} 