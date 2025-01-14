import { Character, GuessResult } from "@/types/game";


export function compareCharacters(guess: Character, target: Character): GuessResult {
    const compareNumeric = (guessVal: string, targetVal: string) => {
        const guessNum = parseInt(guessVal, 10);
        const targetNum = parseInt(targetVal, 10);
        
        return {
            isMatch: guessNum === targetNum,
            isHigher: guessNum > targetNum
        };
    };

    // Compare height and episode numbers
    const heightResult = compareNumeric(guess.classic.height, target.classic.height);
    const episodeResult = compareNumeric(guess.classic["first-appearance"], target.classic["first-appearance"]);

    return {
        character: guess,
        matches: {
            gender: guess.classic.gender === target.classic.gender,
            height: heightResult,  // This now includes both isMatch and isHigher
            race: guess.classic.race === target.classic.race,
            profession: guess.classic["profession/occupation"] === target.classic["profession/occupation"],
            location: guess.classic["base of operations"] === target.classic["base of operations"],
            affiliation: guess.classic.affiliation === target.classic.affiliation,
            firstAppearance: episodeResult  // This now includes both isMatch and isHigher
        }
    };
}

export function isWinningGuess(guessResult: GuessResult): boolean {
    const { matches } = guessResult;
    return (
        matches.gender &&
        matches.height.isMatch &&
        matches.race &&
        matches.profession &&
        matches.location &&
        matches.affiliation &&
        matches.firstAppearance.isMatch
    );
}

export function validateGuess(
    input: string,
    characters: Record<string, Character>
): Character | null {
    const normalizedInput = input.toLowerCase().trim();
    return (
        Object.values(characters).find(
            (char) => char.name.toLowerCase() === normalizedInput
        ) || null
    );
}
