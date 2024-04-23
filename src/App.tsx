import React from 'react';
import './App.css';
import {Main} from "./page/Main";
import {NextUIProvider} from "@nextui-org/react";

export const App = () => {
    return (
        <div className="App">
            <NextUIProvider>
                <Main/>
            </NextUIProvider>
        </div>
    );
}

