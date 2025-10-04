import React from 'react';
import {Route, Routes} from "react-router-dom";
import {ButtonPanel} from "../../navigation/ButtonPanel";
import "antd/dist/reset.css";
import {makeRNQuestionBank} from "./utils/questions";
import {PASS_MARK, QUESTIONS_PER_ROUND, Stages} from "../../common/Stages";
import rnImg from "../../assets/romanNumerals.jpg";
import {useQuestionCardSeries} from "../../common/QuestionCardSeries";


const RomanNumeralsHome: React.FC = () => {
    return <ButtonPanel pButtons={
        [
            {route: "/romanNumerals/romanNumerals/stages", image: rnImg},
            //{route: "/romanNumerals/romanNumerals/highscore", image: rnImg},
        ]
    }/>;
}


export function RomanNumeralStages() {
    return <Stages name='Roman Numerals' questionProvider={makeRNQuestionBank}/>;
}

export function HighScore() {
    const questionSeries = useQuestionCardSeries('Stage', QUESTIONS_PER_ROUND * 2, PASS_MARK, makeRNQuestionBank, undefined);
    return (
        <div style={{padding: 5}}>
            {questionSeries.GameRound(() => {
            })}
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