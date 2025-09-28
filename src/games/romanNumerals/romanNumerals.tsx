import React, {useState} from 'react';
import {DecimalKeypad, Keypad} from "../../utils/Keypad";
import {Route, Routes} from "react-router-dom";
import {ButtonPanel} from "../../navigation/ButtonPanel";
import wip from "../../assets/wip.webp";
import {Button, Card, Progress, Select, Space, Typography} from "antd";
import "antd/dist/reset.css";

const {Title, Text} = Typography;

type Difficulty = "easy" | "medium" | "hard";

type Question = {
    question: string;
    a: number;
    b: number;
    options: number[];
    answer: number;
};

const generateQuestions = (count: number, difficulty: Difficulty): Question[] => {
    let rangeMin = 1;
    let rangeMax = 10;

    if (difficulty === "medium") {
        rangeMax = 20;
    } else if (difficulty === "hard") {
        rangeMin = 10;
        rangeMax = 50;
    }

    const qs: Question[] = [];
    for (let i = 0; i < count; i++) {
        const a = Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;
        const b = Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;
        const correct = a + b;

        const options = new Set<number>();
        options.add(correct);
        while (options.size < 4) {
            options.add(correct + Math.floor(Math.random() * 10) - 5);
        }
        const shuffled = Array.from(options).sort(() => Math.random() - 0.5);

        qs.push({
            question: `${a} + ${b} = ?`,
            a,
            b,
            options: shuffled,
            answer: correct
        });
    }
    return qs;
};

function App() {
    const totalQuestions = 20;
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [difficulty, setDifficulty] = useState<Difficulty>("easy");
    const [started, setStarted] = useState(false);

    const startGame = () => {
        setQuestions(generateQuestions(totalQuestions, difficulty));
        setCurrentIndex(0);
        setScore(0);
        setFinished(false);
        setSelected(null);
        setShowExplanation(false);
        setStarted(true);
    };

    const currentQuestion = questions[currentIndex];

    const handleSelect = (opt: number) => {
        setSelected(opt);
        if (opt === currentQuestion.answer) {
            setScore((prev) => prev + 1);
            setShowExplanation(false);
        } else {
            setShowExplanation(true);
        }
    };

    const handleNext = () => {
        setSelected(null);
        setShowExplanation(false);
        if (currentIndex + 1 < totalQuestions) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setFinished(true);
        }
    };

    const handleRestart = () => {
        setStarted(false);
    };

    if (!started) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 16,
                    background: "#f0f2f5"
                }}
            >
                <Card style={{width: "100%", maxWidth: 400}} bodyStyle={{padding: 16}}>
                    <Space direction="vertical" style={{width: "100%"}} size="large">
                        <Title level={3}>Choose Difficulty</Title>
                        <Select
                            value={difficulty}
                            onChange={(value) => setDifficulty(value as Difficulty)}
                            style={{width: "100%"}}
                        >
                            <Select.Option value="easy">Easy (1 - 10)</Select.Option>
                            <Select.Option value="medium">Medium (1 - 20)</Select.Option>
                            <Select.Option value="hard">Hard (10 - 50)</Select.Option>
                        </Select>
                        <Button type="primary" block onClick={startGame}>
                            Start Game
                        </Button>
                    </Space>
                </Card>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 16,
                background: "#f0f2f5"
            }}
        >
            <Card style={{width: "100%", maxWidth: 400}} bodyStyle={{padding: 16}}>
                {!finished ? (
                    <Space direction="vertical" style={{width: "100%"}} size="large">
                        <Progress
                            percent={Math.round((currentIndex / totalQuestions) * 100)}
                            size="small"
                            showInfo={false}
                        />
                        <Title level={4}>
                            Question {currentIndex + 1} of {totalQuestions}
                        </Title>
                        <Text>{currentQuestion.question}</Text>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: 8
                            }}
                        >
                            {currentQuestion.options.map((opt, idx) => {
                                let style = {};
                                if (selected !== null) {
                                    if (opt === currentQuestion.answer) {
                                        style = {backgroundColor: "#52c41a", color: "white"}; // green correct
                                    }
                                    if (opt === selected && opt !== currentQuestion.answer) {
                                        style = {backgroundColor: "#ff4d4f", color: "white"}; // red wrong
                                    }
                                }

                                return (
                                    <Button
                                        key={idx}
                                        block
                                        style={{height: 60, fontSize: 18, ...style}}
                                        disabled={selected !== null}
                                        onClick={() => handleSelect(opt)}
                                    >
                                        {opt}
                                    </Button>
                                );
                            })}
                        </div>

                        {selected !== null && (
                            <>
                                {selected === currentQuestion.answer ? (
                                    <Text type="success">✅ Correct!</Text>
                                ) : (
                                    <Text type="danger">
                                        ❌ Wrong — the correct answer is {currentQuestion.answer}
                                    </Text>
                                )}

                                {(showExplanation || selected === currentQuestion.answer) && (
                                    <Button block onClick={() => setShowExplanation((prev) => !prev)}>
                                        {showExplanation ? "Hide Explanation" : "Show Explanation"}
                                    </Button>
                                )}

                                {showExplanation && (
                                    <Card size="small" style={{backgroundColor: "#fafafa"}}>
                                        <Text>
                                            Explanation: {currentQuestion.a} + {currentQuestion.b} = {currentQuestion.answer}
                                        </Text>
                                    </Card>
                                )}

                                <Button type="primary" block onClick={handleNext}>
                                    {currentIndex + 1 === totalQuestions ? "Finish" : "Next"}
                                </Button>
                            </>
                        )}
                    </Space>
                ) : (
                    <Space direction="vertical" style={{width: "100%"}} size="large">
                        <Title level={3}>Quiz Finished!</Title>
                        <Text>Your score: {score} / {totalQuestions}</Text>
                        <Button type="primary" block onClick={handleRestart}>
                            Play Again
                        </Button>
                    </Space>
                )}
            </Card>
        </div>
    );
}


const RomanNumeralsHome: React.FC = () => {
    return <ButtonPanel pButtons={
        [
            {route: "/romanNumerals/romanNumerals/stages", image: wip},
            {route: "/romanNumerals/romanNumerals/highscore", image: wip},
        ]
    }/>;
}

export function Stages() {

    return (
        <div style={{padding: 5}}>
            <Keypad/>
            <App/>
            <DecimalKeypad/>
        </div>
    );
}

export function HighScore() {
    return (
        <div style={{padding: 5}}>
            <Keypad/>
            <DecimalKeypad/>
        </div>
    );
}

export const RomanNumerals: React.FC = () => {
    return (
        <div style={{padding: 5}}>
            <Routes>
                <Route path="/" element={<RomanNumeralsHome/>}/>
            </Routes>
        </div>
    );
};


export default RomanNumerals;