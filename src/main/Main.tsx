import React from 'react';
import {Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import {Button, Layout} from 'antd';
import plMaze from "../assets/plMaze.jpg";
import books from "../assets/books.webp";
import rnImg from "../assets/romanNumerals.jpg";
import PlaceValueMaze from "../games/placeValue/placeValueMaze";
import {HighScore, RomanNumerals, RomanNumeralStages} from "../games/romanNumerals/romanNumerals";
import {Content, Footer, Header} from "antd/es/layout/layout";
import {Breadcrumbs} from "../navigation/Breadcrumbs";
import {ButtonPanel} from "../navigation/ButtonPanel";
import Y4ReadingList from "../games/english/y4readingList";

export const Home: React.FC = () => {
    return <>
        <h2>Maths</h2>
        <ButtonPanel pButtons={
            [
                {route: '/placeValue/placeValueMaze', image: plMaze},
                {route: '/romanNumerals/romanNumerals', image: rnImg},
            ]
        }/>
        <h2>English</h2>
        <ButtonPanel pButtons={
            [
                {route: '/enlgish/y4readingList', image: books},
            ]
        }/>
    </>
}

const Main: React.FC = () => {
    const buildVersion = process.env.REACT_APP_BUILD_VERSION || "dev.";
    const navigate = useNavigate();
    const location = useLocation();
    const atRoot = location.pathname === '/' || location.pathname === '/mathplay';
    return (
        <Layout style={{minHeight: '100vh'}}>
            <Header style={{display: 'flex', alignItems: 'center'}}>
                <div style={{color: '#fff', fontSize: '18px', fontWeight: 'bold', marginRight: 'auto'}}>
                    Math Play
                </div>

                {!atRoot && <Button
                    type="primary"
                    onClick={() => navigate('/mathplay')}
                >
                    Games Home
                </Button>}

            </Header>

            <Breadcrumbs/>
            <Content style={{padding: '10px'}}>
                <div style={{background: '#fff', padding: 2, minHeight: 360}}>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/mathplay" element={<Home/>}/>
                        <Route path="/placeValue/placeValueMaze" element={<PlaceValueMaze/>}/>
                        <Route path="/romanNumerals/romanNumerals" element={<RomanNumerals/>}/>
                        <Route path="/romanNumerals/romanNumerals/stages" element={<RomanNumeralStages/>}/>
                        <Route path="/romanNumerals/romanNumerals/highscore" element={<HighScore/>}/>
                        <Route path="/enlgish/y4readingList" element={<Y4ReadingList/>}/>
                    </Routes>
                </div>
            </Content>

            <Footer style={{
                fontSize: "0.8rem",
                color: "#666",
                marginTop: "1rem",
                marginRight: ".1em",
                textAlign: "right"
            }}>Build: {buildVersion}</Footer>
        </Layout>
    );
};

export default Main;