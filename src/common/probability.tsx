import {Difficulty} from "./QuestionCardSeries";

export function randomBoolean(pctTrue?: number): boolean {
    return Math.random() < (pctTrue === undefined ? 0.5 : (pctTrue / 100.));
}

export type WeightingProfile<T> = { value: T; weight: number }[];

export function weightedSample<T>(items: WeightingProfile<T>): T {
    // Weights are assumed to summ to 100 (%)

    const r = Math.random() * 100; // random point in 0..100
    let cumulative = 0;

    for (const item of items) {
        cumulative += item.weight;
        if (r < cumulative) {
            return item.value;
        }
    }
    return items[items.length - 1].value;
}

export function sampleIntRange(a: number, b: number): number {
    const min = Math.ceil(Math.min(a, b));
    const max = Math.floor(Math.max(a, b));
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function roundUpToNearest10(num: number): number {
    return Math.ceil(num / 10) * 10;
}


export function shuffle<T>(array: T[]): T[] {
    return array
        .map(item => ({sortKey: Math.random(), value: item}))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(item => item.value);
}

export function randomUpToYPercentOff(answer: number, pct: number, minPctOff?: number): number {
    const min = answer * (1. + ((minPctOff || 100) / 100.));
    const max = answer * (1. + (pct / 100.));
    return Math.floor(Math.random() * (max - min + 1) + min) * (randomBoolean() ? -1 : 1);
}

export function randomIntUpTo(x: number): number {
    return Math.floor(Math.random() * x) + 1;
}

export const MULTI_CHOICE_DIST: Record<Difficulty, WeightingProfile<Boolean>> = {
    Easy: [
        {value: true, weight: 80},
        {value: false, weight: 20},
    ],
    Medium: [
        {value: true, weight: 50},
        {value: false, weight: 50},
    ],
    Hard: [
        {value: true, weight: 20},
        {value: false, weight: 80},
    ],
};


export function niceRound(x: number) {
    const factor = 10 ** 4;
    return Math.round(x * factor) / factor;
}