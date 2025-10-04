import React, {useState} from "react";
import {Difficulty, Question, useQuestionCardSeries} from "./QuestionCardSeries";
import {Card, Col, Layout, Progress, Row, Typography} from "antd";
import {LockOutlined, TrophyOutlined} from "@ant-design/icons";
import useLocalStorageState from "use-local-storage-state";
import ConfirmButton from "./ConfirmationButton";

const {Header, Content} = Layout;
const {Title, Text} = Typography;


export const QUESTIONS_PER_ROUND = 5;
export const PASS_MARK = 90; // A*


interface Trophy {
    difficulty: Difficulty;
    earned: boolean;
    isNext: boolean;
}

const initialTrophies: Trophy[][] = [[
    {difficulty: "Easy", earned: false, isNext: true},
    {difficulty: "Easy", earned: false, isNext: false},
    {difficulty: "Easy", earned: false, isNext: false},],
    [
        {difficulty: "Medium", earned: false, isNext: false},
        {difficulty: "Medium", earned: false, isNext: false},
        {difficulty: "Medium", earned: false, isNext: false},],
    [
        {difficulty: "Hard", earned: false, isNext: false},
        {difficulty: "Hard", earned: false, isNext: false},
        {difficulty: "Hard", earned: false, isNext: false},]
];


export function useTrophyPanel(name: string) {
    const [trophies, setTrophies] = useLocalStorageState<Trophy[][]>(`useTrophyPanel-${name}`, {
        defaultValue: initialTrophies,
    });

    function resetTrophies() {
        setTrophies(initialTrophies);
    }

    const rowCount = initialTrophies.length;
    const colsCount = initialTrophies[0].length;


    // Flatten matrix to find next unearned trophy
    const flatTrophies = trophies.flat();
    const earnedCount = flatTrophies.filter((t) => t.earned).length;

    const earnNextTrophy = () => {
        console.log('earn next');

        const nextIndex = flatTrophies.findIndex((t) => !t.earned);
        if (nextIndex === -1) return; // all earned

        const newTrophies = trophies.map((row) => row.map((t) => ({...t})));

        const rowIndex = Math.floor(nextIndex / colsCount);
        const colIndex = nextIndex % colsCount;
        newTrophies[rowIndex][colIndex].earned = true;
        newTrophies[rowIndex][colIndex].isNext = false;

        const toIsNext = nextIndex + 1;
        if (toIsNext < flatTrophies.length) {
            const rowIndex = Math.floor(toIsNext / colsCount);
            const colIndex = toIsNext % colsCount;
            newTrophies[rowIndex][colIndex].isNext = true;
        }

        setTrophies(newTrophies);
    };

    const Panel = () => {
        return <Card
            title={`${name} 🏆 Stages`}
            bordered
            style={{maxWidth: 500, margin: "20px auto"}}
        >
            {trophies.map((row, rowIndex) => (
                <Row gutter={[12, 12]} key={rowIndex}>
                    {row.map((trophy, id) => (
                        <Col span={8} key={rowIndex + 1 * id}>
                            <Card
                                size="small"
                                hoverable
                                onClick={trophy.isNext ? earnNextTrophy : undefined}
                                style={{
                                    textAlign: "center",
                                    backgroundColor: trophy.earned ? "#fffbe6" : "#f0f0f0",
                                    borderColor: trophy.earned ? "#faad14" : "#d9d9d9",
                                }}
                            >
                                {trophy.earned ? (
                                    <TrophyOutlined style={{fontSize: 36, color: "#faad14"}}/>
                                ) : (

                                    trophy.isNext ?
                                        <TrophyOutlined style={{fontSize: 36, color: "#aaa"}}/>
                                        : <LockOutlined style={{fontSize: 36, color: "#aaa"}}/>
                                )}
                                <div style={{marginTop: 8}}>{trophy.difficulty}</div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ))}

            <div style={{marginTop: 20, textAlign: "center"}}>
                <Progress
                    percent={(earnedCount / (rowCount * colsCount)) * 100}
                    showInfo={false}
                    strokeColor="#faad14"
                />
                <p>
                    {earnedCount} / {rowCount * colsCount} trophies earned
                </p>
            </div>
            <div style={{marginTop: 20, textAlign: "right"}}>
                <ConfirmButton label='Reset Trophies' onConfirm={resetTrophies}/>
            </div>
        </Card>;
    };

    return {Panel};
}


type StagesProps = {
    name: string;
    questionProvider: () => Question[];
};

export function Stages({name, questionProvider}: StagesProps) {
    const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
    const trophyPanel = useTrophyPanel(name);

    const questionSeries = useQuestionCardSeries('Stage', QUESTIONS_PER_ROUND, PASS_MARK, questionProvider, 'Easy');
    
    return (
        <div style={{padding: 5}}>
            {questionSeries.finished ? trophyPanel.Panel() : questionSeries.GameRound()}
        </div>
    );
}