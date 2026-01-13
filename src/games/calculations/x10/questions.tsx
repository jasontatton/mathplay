import {Difficulty, Question} from "../../../common/QuestionCardSeries";
import {
    niceRound,
    randomBoolean,
    roundUpToNearest10,
    sampleIntRange,
    shuffle,
    weightedSample,
    WeightingProfile
} from "../../../common/probability";


type Unit = 10 | 100 | 1000;

type NumRange = [number, number];

const small: NumRange = [1, 100];
const big: NumRange = [100, 10000];
const decimal: NumRange = [0, 1];

const difficultyToRange: Record<Difficulty, WeightingProfile<NumRange>> = {
    Easy: [
        {value: small, weight: 50},
        {value: big, weight: 25},
        {value: decimal, weight: 25}
    ],
    Medium: [
        {value: small, weight: 20},
        {value: big, weight: 60},
        {value: decimal, weight: 20}
    ],
    Hard: [
        {value: small, weight: 0},
        {value: big, weight: 20},
        {value: decimal, weight: 80}
    ],
};

const difficultyToMultiplier: Record<Difficulty, WeightingProfile<Unit>> = {
    Easy: [
        {value: 10, weight: 65},
        {value: 100, weight: 35},
        {value: 1000, weight: 0}
    ],
    Medium: [
        {value: 10, weight: 20},
        {value: 100, weight: 60},
        {value: 1000, weight: 20}
    ],
    Hard: [
        {value: 10, weight: 0},
        {value: 100, weight: 20},
        {value: 1000, weight: 80}
    ],
};


const max_attempts = 100; // jsut in case

function genWithRetry(formatIfDecimal: (_: number) => string, answer: number, func: () => number) {
    let attempt = func()
    let cnt = 0;
    // eslint-disable-next-line eqeqeq
    while (attempt <= 0 || attempt == answer || attempt > 3999) {
        attempt = func()
        if (cnt++ > max_attempts) {
            break;
        }
    }
    return formatIfDecimal(attempt);
}

function generateBogusAnswers(
    formatIfDecimal: (_: number) => string,
    multiply: boolean,
    answer: number,
    unit: Unit
): string[] {
    if (multiply) {
        const offByOne = genWithRetry(formatIfDecimal, answer, () => (answer / unit) * (unit * 10));
        const offByBitMore = genWithRetry(formatIfDecimal, answer, () => (answer / unit) * (unit * 100));
        const offByByLot = genWithRetry(formatIfDecimal, answer, () => (answer / unit) * (unit * 1000));

        return [offByOne, offByBitMore, offByByLot];
    } else {
        const offByOne = genWithRetry(formatIfDecimal, answer, () => (answer * unit) / (unit * 10));
        const offByBitMore = genWithRetry(formatIfDecimal, answer, () => (answer * unit) / (unit * 100));
        const offByByLot = genWithRetry(formatIfDecimal, answer, () => (answer * unit) / (unit * 1000));

        return [offByOne, offByBitMore, offByByLot];
    }
}

function isLaDecimal(num: number): boolean {
    return num % 1 !== 0;
}


export function makeQuestionBank(toMake: number, difficulty: Difficulty): Question[] {

    return Array.from({length: toMake}, (_) => {
        const multiplier = weightedSample(difficultyToMultiplier[difficulty]);

        const range = weightedSample(difficultyToRange[difficulty]);
        //75% bias towards end with zero

        let sourceNumber: number;

        const isDecimal = range === decimal;

        if (isDecimal) {
            // work backwards
            const ans = Math.random();
            sourceNumber = niceRound(ans / multiplier);
        } else {
            sourceNumber = sampleIntRange(range[0], range[1]);

            if (randomBoolean(75)) {
                sourceNumber = niceRound(roundUpToNearest10(sourceNumber));
            }
        }

        let answer = sourceNumber * multiplier;


        if (randomBoolean()) {

            const formatIfDecimal = (num: number): string => {
                return isLaDecimal(num) ? num.toFixed(4) : num.toLocaleString('en-US');
            }

            return {
                question: randomBoolean(75) ? `Multiply ${formatIfDecimal(sourceNumber)} by ${formatIfDecimal(multiplier)} ` : `${formatIfDecimal(sourceNumber)} x ${formatIfDecimal(multiplier)} `,
                explain: [`${formatIfDecimal(sourceNumber)} x ${multiplier} is ${formatIfDecimal(answer)}`],
                answer: formatIfDecimal(answer),
                answers: shuffle([...generateBogusAnswers(formatIfDecimal, true, answer, multiplier), formatIfDecimal(answer)]),
                questionDifficulty: difficulty,
                answerFormat: undefined,
            };
        } else {
            const temp = answer;
            answer = sourceNumber;
            sourceNumber = temp;

            const dps = Math.max(4, Math.log10(answer)) + Math.log10(multiplier);
            const formatIfDecimal = (num: number): string => {
                return isLaDecimal(num) ? num.toFixed(dps) : num.toLocaleString('en-US');
            }

            return {
                question: randomBoolean(75) ? `Divide ${formatIfDecimal(sourceNumber)} by ${formatIfDecimal(multiplier)} ` : `${formatIfDecimal(sourceNumber)} / ${formatIfDecimal(multiplier)} `,
                explain: [`${formatIfDecimal(sourceNumber)} / ${multiplier} is ${formatIfDecimal(answer)}`],
                answer: formatIfDecimal(answer),
                answers: shuffle([...generateBogusAnswers(formatIfDecimal, false, answer, multiplier), formatIfDecimal(answer)]),
                questionDifficulty: difficulty,
                answerFormat: undefined,
            };
        }
    });

}



