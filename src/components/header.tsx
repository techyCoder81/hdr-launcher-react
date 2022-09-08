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
        backend.isInstalled().then(installed => {
            var installedText = document.getElementById("installed");
            if (installedText != null) {
                installedText.innerHTML = "Installed : " + String(installed);
            }
        }).catch(e => {
            console.error(e);
        });
        backend.getVersion().then(version => {
            var versionText = document.getElementById("version");
            if (versionText != null) {
                versionText.innerHTML = "Version : " + String(version);
            }
        }).catch(e => {
            console.error(e);
        });
    }

    render() {
        return (
        <div id="header" className='header'>
            <h1 id="title" className='header-item'>HDR Launcher</h1>
            <h1 id="installed" className='header-item'>Installed: Unknown</h1>
            <h1 id="version" className='header-item'>Version: Unknown</h1>
        </div>
        );
    }
}