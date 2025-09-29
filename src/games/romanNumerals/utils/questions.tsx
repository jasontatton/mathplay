type DifficultyScaler = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

type AnswerRange = [number, number];

const difficultyToScalar: Record<Difficulty, [number, number, AnswerRange]> = {
    'Easy': [1, 3, [1, 250]],
    'Medium': [4, 6, [250, 1500]],
    'Hard': [7, 10, [1500, 3999]],
};

type QuestionType = 'romanToDec' | 'decToRoman' | 'romanPlus';

export type Question = {
    qType: QuestionType;
    multichoice: boolean;
    difficulty: DifficultyScaler;
    answer: number;
};

function rangeInclusive(start: number, end: number): number[] {
    const step = start <= end ? 1 : -1; // for ascending or descending
    const result: number[] = [];

    for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
        result.push(i);
    }

    return result;
}

function biasedRandomInRange(lowerAnswerRange: number, upperAnswerRange: number, difficultyLowerBound: number, difficultyUpperBound: number, howHard: number): number {
    // Ensure a <= b
    if (lowerAnswerRange > upperAnswerRange) [lowerAnswerRange, upperAnswerRange] = [upperAnswerRange, lowerAnswerRange];

    // Clamp s between l and u
    const clampedS = Math.max(difficultyLowerBound, Math.min(howHard, difficultyUpperBound));

    // Normalize s to 0..1 range
    const biasFactor = (clampedS - difficultyLowerBound) / (difficultyUpperBound - difficultyLowerBound);

    // Pick a random number, biased towards biasFactor
    // Square or cube factor for stronger bias control (optional)
    const r = Math.random();
    const skewedR = Math.pow(r, 1 - biasFactor) * (1 - biasFactor) + Math.pow(r, biasFactor) * biasFactor;

    // Linear interpolation between a and b
    return Math.round(lowerAnswerRange + skewedR * (upperAnswerRange - lowerAnswerRange));
}

function derivedHowHardToAnswerRange() {
    const ret: Record<number, [number, number, AnswerRange]> = {};
    Object.keys(difficultyToScalar).forEach((difficulty) => {
        const [scalarLow, scalarHigh, answerRange] = difficultyToScalar[difficulty as Difficulty];
        rangeInclusive(scalarLow, scalarHigh).forEach((scl) => {
            ret[scl] = [scalarLow, scalarHigh, answerRange];
        });
    });
    return ret;
}

const howHardToAnswerRange: Record<number, [number, number, AnswerRange]> = derivedHowHardToAnswerRange()

const [hardLowerBound, hardUpperBound, _ignored] = difficultyToScalar['Hard']

function rangeNInt(a: number, b: number, n: number): number[] {
    if (n <= 1) return [Math.round(a)];

    const step = (b - a) / (n - 1);
    const result: number[] = [];

    for (let i = 0; i < n; i++) {
        result.push(Math.round(a + i * step));
    }

    return Array.from(result); // Remove duplicates from rounding
}

function pickWithWeight<T>(opt1: T, opt2: T, opt3: T, weight: number): T {
    // Clamp weight between 7 and 10
    const w = Math.max(hardLowerBound, Math.min(weight, hardUpperBound));
    // Calculate probability for opt3
    const p3 = 0.33 + ((w - 7) / 3) * (1 - 0.33); // 33% → 100%

    const r = Math.random();
    if (r < p3) {
        return opt3;
    } else if (r < p3 + (1 - p3) / 2) {
        return opt1;
    } else {
        return opt2;
    }
}

export function makeQuestion(howHard: number): Question {
    let qType: QuestionType;
    if (howHard < hardLowerBound) {
        qType = Math.random() < 0.5 ? 'romanToDec' : 'decToRoman';
    } else {
        qType = pickWithWeight('romanToDec', 'decToRoman', 'romanPlus', howHard)
    }

    const [difficultyLowerBound, difficultyUpperBound, [lowerAnswerRange, upperAnswerRange]] = howHardToAnswerRange[howHard];
    const answer = biasedRandomInRange(lowerAnswerRange, upperAnswerRange, difficultyLowerBound, difficultyUpperBound, howHard);

    return {qType, difficulty: howHard as DifficultyScaler, multichoice: Math.random() < 0.5, answer};
}

export function makeQuestionBank(toMake: number, difficulty: Difficulty): Question[] {
    const [scalarLow, scalarHigh, _] = difficultyToScalar[difficulty];

    return rangeNInt(scalarLow, scalarHigh, toMake).map(makeQuestion);
}

