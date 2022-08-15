import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";

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
            <h1 className="header">HDR Ryujinx Launcher</h1>
            <button className="main-buttons" onClick={() => this.backend.send(new Messages.Play())}>
                    <div>Play the Game!&nbsp;&nbsp;</div>
            </button>
            <button className="main-buttons" onClick={() => this.backend.invoke(new Messages.Ping("do update!"))}>
                    <div>Update&nbsp;&nbsp;</div>
            </button>
            <button className="main-buttons" onClick={() => this.backend.invoke(new Messages.Ping("do verify!"))}>
                    <div>Verify Install&nbsp;&nbsp;</div>
            </button>
            <button className="main-buttons" onClick={() => this.backend.invoke(new Messages.Ping("do options!"))}>
                    <div>Options&nbsp;&nbsp;</div>
            </button>
            <button className="main-buttons" onClick={() => this.backend.send(new Messages.Exit())}>
                    <div>Exit&nbsp;&nbsp;</div>
            </button>
        </div>
        );
    }
}
