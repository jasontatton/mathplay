const paths = ["/",
    "/mathplay",
    "/placeValue/placeValueMaze",
    "/romanNumerals/romanNumerals",
    "/romanNumerals/romanNumerals/stages",
    "/romanNumerals/romanNumerals/highscore"] as const;

export type Path = typeof paths[number];


export const PathToName: Record<Path, string> = {
    "/": "Games",
    "/mathplay": "Games",
    "/placeValue/placeValueMaze": "Place Value Maze",
    "/romanNumerals/romanNumerals": "Roman Numerals",
    "/romanNumerals/romanNumerals/stages": "Stages",
    "/romanNumerals/romanNumerals/highscore": "Highscore",
};


