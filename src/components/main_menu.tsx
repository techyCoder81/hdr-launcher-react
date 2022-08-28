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
                        <button className="main-buttons" onClick={async () => {
                                var sdroot = "";
                                await this.backend.getSdRoot()
                                        .then(value => {sdroot = value;})
                                        .catch(e => {console.error("Could not get SD root. " + e);return;});

                                await this.backend.downloadFile(
                                                "https://github.com/HDR-Development/HDR-Nightlies/releases/download/v0.19.4/CHANGELOG.md", 
                                                sdroot + "CHANGELOG.md")
                                        .then((message) => console.info(message))
                                        .then(() => this.backend.getMd5(sdroot + "CHANGELOG.md"))
                                        .then((hash) => console.log("md5: " + hash))
                                        .then(() => this.backend.fileExists(sdroot + "CHANGELOG.md"))
                                        .then(result => console.log("file exist: " + result))
                                        .then(() => this.backend.listDir(sdroot + "ultimate"))
                                        .then(list => {
                                                list.list.forEach(entry => console.log("path: " + entry.path + ", type: " + entry.kind));
                                        })
                                        .catch((e) => console.error(e))
                                }
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
