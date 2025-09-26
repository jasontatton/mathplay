import React from 'react';
import {Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import {Button, Layout} from 'antd';

import rnImg from "../assets/romanNumerals.jpg";
import plMaze from "../assets/plMaze.jpg";
import PlaceValueMaze from "../games/placeValue/placeValueMaze";
import RomanNumerals from "../games/romanNumerals/romanNumerals";
import {Content, Footer, Header} from "antd/es/layout/layout";
import {Breadcrumbs} from "./Breadcrumbs";
import {ButtonPanel} from "./ButtonPanel";

export const Home: React.FC = () => {
    return <ButtonPanel pButtons={
        [
            {route: '/placeValue/placeValueMaze', image: plMaze},
            {route: '/romanNumerals/romanNumerals', image: rnImg},
        ]
    }/>
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