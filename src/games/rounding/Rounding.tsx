import {Stages} from "../../common/Stages";
import React from "react";
import {makeRoundingQuestionBank} from "./questions";

export function Rounding() {
    return <Stages name='Rounding' questionProvider={makeRoundingQuestionBank}/>;
}