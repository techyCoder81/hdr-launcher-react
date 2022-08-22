import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";

/**
 * header implementation
 */
export class Header {
    backend: Backend;

    constructor(backend: Backend) {
        this.backend = backend;
        this.backend.getPlatform().then(value => {
            var title = document.getElementById("title");
            if (title!=null) {
                    title.innerHTML = "HDR " + value + " Launcher";
            }
        });
        backend.isInstalled().then(version => {
            var versionText = document.getElementById("installed");
            if (versionText != null) {
                versionText.innerHTML = "Installed : " + version;
            }
        }).catch(e => {
            console.error(e);
        });
    }

    render() {
        return (
        <div id="header">
            <h1 id="title">HDR Launcher</h1>
            <h1 id="installed">Installed: Unknown</h1>
        </div>
        );
    }
}