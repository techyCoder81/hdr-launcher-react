import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";
import { LogWindow } from './log_window';

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
                        <h1 className="header">HDR Launcher</h1>
                        <button className="main-buttons" onClick={() => this.backend.send(new Messages.Play())}>
                                <div>Play&nbsp;&nbsp;</div>
                        </button>
                        <button className="main-buttons" onClick={() => {
                                        this.backend.invoke(new Messages.Ping("do update!"))
                                                .then(response => console.log("ping was responded with: " + JSON.stringify(response)))
                                                .catch(rejection => console.error("Ping was rejected! Reason: " + JSON.stringify(rejection)));}}>
                                <div>Update&nbsp;&nbsp;</div>
                        </button>
                        <button className="main-buttons" onClick={() => this.backend.send(new Messages.Exit())}>
                                <div>Exit&nbsp;&nbsp;</div>
                        </button>
                </div>    
                <div className="right-side">
                        {/*<LogWindow/>*/}
                </div>
        </div>
        );
    }
}
