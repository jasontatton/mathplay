import React, {useEffect, useRef, useState} from "react";
import "./placeValueMaze.css";

const START = "🚀";
const END = "🏁";

function useNewGameAutoStarter(newGameAction) {
    const START_TIME = 3;
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false); // NEW: controls timer state
    const timerRef = useRef(null);

    // Countdown effect
    useEffect(() => {
        if (isRunning && secondsLeft > 0) {
            timerRef.current = setInterval(() => {
                setSecondsLeft((prev) => prev - 1);
            }, 1000);
        }

        if (secondsLeft === 0 && isRunning) {
            newGameAction();
            setIsRunning(false); // stop running after finish
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, secondsLeft, newGameAction]);

    // start timer
    const triggerAutoStart = () => {
        if (secondsLeft === 0) {
            setSecondsLeft(START_TIME); // restart from beginning if needed
        }
        setIsRunning(true);
    };

    return {triggerAutoStart, secondsLeft, isRunning}
}

function usePositiveNegativeToggle() {
    const [isPositive, setIsPositive] = useState(true); // start positive

    const toggle = () => {
        setIsPositive((prev) => !prev);
    };

    const Button = () => {
        return <button
            onClick={toggle}
            style={{
                padding: "10px 20px",
                fontSize: "1.2rem",
                cursor: "pointer",
                borderRadius: "8px",
                border: "none",
                color: "#fff",
                backgroundColor: isPositive ? "green" : "red",
                transition: "background-color 0.3s",
            }}
        >
            {isPositive ? "up" : "down"}
        </button>;
    }

    return {isPositive, Button};
}

function shortcut(path) {
    // any paths touching the cells around the final point?
    const end = path[path.length - 1];
    const forbidden = [end, {row: end.row - 1, col: end.col}, {row: end.row + 1, col: end.col}, {
        row: end.row,
        col: end.col + 1
    }, {row: end.row, col: end.col - 1}]

    for (let i = 0; i < path.length - 2; i++) {
        if (forbidden.some(f => {
                return f.row === path[i].row && f.col === path[i].col;
            }
        )) {
            return true;
        }
    }

    return false;
}


function PlaceValueMaze() {
    const n = 10;
    const [theIncrement, setTheIncrement] = useState(100);
    const [pathLimitPercent, setPathLimitPercent] = useState(15);
    const [grid, setGrid] = useState([]);
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);
    const [path, setPath] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [mistakes, setMistakes] = useState([]);

    const upDown = usePositiveNegativeToggle();

    const gameAutoStarter = useNewGameAutoStarter(() => generateGame())

    const [isTouchDevice, setIsTouchDevice] = useState(false);
    useEffect(() => {
        // Detect if touch is supported
        const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        setIsTouchDevice(hasTouch);
    }, []);

    // Keep some margin so size isn't exactly screen width
    const availableWidth = window.innerWidth - 40;
    const availableHeight = window.innerHeight - 200;
    let cellSize = Math.min(availableWidth / n, availableHeight / n, 50);
    cellSize = Math.floor(cellSize);

    useEffect(() => {
        generateGame();
    }, [n, theIncrement, pathLimitPercent, upDown.isPositive]);

    const increment = theIncrement * (upDown.isPositive ? 1 : -1);

    const generateGame = () => {
        const totalCells = n * n;
        const limit = Math.floor((pathLimitPercent / 100) * totalCells);

        // Empty grid
        let nums = Array.from({length: n}, () => Array(n).fill(null));

        let path;
        let cnt = 0
        do {
            // Random starting point and starting value
            let startRow = Math.floor(Math.random() * n);
            let startCol = Math.floor(Math.random() * n);
            const basis = Math.pow(10, Math.floor(Math.log10(Math.abs(increment))) + 1) * (Math.floor(Math.random() * 9) + 1);
            const startingPlaceValueShift = Math.pow(10, Math.floor(Math.log10(Math.abs(increment))) + 1)
            let startVal = Math.floor(Math.random() * startingPlaceValueShift) + basis;

            // ---- STEP 1: Build path with strictly increasing values ----
            path = [{row: startRow, col: startCol, val: startVal}];

            while (path.length < limit) {
                let last = path[path.length - 1];
                let possibleMoves = [
                    {r: last.row - 1, c: last.col},
                    {r: last.row + 1, c: last.col},
                    {r: last.row, c: last.col - 1},
                    {r: last.row, c: last.col + 1},
                ].filter(
                    pos =>
                        pos.r >= 0 &&
                        pos.c >= 0 &&
                        pos.r < n &&
                        pos.c < n &&
                        !path.find(cell => cell.row === pos.r && cell.col === pos.c)
                );

                if (possibleMoves.length === 0) break;

                // Randomly choose NEXT step
                let nextPos = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                let nextVal = last.val + increment;
                path.push({row: nextPos.r, col: nextPos.c, val: nextVal});
            }
            if (++cnt > 100) {
                // prevent inf loop when path size impossibly small
                break;
            }

        } while ((Math.abs(path[path.length - 1].row - path[0].row) +
                Math.abs(path[path.length - 1].col - path[0].col) < 5)
            || shortcut(path)
            );

        // Place the path numbers in the grid
        path.forEach(cell => {
            nums[cell.row][cell.col] = cell.val;
        });

        // ---- STEP 2: Fill the rest without making alternative valid steps ----
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (nums[i][j] === null) {
                    // Default decoy near nearby path number
                    let nearby = path.reduce((near, c) => {
                        let dist = Math.abs(c.row - i) + Math.abs(c.col - j);
                        if (dist < near.dist) return {dist, val: c.val};
                        return near;
                    }, {dist: Infinity, val: null});

                    let candidate = 0;
                    let safe = false;

                    while (!safe) {
                        candidate = nearby.val + Math.floor(Math.random() * (increment * 2 + 1)) - increment;

                        // Check this candidate doesn't give an extra move on path cells
                        safe = true;
                        [
                            {r: i - 1, c: j},
                            {r: i + 1, c: j},
                            {r: i, c: j - 1},
                            {r: i, c: j + 1}
                        ].forEach(adj => {
                            if (adj.r >= 0 && adj.r < n && adj.c >= 0 && adj.c < n) {
                                let adjVal = nums[adj.r][adj.c];
                                if (adjVal !== null) {
                                    if (Math.abs(adjVal - candidate) === Math.abs(increment)) {
                                        // If that neighbor is on path and this value would form another valid move, reject candidate
                                        if (path.find(c => c.row === adj.r && c.col === adj.c)) {
                                            safe = false;
                                        }
                                    }
                                }
                            }
                        });
                    }

                    nums[i][j] = candidate;
                }
            }
        }

        setGrid(nums);
        setStart({row: path[0].row, col: path[0].col});
        setEnd({row: path[path.length - 1].row, col: path[path.length - 1].col});
        if (path.length >= 2) {
            setPath([
                {row: path[0].row, col: path[0].col},
                {row: path[1].row, col: path[1].col}
            ]);
        } else {
            setPath([{row: path[0].row, col: path[0].col}]);
        }
        setGameOver(false);
        setMistakes([]);
    };

    const onCellClick = (row, col) => {


        // If player clicks on a cell already in the path:
        const existingIndex = path.findIndex(p => p.row === row && p.col === col);
        if (existingIndex >= 0) {
            // Truncate path to this position (even during play)
            setPath(path.slice(0, Math.max(2, existingIndex + (existingIndex >= path.length - 1 ? 0 : 1))));
            setGameOver(false);
            setMistakes([]);
            return;
        }

        if (gameOver) return; // no new moves unless clicking an existing path cell

        // Only allow adjacent moves
        let last = path[path.length - 1];
        let isAdjacent = Math.abs(last.row - row) + Math.abs(last.col - col) === 1;
        if (!isAdjacent) return;

        // Append cell to path
        let newPath = [...path, {row, col}];
        setPath(newPath);

        // If this is the end cell, check win
        if (row === end.row && col === end.col) {
            setGameOver(true);

            // Check for mistakes
            let mistakesArr = [];
            for (let i = 1; i < newPath.length; i++) {
                let prev = grid[newPath[i - 1].row][newPath[i - 1].col];
                let curr = grid[newPath[i].row][newPath[i].col];
                if (Math.abs(curr - prev) !== Math.abs(increment)) {
                    mistakesArr.push(i);
                }
            }
            setMistakes(mistakesArr);
        }
    };

    if (gameOver && mistakes.length === 0 && !gameAutoStarter.isRunning) {
        gameAutoStarter.triggerAutoStart();
        // restart game in a few seconds
    }

    const ngs = '🎮 New Game' + (gameAutoStarter.secondsLeft > 0 ? ` in ${gameAutoStarter.secondsLeft} seconds` : '');

    return (
        <div className="PlaceValueMaze">
            <h4>Start at {START} and move {upDown.isPositive ? 'up' : 'down'} increments of {theIncrement} to {END}</h4>

            <div className="controls">
                <label>
                    Increment:
                    {upDown.Button()}
                </label>
                <label>
                    Steps:
                    <input
                        type="number"
                        value={theIncrement}
                        onChange={e => setTheIncrement(Math.max(1, parseInt(e.target.value)))}
                    />
                </label>
                <label>
                    % Path Size:
                    <input
                        type="number"
                        value={pathLimitPercent}
                        onChange={e => setPathLimitPercent(parseInt(e.target.value))}
                    />
                </label>
                <button className="new-game-btn" onClick={generateGame} disabled={gameAutoStarter.secondsLeft > 0}>
                    {ngs}
                </button>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${n}, ${cellSize}px)`,
                    gap: "1px", // smaller gaps for phones
                    justifyContent: "center"
                }}
            >
                {grid.map((rowArr, row) =>
                    rowArr.map((val, col) => {
                        const isStart = start && row === start.row && col === start.col;
                        const isEnd = end && row === end.row && col === end.col;
                        const inPathIndex = path.findIndex(p => p.row === row && p.col === col);
                        const isMistake = mistakes.includes(inPathIndex);

                        let cellBg;
                        if (inPathIndex >= 0) {
                            if (gameOver && mistakes.length === 0) {
                                cellBg = "#a8e6a2"; // green
                            } else if (isMistake) {
                                cellBg = "orange";
                            } else {
                                cellBg = "#cce5ff";
                            }
                        } else {
                            cellBg = "#f1f3f5";
                        }

                        const displayContent = isStart ? START : isEnd ? END : val;

                        let fontSize;
                        if (isStart || isEnd) {
                            fontSize = cellSize * 0.5; // icons
                        } else {
                            const length = String(val).length;
                            const baseSize = cellSize * 0.35;
                            fontSize = length > 3 ? baseSize * (3 / length) : baseSize;
                        }

                        const handleClick = () => {
                            onCellClick(row, col);
                        };

                        return (
                            <div
                                key={`${row}-${col}`}
                                {...(isTouchDevice
                                    ? {onTouchStart: handleClick}
                                    : {onClick: handleClick})}
                                style={{
                                    width: cellSize,
                                    height: cellSize,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: `${fontSize}px`,
                                    backgroundColor: cellBg,
                                    border: "1px solid #999",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    userSelect: "none"
                                }}
                            >
                                {displayContent}
                            </div>
                        );
                    })
                )}
            </div>

            {gameOver && mistakes.length === 0 &&
                <h4>✅ You did it, great job! New game in: {gameAutoStarter.secondsLeft} seconds</h4>}
            {gameOver && mistakes.length > 0 && (
                <h4>⚠️ Mistakes found — click earlier point to fix.</h4>
            )}

        </div>
    );
}

export default PlaceValueMaze;