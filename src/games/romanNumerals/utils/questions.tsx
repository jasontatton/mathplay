import {Difficulty, Question} from "../../../common/QuestionCardSeries";
import {decimalToRoman} from "./roman";

type DifficultyScaler = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type AnswerRange = [number, number];

const difficultyToScalar: Record<Difficulty, [number, number, AnswerRange]> = {
    'Easy': [1, 3, [1, 250]],
    'Medium': [4, 6, [250, 1500]],
    'Hard': [7, 10, [1500, 3999]],
};

type RNQuestionType = 'romanToDec' | 'decToRoman' | 'romanPlus';

export type RNQuestion = {
    qType: RNQuestionType;
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

// eslint-disable-next-line
const [hardLowerBound, hardUpperBound, _] = difficultyToScalar['Hard']

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

export function makeQuestion(howHard: number): RNQuestion {
    let qType: RNQuestionType;
    if (howHard < hardLowerBound) {
        qType = randomBoolean() ? 'romanToDec' : 'decToRoman';
    } else {
        qType = pickWithWeight('romanToDec', 'decToRoman', 'romanPlus', howHard)
    }

    const [difficultyLowerBound, difficultyUpperBound, [lowerAnswerRange, upperAnswerRange]] = howHardToAnswerRange[howHard];
    const answer = biasedRandomInRange(lowerAnswerRange, upperAnswerRange, difficultyLowerBound, difficultyUpperBound, howHard);

    return {qType, difficulty: howHard as DifficultyScaler, multichoice: randomBoolean(), answer};
}

function explainDecimalToRoman(num: number): string[] {
    const val: number[] = [
        1000, 900, 500, 400,
        100, 90, 50, 40,
        10, 9, 5, 4,
        1
    ];

    const syms: string[] = [
        "M", "CM", "D", "CD",
        "C", "XC", "L", "XL",
        "X", "IX", "V", "IV",
        "I"
    ];

    let explanation: string[] = [];
    let romanNum: string = "";
    let i: number = 0;
    const original = num;

    explanation.push(`Converting ${original} into Roman numerals:`);

    while (num > 0) {
        let count = Math.floor(num / val[i]);

        if (count > 0) {
            if (["IV", "IX", "XL", "XC", "CD", "CM"].includes(syms[i])) {
                // Subtractive notation explanation
                const base = syms[i][1];    // e.g. "X" in "IX"
                const smaller = syms[i][0]; // e.g. "I" in "IX"
                explanation.push(
                    `- ${val[i]} is written as '${syms[i]}'. ` +
                    `This is subtractive notation: '${smaller}' before '${base}' means ${base} - ${smaller}.`
                );
            } else {
                // Normal additive explanation
                explanation.push(
                    `- ${val[i]} fits into ${num} → add '${syms[i]}' ${count} time(s).`
                );
            }

            romanNum += syms[i].repeat(count);
            num -= val[i] * count;
            explanation.push(`  Remaining value: ${num}`);
        }

        i++;
    }

    explanation.push(`Final Roman numeral: ${romanNum} <- this is our answer`);
    return explanation;
}

function explainRomanBreakdown(roman: string): string[] {
    const values: Record<string, number> = {
        I: 1,
        V: 5,
        X: 10,
        L: 50,
        C: 100,
        D: 500,
        M: 1000
    };

    let total = 0;
    const explanation: string[] = [];

    // Scan left to right for pairs
    let i = 0;
    while (i < roman.length) {
        const currentChar = roman[i].toUpperCase();
        const currentVal = values[currentChar];
        if (!currentVal) {
            throw new Error(`Invalid Roman numeral character: ${roman[i]}`);
        }

        const nextChar = roman[i + 1]?.toUpperCase();
        const nextVal = nextChar ? values[nextChar] : undefined;

        if (nextVal && currentVal < nextVal) {
            // Found a subtractive pair
            const pairValue = nextVal - currentVal;
            total += pairValue;
            explanation.push(
                `${currentChar}${nextChar} means ${nextVal} − ${currentVal} = ${pairValue} → total now ${total}`
            );
            i += 2; // Skip both characters
        } else {
            // Additive single symbol
            total += currentVal;
            explanation.push(
                `${currentChar} adds ${currentVal} → total now ${total}`
            );
            i += 1;
        }
    }

    explanation.push(`Which gives us the total: ${total}`);

    return explanation;
}

function shuffle<T>(array: T[]): T[] {
    return array
        .map(item => ({sortKey: Math.random(), value: item}))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(item => item.value);
}

const max_attempts = 100; // jsut in case

function randomBoolean(): boolean {
    return Math.random() < 0.5;
}

function derive3BogusAnswers(answer: number): number[] {
    function genWithRetry(func: () => number) {
        let attempt = func()
        let cnt = 0;
        // eslint-disable-next-line eqeqeq
        while (attempt <= 0 || attempt == answer || attempt > 3999) {
            attempt = func()
            if (cnt++ > max_attempts) {
                break;
            }
        }
        console.log(attempt);
        return attempt;
    }

    function randomUpToYPercentOff(pct: number, minPctOff?: number): number {
        const min = answer * (1. + ((minPctOff || 100) / 100.));
        const max = answer * (1. + (pct / 100.));
        return Math.floor(Math.random() * (max - min + 1) + min) * (randomBoolean() ? -1 : 1);
    }

    const offByOne = genWithRetry(() => (Math.floor(Math.random() * 4) + 1) * (randomBoolean() ? -1 : 1))
    const closeOne = genWithRetry(() => randomUpToYPercentOff(20))
    const sillyOne = genWithRetry(() => randomUpToYPercentOff(150, 50))

    return [offByOne, closeOne, sillyOne]

}


function randomBiasedNumber(maxValue: number, bias: number): number {
    // Clamp bias between 1 and 10
    bias = Math.max(1, Math.min(10, bias));

    // Map bias [1, 10] to exponent range
    // bias=1 → 3 (skew low), bias=5 → 1 (uniform), bias=10 → 0.3 (skew high)
    const exponent = 3 - ((bias - 1) / 9) * (3 - 0.3);

    // Random number between 0 and 1, skewed by exponent
    const rand = Math.random() ** exponent;

    // Scale result into [1, maxValue]
    return Math.floor(rand * (maxValue - 1)) + 1;
}

export function makeRNQuestionBank(toMake: number, difficulty: Difficulty): Question[] {
    // eslint-disable-next-line
    const [scalarLow, scalarHigh, _] = difficultyToScalar[difficulty];

    return rangeNInt(scalarLow, scalarHigh, toMake).map(diff => {
        const qq = makeQuestion(diff);
        let ret: Question;
        switch (qq.qType) {
            case "decToRoman":
                ret = {
                    question: `What is this as a roman numeral: ${qq.answer}`,
                    explain: explainDecimalToRoman(qq.answer),
                    answer: decimalToRoman(qq.answer) || "?",
                    answers: qq.multichoice ? shuffle([...derive3BogusAnswers(qq.answer), qq.answer].map(x => (decimalToRoman(x) || "?"))) : [],
                    questionDifficulty: difficulty,
                    answerFormat: qq.multichoice ? undefined : (difficulty === 'Easy' ? 'RomanNumeralInputWithHint' : 'RomanNumeralInput'),
                };
                break;
            case "romanToDec":
                ret = {
                    question: `What is this as a decimal: ${decimalToRoman(qq.answer)}`,
                    explain: explainRomanBreakdown(decimalToRoman(qq.answer) as string),
                    answer: qq.answer,
                    answers: qq.multichoice ? shuffle([...derive3BogusAnswers(qq.answer), qq.answer]) : [],
                    questionDifficulty: difficulty,
                    answerFormat: qq.multichoice ? undefined : (difficulty === 'Easy' ? 'DecimalKeypadWithHint' : 'DecimalInput'),
                };
                break;
            case "romanPlus":
                const ans = qq.answer;
                // harder questions have answers which have lhs and rhs which are closer to 50% of the answer
                let lhs = ans * (randomBiasedNumber(50, diff) / 100);
                let rhs = ans - lhs;
                if (randomBoolean()) {
                    //swap
                    const tmp = rhs;
                    rhs = lhs;
                    lhs = tmp
                }

                const explain = [
                    'First we turn the left hand side into a decimal:',
                    ...explainRomanBreakdown(decimalToRoman(lhs) as string).map(x => `• ${x}`),
                    'Then we turn the right hand side into a decimal:',
                    ...explainRomanBreakdown(decimalToRoman(rhs) as string).map(x => `• ${x}`),
                    `Now we add: ${lhs} + ${rhs} => ${ans} and turn this into a roman Numeral:`,
                    ...explainDecimalToRoman(qq.answer).map(x => ` ${x}`).map(x => `• ${x}`)
                ]

                ret = {
                    question: `What is ${decimalToRoman(lhs)} + ${decimalToRoman(rhs)} as a roman Numeral?`,
                    explain,
                    answer: decimalToRoman(qq.answer) || "?",
                    answers: qq.multichoice ? shuffle([...derive3BogusAnswers(qq.answer), qq.answer].map(x => (decimalToRoman(x) || "?"))) : [],
                    questionDifficulty: difficulty,
                    answerFormat: qq.multichoice ? undefined : (difficulty === 'Easy' ? 'RomanNumeralInputWithHint' : 'RomanNumeralInput'),
                };
                break;
        }
        return ret;
    });
}

//TODO:
// add highscore mode