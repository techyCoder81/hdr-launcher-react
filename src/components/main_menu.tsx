import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";
import { LogWindow } from './log_window';
import ReactDOM from 'react-dom';
import { Options } from './options';
import { DirTree } from '../responses';

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
                                                "https://github.com/HDR-Development/HDR-Nightlies/releases/download/v0.19.10/CHANGELOG.md", 
                                                sdroot + "downloads/CHANGELOG.md")
                                        .then((message) => console.info(message))
                                        //.then(() => this.backend.getMd5(sdroot + "downloads/to-beta.zip"))
                                        //.then((hash) => console.log("md5: " + hash))
                                        //.then(() => this.backend.fileExists(sdroot + "downloads/to-beta.zip"))
                                        //.then(result => console.log("file exist: " + result))
                                        //.then(() => this.backend.listDirAll(sdroot + "ultimate/mods/hdr"))
                                        //.then(result => {console.info(JSON.stringify(result.toList(sdroot + "ultimate/mods/hdr", [])));})
                                        //.then(() => this.backend.unzip(sdroot + "downloads/to-beta.zip", sdroot + "downloads"))
                                        .then(() => this.backend.getJson("https://api.github.com/repos/HDR-Development/HDR-Nightlies/releases?per_page=10"))
                                        .then(result => console.info(result[0].url))
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
