import React from 'react';
import './index.css';
import Main from './main/Main';

import {createRoot} from 'react-dom/client'
import {BrowserRouter} from "react-router-dom";

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Main/>
    </BrowserRouter>
)

