import React, {useCallback, useState} from "react";

import {ReloadOutlined, StepBackwardOutlined} from "@ant-design/icons";
import {Button, Card, Progress, Select, Space, Typography} from "antd";
import "antd/dist/reset.css";
import {useDecimalKeypad, useRomanKeypad} from "../utils/Keypad";

const {Title, Text} = Typography;

export type Question = {
    question: string;
    explain: string[];
    answer: number | string;
    answers: number[] | string[];
    questionDifficulty: Difficulty;
    answerFormat?: AnswerFormat;
};


export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type AnswerFormat = 'DecimalInput' | 'RomanNumeralInput' | 'RomanNumeralInputWithHint';

export function useQuestionCardSeries(origin: string, totalQuestions: number, passMark: number, questionProvider: (toMake: number, difficulty: Difficulty) => Question[], initialDifficulty: Difficulty | undefined) {
    const [questions, setQuestions] = useState<Question[]>(() => {
        if (initialDifficulty !== undefined) {
            return questionProvider(totalQuestions, initialDifficulty);
        }
        return [];
    });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState<number | string | null>(null);
    const [score, setScore] = useState(0);
    const [showFinalScreen, setShowFinalScreen] = useState(false);
    const [finished, setFinished] = useState(true);
    const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty || 'Easy');
    const [started, setStarted] = useState(false);
    const currentQuestion = questions[currentIndex];

    const handleSelect = useCallback((opt: number | string) => {
        keypads.forEach(x => x.disable());
        setSelected(opt);
        // eslint-disable-next-line eqeqeq
        if (opt == currentQuestion.answer) {
            setScore((prev) => prev + 1);
        }
    }, [currentQuestion]);

    const decimalKeypad = useDecimalKeypad(handleSelect);
    const romanKeypad = useRomanKeypad(handleSelect, false);
    const romanKeypadWithHint = useRomanKeypad(handleSelect, true);

    const keypads = [decimalKeypad, romanKeypad, romanKeypadWithHint];


    const restartGameCallback = useCallback((difficulty: Difficulty | undefined) => {
        if (difficulty !== undefined) {
            setDifficulty(difficulty);
            setQuestions(questionProvider(totalQuestions, difficulty));
        } else {
            setQuestions([]);
        }

        setCurrentIndex(0);
        setScore(0);
        setShowFinalScreen(false);
        setFinished(false);
        setSelected(null);
        setStarted(false);
    }, []);


    const handleNext = () => {
        keypads.forEach(key => key.handleReset());
        if ((currentIndex + 1) > questions.length) {
            // we need more questions...
            setQuestions((prev) => [...prev, ...questionProvider(1, difficulty)]);
        }

        setSelected(null);
        if (currentIndex + 1 < totalQuestions) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setShowFinalScreen(true);
        }
    };

    let showKeypad = <div/>;
    if (currentQuestion.answerFormat !== undefined) {
        switch (currentQuestion.answerFormat) {
            case "DecimalInput":
                showKeypad = decimalKeypad.Pad();
                break;
            case "RomanNumeralInputWithHint":
                showKeypad = romanKeypadWithHint.Pad();
                break;
            case "RomanNumeralInput":
                showKeypad = romanKeypad.Pad();
                break;
        }
    }

    const GameRound = (onLevelPass: () => void) => {
        if (initialDifficulty === undefined && !started) {
            return (
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "top",
                        padding: 16,
                        background: "#f0f2f5"
                    }}
                >
                    <Card style={{width: "100%", maxWidth: 800}} bodyStyle={{padding: 16}}>
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
                            <Button type="primary" block onClick={() => {

                                setQuestions(questionProvider(totalQuestions, difficulty))
                                setStarted(true);

                            }}>
                                Start Game
                            </Button>
                        </Space>
                    </Card>
                </div>
            );
        }

        // game card

        const markPct = (score / totalQuestions * 100.);
        const victoryText = `Your score: ${score} / ${totalQuestions} (That's ${markPct.toFixed(0)}%) ${markPct >= passMark ? 'Stage complete!' : ` - pass mark is ${passMark}% or above, try again!`}`;

        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "top",
                    padding: 16,
                    background: "#f0f2f5"
                }}
            >
                <Card style={{width: "100%", maxWidth: 800}} bodyStyle={{padding: 16}}>
                    {!showFinalScreen ? (
                        <Space direction="vertical" style={{width: "100%"}} size="large">
                            <Progress
                                percent={Math.round((currentIndex / totalQuestions) * 100)}
                                size="small"
                                showInfo={false}
                            />
                            <Title level={4}>
                                [{currentQuestion.questionDifficulty}] Question {currentIndex + 1} of {totalQuestions}
                            </Title>
                            <Text>{currentQuestion.question}</Text>

                            {currentQuestion.answers.length > 0 ? (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, 1fr)",
                                        gap: 8
                                    }}
                                >
                                    {currentQuestion.answers.map((opt, idx) => {
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
                            ) : showKeypad}


                            <div style={{minHeight: 140, paddingTop: 8}}>
                                {selected !== null && (
                                    <>
                                        {/* eslint-disable-next-line eqeqeq */}
                                        {selected == currentQuestion.answer ? (
                                            <Text type="success">✅ Correct!</Text>
                                        ) : (
                                            <Text type="danger">
                                                ❌ Wrong — the correct answer is {currentQuestion.answer}
                                            </Text>
                                        )}
                                        <Button type="primary" block onClick={handleNext}>
                                            {currentIndex + 1 === totalQuestions ? "Finish" : "Next"}
                                        </Button>

                                        <Card size="small" style={{backgroundColor: "#fafafa"}}>
                                            <Text>
                                                Explanation: <br/>
                                                {currentQuestion.explain.map((line, index) => (
                                                    <React.Fragment key={index}>
                                                        {line}
                                                        <br/>
                                                    </React.Fragment>
                                                ))}
                                            </Text>
                                        </Card>
                                    </>
                                )}
                            </div>
                        </Space>
                    ) : (
                        <Space direction="vertical" style={{width: "100%"}} size="large">
                            <Title level={3}>All {origin} questions answered!</Title>
                            <Text>{victoryText}</Text>
                            <Button disabled={score === totalQuestions} type="primary" block
                                    onClick={() => restartGameCallback(difficulty)}
                                    icon={<ReloadOutlined/>}>
                                Try Again
                            </Button>
                            <Button type="primary" block onClick={() => {
                                if (score === totalQuestions) {
                                    onLevelPass();
                                }
                                restartGameCallback(difficulty);
                                setFinished(true);
                            }} icon={<StepBackwardOutlined/>}>
                                Back
                            </Button>
                        </Space>
                    )}
                </Card>
            </div>
        );
    };

    return {finished, restartGameCallback, GameRound};
}
