import type { Element, ElementGuessResult } from "@/types/element";

export function compareElements(
    guess: Element,
    target: Element
): ElementGuessResult {
    const compareNumeric = (guessVal: string, targetVal: string) => {
        const guessNum = parseFloat(guessVal);
        const targetNum = parseFloat(targetVal);

        return {
            isMatch: guessNum === targetNum,
            isHigher: guessNum > targetNum,
        };
    };

    return {
        element: guess,
        matches: {
            period: compareNumeric(guess.classic.period, target.classic.period),
            group: compareNumeric(guess.classic.group, target.classic.group),
            block: guess.classic.block === target.classic.block,
            elementType:
                guess.classic.element_type === target.classic.element_type,
            phase:
                guess.classic["phase-at-stp"] ===
                target.classic["phase-at-stp"],
            atomicNumber: compareNumeric(
                guess.classic.atomic_number,
                target.classic.atomic_number
            ),
            atomicMass: compareNumeric(
                guess.classic.atomic_mass,
                target.classic.atomic_mass
            ),
        },
    };
}

export function isWinningGuess(guessResult: ElementGuessResult): boolean {
    const { matches } = guessResult;
    return (
        matches.period.isMatch &&
        matches.group.isMatch &&
        matches.block &&
        matches.elementType &&
        matches.phase &&
        matches.atomicNumber.isMatch &&
        matches.atomicMass.isMatch
    );
}

export function validateElementGuess(
    input: string,
    elements: Record<string, Element>
): Element | null {
    // First try exact name match
    const exactMatch = Object.values(elements).find(
        (element) => element.name.toLowerCase() === input.toLowerCase()
    );
    if (exactMatch) return exactMatch;

    // Then try symbol match
    const symbolMatch = Object.values(elements).find(
        (element) => element.symbol.toLowerCase() === input.toLowerCase()
    );
    if (symbolMatch) return symbolMatch;

    return null;
}

export function getElementCategory(element: Element): string {
    return element.classic.element_type.toLowerCase().replace(/\s+/g, "-");
}

export function getHint(element: Element): string {
    const { hints } = element;
    if (!hints.properties.length) return "";

    const randomIndex = Math.floor(Math.random() * hints.properties.length);
    return hints.properties[randomIndex];
}
