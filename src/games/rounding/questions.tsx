import {Difficulty, Question} from "../../common/QuestionCardSeries";
import {randomBoolean, shuffle, weightedSample, WeightingProfile} from "../../common/probability";


type Unit = 10 | 100 | 1000;

const difficultyToRoundingNumber: Record<Difficulty, WeightingProfile<Unit>> = {
    Easy: [
        {value: 10, weight: 80},
        {value: 100, weight: 20},
        {value: 1000, weight: 0}
    ],
    Medium: [
        {value: 10, weight: 15},
        {value: 100, weight: 70},
        {value: 1000, weight: 15}
    ],
    Hard: [
        {value: 10, weight: 0},
        {value: 100, weight: 20},
        {value: 1000, weight: 80}
    ],
}

const unitToBlurb: Record<Unit, string> = {
    10: 'ten',
    100: 'hundred',
    1000: 'thousand',
}


/*const roundingPowerOffset: WeightingProfile<number> = [
    {value: -1, weight: 20},
    {value: 0, weight: 30},
    {value: 1, weight: 30},
    {value: 2, weight: 20}
];*/

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


export function makeRoundingQuestionBank(toMake: number, difficulty: Difficulty): Question[] {

    return Array.from({length: toMake}, (_) => {
        const toNearest = weightedSample(difficultyToRoundingNumber[difficulty]);
        const scheme = weightedSample(schemeDist);

        const num = 1212; //TODO: pick number, and bias towards 5's
        const answer = roundToUnit(num, toNearest, scheme);

        const toNearestStr = randomBoolean() ? `${toNearest}` : unitToBlurb[toNearest];

        const multichoice = randomBoolean();

        return {
            question: `round ${num} ${roundingSchemeBlurb[scheme]} ${toNearestStr}`,
            explain: [`${num} rounded ${roundingSchemeBlurb[scheme]} ${toNearestStr} is ${answer}`],
            answer: answer,
            answers: multichoice ? shuffle([1, 2, 3, answer]) : [],
            questionDifficulty: difficulty,
            answerFormat: multichoice ? undefined : 'DecimalInput',
        };
    });

}