import React from 'react';
import {Route, Routes} from "react-router-dom";
import {ButtonPanel} from "../../navigation/ButtonPanel";
import "antd/dist/reset.css";
import {makeRNQuestionBank} from "./utils/questions";
import {Stages} from "../../common/Stages";
import rnImg from "../../assets/romanNumerals.jpg";


const RomanNumeralsHome: React.FC = () => {
    return <ButtonPanel pButtons={
        [
            {route: "/romanNumerals/romanNumerals/stages", image: rnImg},
            {route: "/romanNumerals/romanNumerals/highscore", image: rnImg},
        ]
    }/>;
}


export function RomanNumeralStages() {
    return <Stages name='Roman Numerals' questionProvider={makeRNQuestionBank}/>;
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