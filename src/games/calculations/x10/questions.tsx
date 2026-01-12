import {Difficulty, Question} from "../../../common/QuestionCardSeries";
import {
    MULTI_CHOICE_DIST,
    randomBoolean,
    randomIntUpTo,
    shuffle,
    weightedSample,
    WeightingProfile
} from "../../../common/probability";


type Unit = 10 | 100 | 1000;

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

const unitToBlurb: Record<Unit, string> = {
    10: 'ten',
    100: 'hundred',
    1000: 'thousand',
};


const msbOffsetDist: WeightingProfile<number> = [
    {value: -1, weight: 20},
    {value: 0, weight: 30},
    {value: 1, weight: 30},
    {value: 2, weight: 20}
];

type RoundingScheme = 'Nearest' | 'Up' | 'Down';

const roundingSchemeBlurb: Record<RoundingScheme, string> = {
    Up: 'up to the nearest',
    Down: 'down to the nearest',
    Nearest: 'to the nearest',
}

const schemeDist: WeightingProfile<RoundingScheme> = [
    {value: 'Nearest', weight: 34},
    {value: 'Up', weight: 33},
    {value: 'Down', weight: 33},
];


function roundToUnit(value: number, unit: Unit, mode: RoundingScheme): number {
    if (unit <= 0) throw new Error("Unit must be a positive number");

    const divided = value / unit;

    switch (mode) {
        case "Up":
            return Math.ceil(divided) * unit;
        case "Down":
            return Math.floor(divided) * unit;
        case "Nearest":
            return Math.round(divided) * unit;
    }
}

const unitDigitDist: WeightingProfile<number> = [
    {value: 1, weight: 9},
    {value: 2, weight: 9},
    {value: 3, weight: 9},
    {value: 4, weight: 9},
    {value: 5, weight: 28},//28% of the time we have 5 as this is the most interesting number for rounding
    {value: 6, weight: 9},
    {value: 7, weight: 9},
    {value: 8, weight: 9},
    {value: 9, weight: 9},
];

function randomWithOverride(totalDigs: number, overrideWhat: number, overrideDigit: number): number {
    if (totalDigs < 1) {
        throw new Error(`totalDigs (${totalDigs}) must be >= 1`);
    }
    if (overrideWhat < 1 || overrideWhat > totalDigs) {
        throw new Error(`overrideWhat (${overrideWhat}) must be between 1 and ${totalDigs}`);
    }
    if (overrideDigit < 0 || overrideDigit > 9) {
        throw new Error('overrideDigit must be between 0 and 9');
    }

    const digits: number[] = Array.from({length: totalDigs}, () =>
        Math.floor(Math.random() * 10)
    );

    // Prevent leading zero if n > 1
    if (totalDigs > 1 && digits[0] === 0) {
        digits[0] = Math.floor(Math.random() * 9) + 1;
    }

    // Override m-th (1‑based index)
    digits[overrideWhat - 1] = overrideDigit;

    return parseInt(digits.join(''), 10);
}

const max_attempts = 100; // jsut in case

function generateBogusAnswers(
    originalNumber: number,
    answer: number,
    unit: Unit
): number[] {
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
        return attempt;
    }

    const offByOne = genWithRetry(() => answer + (unit * (randomBoolean() ? -1 : 1)));
    const offByBitMore = genWithRetry(() => answer + (unit * randomIntUpTo(5) * (randomBoolean() ? -1 : 1)));
    const offByByLot = genWithRetry(() => answer + (unit * randomIntUpTo(15) * (randomBoolean() ? -1 : 1)));

    return [offByOne, offByBitMore, offByByLot];
}

type Operation = 'multiply' | 'divide';


export function makeQuestionBank(toMake: number, difficulty: Difficulty): Question[] {

    return Array.from({length: toMake}, (_) => {
        const unit = weightedSample(difficultyToMultiplier[difficulty]);


        const unitDigits = Math.log(unit) / Math.log(10) + 1;
        const digits = unitDigits + weightedSample(msbOffsetDist)

        let num = randomWithOverride(digits, digits - unitDigits + 2, weightedSample(unitDigitDist));
        if (num < unit) {
            // avoid "what is 7 to the nearest 100"
            num += unit
        }

        const scheme = weightedSample(schemeDist);
        const answer = roundToUnit(num, unit, scheme);
        const unitToNearestStr = randomBoolean() ? `${unit}` : unitToBlurb[unit];

        const multichoice = weightedSample(MULTI_CHOICE_DIST[difficulty]);

        const operation: Operation = randomBoolean() ? 'multiply' : 'divide';
        switch (operation) {
            case 'multiply':
                return {
                    question: `multiply ${num} by ${roundingSchemeBlurb[scheme]} `,
                    explain: [`${num} x ${roundingSchemeBlurb[scheme]} is ${answer.toLocaleString('en-US')}`],
                    answer: answer,
                    answers: multichoice ? shuffle([...generateBogusAnswers(num, answer, unit), answer]) : [],
                    questionDifficulty: difficulty,
                    answerFormat: multichoice ? undefined : 'DecimalInput',
                };
            case 'divide':
                return {
                    question: `round ${num} ${roundingSchemeBlurb[scheme]} ${unitToNearestStr}`,
                    explain: [`${num} rounded ${roundingSchemeBlurb[scheme]} ${unitToNearestStr} is ${answer.toLocaleString('en-US')}`],
                    answer: answer,
                    answers: multichoice ? shuffle([...generateBogusAnswers(num, answer, unit), answer]) : [],
                    questionDifficulty: difficulty,
                    answerFormat: multichoice ? undefined : 'DecimalInput',
                };
        }


    });

}



