export type LessonId = 'clues' | 'first-20'
export interface LearnQuestion {
    prompt: string
    choices: string[]
    answer: number
    explanation: string
    review: string
}

export const lessonQuizzes: Record<LessonId, LearnQuestion[]> = {
    clues: [
        { prompt: 'Your guess has atomic number 8. The feedback is ↑. What does that tell you?', choices: ['The answer has more than 8 protons', 'The answer has fewer than 8 protons', 'The answer is in period 8'], answer: 0, explanation: 'The arrow points toward the target value. Atomic number counts protons, so ↑ from 8 means an atomic number greater than 8.', review: '#atomic-number' },
        { prompt: 'The target is in group 2 and period 4. Which element fits both clues?', choices: ['Magnesium (Mg)', 'Potassium (K)', 'Calcium (Ca)'], answer: 2, explanation: 'Calcium sits at the intersection of group 2 and period 4. Magnesium shares its group but is in period 3; potassium shares its period but is in group 1.', review: '#position' },
        { prompt: 'Your guess matches the target’s gas phase. What can you conclude?', choices: ['You have found the element', 'Keep the gases, then use other clues', 'The target must be a noble gas'], answer: 1, explanation: 'Several elements are gases in the game’s reference conditions. Oxygen and nitrogen are gases too, so a phase match does not prove the target is a noble gas or identify it uniquely.', review: '#categories' }
    ],
    'first-20': [
        { prompt: 'Which symbol belongs to sodium?', choices: ['S', 'Na', 'Ne'], answer: 1, explanation: 'Sodium is Na. S is sulfur and Ne is neon. Learn the name and symbol together rather than relying on the first letter.', review: '#symbols' },
        { prompt: 'Which element has atomic number 12?', choices: ['Magnesium (Mg)', 'Carbon (C)', 'Calcium (Ca)'], answer: 0, explanation: 'Magnesium is element 12. Carbon is 6 and calcium is 20. Atomic number identifies the element by its proton count.', review: '#element-table' },
        { prompt: 'Which pair belongs to the same group?', choices: ['Sodium and magnesium', 'Oxygen and neon', 'Lithium and potassium'], answer: 2, explanation: 'Lithium and potassium are both in group 1. Sodium and magnesium share period 3, while oxygen and neon share period 2: sharing a row is different from sharing a column.', review: '#patterns' }
    ]
}

// Curated teaching subset, independent of the daily answer and game progress.
export const firstTwenty = [
    { number: 1, symbol: 'H', name: 'Hydrogen', group: 1, period: 1 },
    { number: 2, symbol: 'He', name: 'Helium', group: 18, period: 1 },
    { number: 3, symbol: 'Li', name: 'Lithium', group: 1, period: 2 },
    { number: 4, symbol: 'Be', name: 'Beryllium', group: 2, period: 2 },
    { number: 5, symbol: 'B', name: 'Boron', group: 13, period: 2 },
    { number: 6, symbol: 'C', name: 'Carbon', group: 14, period: 2 },
    { number: 7, symbol: 'N', name: 'Nitrogen', group: 15, period: 2 },
    { number: 8, symbol: 'O', name: 'Oxygen', group: 16, period: 2 },
    { number: 9, symbol: 'F', name: 'Fluorine', group: 17, period: 2 },
    { number: 10, symbol: 'Ne', name: 'Neon', group: 18, period: 2 },
    { number: 11, symbol: 'Na', name: 'Sodium', group: 1, period: 3 },
    { number: 12, symbol: 'Mg', name: 'Magnesium', group: 2, period: 3 },
    { number: 13, symbol: 'Al', name: 'Aluminium', group: 13, period: 3 },
    { number: 14, symbol: 'Si', name: 'Silicon', group: 14, period: 3 },
    { number: 15, symbol: 'P', name: 'Phosphorus', group: 15, period: 3 },
    { number: 16, symbol: 'S', name: 'Sulfur', group: 16, period: 3 },
    { number: 17, symbol: 'Cl', name: 'Chlorine', group: 17, period: 3 },
    { number: 18, symbol: 'Ar', name: 'Argon', group: 18, period: 3 },
    { number: 19, symbol: 'K', name: 'Potassium', group: 1, period: 4 },
    { number: 20, symbol: 'Ca', name: 'Calcium', group: 2, period: 4 }
] as const
