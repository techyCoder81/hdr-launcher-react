import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";
import { LogWindow } from './log_window';
import MainMenu from './main_menu';
import ReactDOM from 'react-dom';

/**
 * options menu implementation
 */
 export default class Options extends React.Component {

    render() {
        var backend = Backend.instance();
        return (
        <div id="options">
            <div className="main-menu">
                <h1>Options</h1>
                <button className="main-buttons" onClick={() => backend.openModManager()}>
                    <div>Mod Manager&nbsp;&nbsp;</div>
                </button>
                <button className="main-buttons" onClick={() => ReactDOM.render(<MainMenu/>, document.getElementById("left-side"))}>
                    <div>Back&nbsp;&nbsp;</div>
                </button>
            </div>
        </div>
        );
    }
}