import React from 'react';
import {Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import {Button, Col, Image, Layout, Row} from 'antd';

import rnImg from "../assets/romanNumerals.jpg";
import plMaze from "../assets/plMaze.jpg";
import PlaceValueMaze from "../games/placeValue/placeValueMaze";
import RomanNumerals from "../games/romanNumerals/romanNumerals";
import {Content, Footer, Header} from "antd/es/layout/layout";

const Home: React.FC = () => {
    const navigate = useNavigate();

    const buttons = [
        {label: 'Place Value Maze', image: plMaze, route: '/placeValue/placeValueMaze'},
        {label: 'Roman Numerals', image: rnImg, route: '/romanNumerals/romanNumerals'},
    ];

    return (
        <Row gutter={[16, 16]} justify="center">
            {buttons.map((btn, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                    <Button
                        type="primary"
                        style={{
                            width: '100%',
                            height: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onClick={() => navigate(btn.route)}
                    >
                        <Image
                            src={btn.image}
                            preview={false}
                            style={{width: 80, height: 80, marginBottom: 8}}
                        />
                        {btn.label}
                    </Button>
                </Col>
            ))}
        </Row>
    );
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
                    More Games
                </Button>}

            </Header>

            <Content style={{padding: '10px'}}>
                <div style={{background: '#fff', padding: 2, minHeight: 360}}>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/mathplay" element={<Home/>}/>
                        <Route path="/placeValue/placeValueMaze" element={<PlaceValueMaze/>}/>
                        <Route path="/romanNumerals/romanNumerals" element={<RomanNumerals/>}/>
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