import React from 'react';
import {Route, Routes} from "react-router-dom";
import {ButtonPanel} from "../../navigation/ButtonPanel";
import "antd/dist/reset.css";
import {Stages} from "../../common/Stages";
import x10Img from "../../assets/10x.webp";
import {makeQuestionBankMaker} from "./x10/questions";


const CalculationsHome: React.FC = () => {
    return <ButtonPanel pButtons={
        [
            {route: "/calculations/calculations/10s", image: x10Img},
            {route: "/calculations/calculations/10sNoDecimal", image: x10Img},
        ]
    }/>;
}


export function Calculations10Stages() {
    return <Stages name='10s' questionProvider={makeQuestionBankMaker(true)}/>;
}

export function Calculations10StagesNoDecimal() {
    return <Stages name='10sNoDecimals' questionProvider={makeQuestionBankMaker(false)}/>;
}


export const Calculations: React.FC = () => {
    return (
        <div style={{padding: 5}}>
            <Routes>
                <Route path="/" element={<CalculationsHome/>}/>
            </Routes>
        </div>
    );
};