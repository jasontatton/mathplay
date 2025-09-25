export function romanToDecimal(roman: string): number | null {
    if (!roman) return null;
    const romanValues: Record<string, number> = {
        I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
    };
    const pattern = /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
    if (!pattern.test(roman.toUpperCase())) return null;

    let sum = 0;
    const chars = roman.toUpperCase().split("");
    for (let i = 0; i < chars.length; i++) {
        const currentVal = romanValues[chars[i]];
        const nextVal = romanValues[chars[i + 1]] || 0;
        if (currentVal < nextVal) sum -= currentVal;
        else sum += currentVal;
    }
    return sum;
}

export function decimalToRoman(num: number): string | null {
    if (num <= 0 || num >= 4000) return null;
    const map: [number, string][] = [
        [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
        [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
        [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
    ];
    let result = "";
    for (const [val, sym] of map) {
        while (num >= val) {
            result += sym;
            num -= val;
        }
    }
    return result;
}