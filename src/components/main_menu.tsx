import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";
import { LogWindow } from './log_window';
import ReactDOM from 'react-dom';
import Options from './options';
import { DirTree } from '../responses';

/**
 * main menu implementation
 */
 export default class MainMenu extends React.Component {
    
    render() {
        var backend = Backend.instance();
        return (
        <div className="main-menu">
                <button className="main-buttons" onClick={() => backend.play()}>
                        <div>Play&nbsp;&nbsp;</div>
                </button>
                <button className="main-buttons" onClick={
                        async () => {
                                var sdroot = "";
                                await backend.getSdRoot()
                                        .then(value => {sdroot = value;})
                                        .catch(e => {console.error("Could not get SD root. " + e);return;});

                                let latest = await backend.getRequest("https://github.com/HDR-Development/HDR-Nightlies/releases/latest/download/hdr_version.txt")
                                console.info("Latest is " + latest)

                                let downloads = sdroot + "downloads/"
                                let version = "unknown";
                                let version_stripped = "unknown";
                                try {
                                        console.info("attempting to update chain");
                                        while (!(version === latest)) {
                                                await backend.getVersion().then(ver => {
                                                        version = ver;
                                                        version_stripped = version.split("-")[0];
                                                        console.debug("version is: " + ver);
                                                        var versionText = document.getElementById("version");
                                                        if (versionText != null) {
                                                                versionText.innerHTML = "Version : " + String(version);
                                                        }
                                                })
                                                .then(() => backend.downloadFile("https://github.com/HDR-Development/HDR-Nightlies/releases/download/" + version_stripped + "/upgrade.zip", downloads + "upgrade.zip"))
                                                .then(result => console.info("Result:" + result))
                                                .then(() => backend.unzip(downloads + "upgrade.zip", sdroot))
                                                .then(result => console.info(result))
                                                .then(() => backend.getRequest("https://github.com/HDR-Development/HDR-Nightlies/releases/download/" + version_stripped + "/CHANGELOG.md"))
                                                .then(changelog => console.info("Changelog: " + changelog));
                                        }
                                } catch (e) {
                                        console.error("Error while updating: " + e);
                                }
                                        
                        }
                }>
                        <div>Update&nbsp;&nbsp;</div>
                </button>

                <button className="main-buttons" onClick={async () => {
                        var sdroot = "";
                        await backend.getSdRoot()
                                .then(value => {sdroot = value;})
                                .catch(e => {console.error("Could not get SD root. " + e);return;});

                        let downloads = sdroot + "downloads/"
                        let version = "unknown";
                        await backend.getVersion().then(ver => {
                                version = ver;
                                console.debug("version is: " + ver);
                        });

                        let version_stripped = version.split("-")[0];
                        let hash_file = downloads + "content_hashes.json";
                        //await backend.getJson("https://api.github.com/repos/HDR-Development/HDR-Nightlies/releases")
                        //        .then(result => console.info("url: " + result[0].url))
                        //        .catch(e => console.error(e));
                        await backend.downloadFile("https://github.com/HDR-Development/HDR-Nightlies/releases/download/" + version_stripped + "/content_hashes.json", hash_file)
                                .then(result => console.info(result))
                                .catch(e => console.error(e));
                        let matches = true;
                        await backend.readFile(hash_file).then(async str => {
                                let entries = JSON.parse(str);
                                let count = 0;
                                let total = entries.length;
                                if (entries.length === undefined || entries.length == 0) {
                                        throw new Error("Could not get file hashes!");
                                }
                                while (count < total) {
                                        
                                        if (Math.trunc(Math.random() * 100) == 0) {
                                                console.warn(String(Math.trunc(100 * count/entries.length)) + "%");
                                        }
                                        
                                        let path = entries[count].path;
                                        let expected_hash = entries[count].hash;
                                        //console.debug("Checking file " + path + ", with expected hash: " + expected_hash);
                                        await backend.getMd5(sdroot + path).then(hash => {
                                                if (hash != expected_hash) {
                                                        matches = false;
                                                        console.error("hash was wrong for " + path + "\nGot: " + hash + ", Expected: " + expected_hash);
                                                }
                                        }).catch(e => {
                                                matches = false;
                                                console.error("Error while getting hash for path :" + path + "\nError: " + e);
                                        });
                                        count++;
                                }
                                console.info("All files are correct: " + matches);
                        }).catch(e => {
                                console.error("Major error during verify: " + e);
                        });
                        

                }}>
                        <div>Verify&nbsp;&nbsp;</div>
                </button>
                <button className="main-buttons" onClick={() => ReactDOM.render(<Options/>, document.getElementById("left-side"))}>
                        <div>Options&nbsp;&nbsp;</div>
                </button>
                <button className="main-buttons" onClick={() => backend.quit()}>
                        <div>Exit&nbsp;&nbsp;</div>
                </button>
        </div>    
        );
    }
}
