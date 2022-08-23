import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";
import { LogWindow } from './log_window';
import ReactDOM from 'react-dom';
import { Options } from './options';

/**
 * main menu implementation
 */
export class MainMenu {
    backend: Backend;

    constructor(backend: Backend) {
        this.backend = backend;
    }

    render() {
        return (
        <div className="main-menu">
                <div className="left-side">
                        <button className="main-buttons" onClick={() => this.backend.play()}>
                                <div>Play&nbsp;&nbsp;</div>
                        </button>
                        <button className="main-buttons" onClick={() => 
                                this.backend.getSdRoot()
                                        .then((value) => console.info("SD root is " + value))
                                        .catch((e) => console.error(e))
                        }>
                                <div>Ping&nbsp;&nbsp;</div>
                        </button>
                        <button className="main-buttons" onClick={() => ReactDOM.render(new Options(this.backend).render(), document.getElementById("root"))}>
                                <div>Options&nbsp;&nbsp;</div>
                        </button>
                        <button className="main-buttons" onClick={() => this.backend.quit()}>
                                <div>Exit&nbsp;&nbsp;</div>
                        </button>
                </div>    
                <div className="right-side">
                        <LogWindow/>
                </div>
        </div>
        );
    }
}
