import React, {useCallback, useState} from 'react';
import {DecimalKeypad, Keypad} from "../../utils/Keypad";
import {Route, Routes} from "react-router-dom";
import {ButtonPanel} from "../../navigation/ButtonPanel";
import wip from "../../assets/wip.webp";
import {Button, Card, Layout, Modal, Progress, Radio, Space, Typography} from "antd";
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
    {id: 1, name: "Bronze Trophy", earned: false},
    {id: 2, name: "Silver Trophy", earned: false},
    {id: 3, name: "Gold Trophy", earned: false},
];

export default function App() {
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
                <Card title="Your Trophies" bordered={false}>
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

            <Modal
                title={`Play ${currentLevel} level`}
                open={isLevelModalVisible}
                onCancel={() => setIsLevelModalVisible(false)}
                footer={[
                    <Button onClick={() => setIsLevelModalVisible(false)}>Cancel</Button>,
                    <Button type="primary" onClick={handleCompleteLevel}>
                        Complete Level
                    </Button>
                ]}
            >
                {/* For simplicity, questions aren't implemented here */}
                <p>Here you would show questions for the "{currentLevel}" difficulty.</p>
                <p>Quiz content could vary based on difficulty.</p>
                <Radio.Group>
                    <Radio value={1}>Answer 1</Radio>
                    <Radio value={2}>Answer 2</Radio>
                    <Radio value={3}>Answer 3</Radio>
                </Radio.Group>
            </Modal>
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

const QUESTIOB_PER_ROUND = 5;
const PASS_MARK = 90; // A*

export function Stages() {

    const questionProvider = useCallback(() => {
        return makeRNQuestionBank(QUESTIOB_PER_ROUND, 'Easy');
    }, []);

    const questionSeries = useQuestionCardSeries('Stage', QUESTIOB_PER_ROUND, PASS_MARK, questionProvider, 'Easy');

    return (
        <div style={{padding: 5}}>
            {questionSeries.GameRound()}
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