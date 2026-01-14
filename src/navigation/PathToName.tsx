const paths = ["/",
    "/mathplay",
    "/placeValue/placeValueMaze",
    "/romanNumerals/romanNumerals",
    "/romanNumerals/romanNumerals/stages",
    "/romanNumerals/romanNumerals/highscore",
    "/rounding/rounding",
    "/enlgish/y4readingList",
    "/links/mathLinks",
    "/calculations/calculations",
    "/calculations/calculations/10s",
    "/calculations/calculations/10sNoDecimal",
    '/funStuff/threeBody'
] as const;

export type Path = typeof paths[number];


export const PathToName: Record<Path, string> = {
    "/": "Games",
    "/mathplay": "Games",
    "/placeValue/placeValueMaze": "Place Value Maze",
    "/romanNumerals/romanNumerals": "Roman Numerals",
    "/romanNumerals/romanNumerals/stages": "Stages",
    "/romanNumerals/romanNumerals/highscore": "Highscore",
    "/rounding/rounding": "Rounding",
    "/enlgish/y4readingList": "Y4 Reading List",
    "/links/mathLinks": "Math Links",
    "/calculations/calculations": "Calculations",
    "/calculations/calculations/10s": "Multiply and Divide by 10's (with decimal questions)",
    "/calculations/calculations/10sNoDecimal": "Multiply and Divide by 10's (no decimals)",
    '/funStuff/threeBody': 'Three Body Simulator',
};


