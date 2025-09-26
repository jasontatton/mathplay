import React from 'react';
import RomanKeypad from "./romanKeypad";
import {Route, Routes} from "react-router-dom";
import PlaceValueMaze from "../placeValue/placeValueMaze";
import {ButtonPanel} from "../../main/ButtonPanel";
import wip from "../../assets/wip.webp";


const RomanNumeralsHome: React.FC = () => {
    return <ButtonPanel pButtons={
        [
            {route: "/romanNumerals/romanNumerals/stages", image: wip},
            {route: "/romanNumerals/romanNumerals/highscore", image: wip},
        ]
    }/>
}


const RomanNumerals: React.FC = () => {
    return (
        <div style={{padding: 5}}>
            <RomanKeypad/>

            <Routes>
                <Route path="/" element={<RomanNumeralsHome/>}/>
                <Route path="/placeValue/placeValueMaze" element={<PlaceValueMaze/>}/>
                <Route path="/romanNumerals/romanNumerals" element={<RomanNumerals/>}/>
            </Routes>
        </div>
    );
};


export default RomanNumerals;