import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";
import { LogWindow } from './log_window';
import { MainMenu } from './main_menu';
import ReactDOM from 'react-dom';

/**
 * options menu implementation
 */
export class Options {
    backend: Backend;

    constructor(backend: Backend) {
        this.backend = backend;
    }

    render() {
        return (
        <div id="options">
            <h1>Options</h1>
            <div className="left-side">
                <button className="main-buttons" onClick={() => this.backend.openModManager()}>
                    <div>Mod Manager&nbsp;&nbsp;</div>
                </button>
                <button className="main-buttons" onClick={() => ReactDOM.render(new MainMenu(this.backend).render(), document.getElementById("root"))}>
                    <div>Back&nbsp;&nbsp;</div>
                </button>
            </div>
            <div className="right-side">
                <LogWindow/>
            </div> 
        </div>
        );
    }
}