import React from 'react';
import {DecimalKeypad, Keypad} from "../../utils/Keypad";
import {Route, Routes} from "react-router-dom";
import {ButtonPanel} from "../../navigation/ButtonPanel";
import wip from "../../assets/wip.webp";


const RomanNumeralsHome: React.FC = () => {
    return <ButtonPanel pButtons={
        [
            {route: "/romanNumerals/romanNumerals/stages", image: wip},
            {route: "/romanNumerals/romanNumerals/highscore", image: wip},
        ]
    }/>;
}

export function HighScore() {
    return (
        <div style={{padding: 5}}>
            hi
        </div>
    );
}

export const RomanNumerals: React.FC = () => {
    return (
        <div style={{padding: 5}}>
            <Keypad/>
            <DecimalKeypad/>
            <Routes>
                <Route path="/" element={<RomanNumeralsHome/>}/>
            </Routes>
        </div>
    );
};


export default RomanNumerals;