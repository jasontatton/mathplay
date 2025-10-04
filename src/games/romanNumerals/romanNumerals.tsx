import React, {useCallback} from 'react';
import {Route, Routes} from "react-router-dom";
import {ButtonPanel} from "../../navigation/ButtonPanel";
import "antd/dist/reset.css";
import {makeRNQuestionBank} from "./utils/questions";
import {QUESTIONS_PER_ROUND, Stages} from "../../common/Stages";
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

    const questionProvider = useCallback(() => {
        return makeRNQuestionBank(QUESTIONS_PER_ROUND, 'Easy');
    }, []);


    return <Stages name='Romwn Numerals' questionProvider={questionProvider}/>;
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