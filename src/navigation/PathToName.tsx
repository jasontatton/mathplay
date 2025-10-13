const paths = ['/',
    '/mathplay',
    '/placeValue/placeValueMaze',
    '/romanNumerals/romanNumerals',
    '/romanNumerals/romanNumerals/stages',
    '/romanNumerals/romanNumerals/highscore',
    '/rounding/rounding',
    '/enlgish/y4readingList',
    '/links/mathLinks',
    '/funStuff/threeBody'
] as const;

export type Path = typeof paths[number];


export const PathToName: Record<Path, string> = {
    '/': 'Games',
    '/mathplay': 'Games',
    '/placeValue/placeValueMaze': 'Place Value Maze',
    '/romanNumerals/romanNumerals': 'Roman Numerals',
    '/romanNumerals/romanNumerals/stages': 'Stages',
    '/romanNumerals/romanNumerals/highscore': 'Highscore',
    '/rounding/rounding': 'Rounding',
    '/enlgish/y4readingList': 'Y4 Reading List',
    '/links/mathLinks': 'Math Links',
    '/funStuff/threeBody': 'Three Body Simulator',
};


