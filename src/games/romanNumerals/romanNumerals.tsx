import React, {useCallback, useState} from 'react';
import {Route, Routes} from "react-router-dom";
import {ButtonPanel} from "../../navigation/ButtonPanel";
import wip from "../../assets/wip.webp";
import {Button, Card, Layout, Progress, Space, Typography} from "antd";
import "antd/dist/reset.css";
import {TrophyOutlined} from "@ant-design/icons";
import {useQuestionCardSeries} from "../../common/QuestionCardSeries";
import {makeRNQuestionBank} from "./utils/questions";

const {Header, Content} = Layout;
const {Title, Text} = Typography;


type Difficulty = "easy" | "medium" | "hard";

interface Trophy {
    id: number;
    name: string;
    earned: boolean;
}

const initialTrophies: Trophy[] = [
    {id: 1, name: "Easy Trophy", earned: false},
    {id: 2, name: "Easy Trophy", earned: false},
    {id: 3, name: "Easy Trophy", earned: false},
    {id: 4, name: "Medium Trophy", earned: false},
    {id: 5, name: "Medium Trophy", earned: false},
    {id: 6, name: "Medium Trophy", earned: false},
    {id: 7, name: "Hard Trophy", earned: false},
    {id: 8, name: "Hard Trophy", earned: false},
    {id: 9, name: "Hard Trophy", earned: false},
];

export function App() {
    const [trophies, setTrophies] = useState<Trophy[]>(initialTrophies);
    const [currentLevel, setCurrentLevel] = useState<Difficulty>("easy");
    const [isLevelModalVisible, setIsLevelModalVisible] = useState(false);

    const earnedCount = trophies.filter(t => t.earned).length;
    const totalCount = trophies.length;
    const progressPercent = Math.round((earnedCount / totalCount) * 100);

    const handleCompleteLevel = () => {
        // Mark trophy for current level as earned
        let trophyIndex = currentLevel === "easy" ? 0 : currentLevel === "medium" ? 1 : 2;
        const newTrophies = trophies.map((t, idx) =>
            idx === trophyIndex ? {...t, earned: true} : t
        );
        setTrophies(newTrophies);

        // Unlock next level
        if (currentLevel === "easy") setCurrentLevel("medium");
        else if (currentLevel === "medium") setCurrentLevel("hard");
        // If hard, game finished
        setIsLevelModalVisible(false);
    };

    return (
        <Layout style={{minHeight: "100vh"}}>
            <Header style={{background: "#001529", padding: "10px"}}>
                <Title style={{color: "white", margin: 0}} level={3}>
                    Trophy Game
                </Title>
            </Header>
            <Content style={{padding: "20px"}}>
                <Card title="Progression" bordered={false}>
                    <Space style={{marginBottom: 20}}>
                        {trophies.map(t => (
                            <div key={t.id} style={{textAlign: "center"}}>
                                <TrophyOutlined
                                    style={{
                                        fontSize: "32px",
                                        color: t.earned ? "#fadb14" : "#ccc",
                                        marginBottom: 4
                                    }}
                                />
                                <div>{t.name}</div>
                            </div>
                        ))}
                    </Space>
                    <Progress percent={progressPercent}/>
                    <Text>
                        {earnedCount} / {totalCount} trophies earned
                    </Text>
                </Card>

                <Card title="Play Game" style={{marginTop: 20}}>
                    <Text>Current Difficulty Level: <b>{currentLevel}</b></Text>
                    <br/>
                    <Button
                        type="primary"
                        style={{marginTop: 10}}
                        onClick={() => setIsLevelModalVisible(true)}
                    >
                        Start Level
                    </Button>
                </Card>
            </Content>

        </Layout>
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

const QUESTIONS_PER_ROUND = 5;
const PASS_MARK = 90; // A*

export function Stages() {

    const questionProvider = useCallback(() => {
        return makeRNQuestionBank(QUESTIONS_PER_ROUND, 'Easy');
    }, []);

    const questionSeries = useQuestionCardSeries('Stage', QUESTIONS_PER_ROUND, PASS_MARK, questionProvider, 'Easy');


    return (
        <div style={{padding: 5}}>
            {questionSeries.GameRound()}
        </div>
    );
}

export function HighScore() {
    return (
        <div style={{padding: 5}}>
            highscore
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