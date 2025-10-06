export function randomBoolean(): boolean {
    return Math.random() < 0.5;
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

export function shuffle<T>(array: T[]): T[] {
    return array
        .map(item => ({sortKey: Math.random(), value: item}))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(item => item.value);
}