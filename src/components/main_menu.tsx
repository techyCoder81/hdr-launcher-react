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
                                var backend = this.backend;
                                await this.backend.getSdRoot()
                                        .then(value => {sdroot = value;})
                                        .catch(e => {console.error("Could not get SD root. " + e);return;});

                                let downloads = sdroot + "downloads/"
                                let version = "unknown";
                                await backend.getVersion().then(ver => {
                                        version = ver;
                                        console.debug("version is: " + ver);
                                });

                                let version_stripped = version.split("-")[0];
                                let hash_file = downloads + "content_hashes.txt";
                                await backend.downloadFile("https://github.com/HDR-Development/HDR-Nightlies/releases/download/" + version_stripped + "/content_hashes.txt", hash_file);
                                await backend.readFile(hash_file).then(str => console.info(str));

                        }}>
                                <div>Verify&nbsp;&nbsp;</div>
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
