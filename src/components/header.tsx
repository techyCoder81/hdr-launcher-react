import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";

/**
 * header implementation
 */
 export default class Header extends React.Component {

    state = {
        version: "unknown",
        installed: "unknown",
        platform: "",
    };

    componentDidMount() {
        var backend = Backend.instance();
        backend.getPlatform().then(value => {
            this.state.platform = value;
            this.setState(this.state);
        });
        backend.isInstalled().then(installed => {
            this.state.installed = String(installed);
            this.setState(this.state);
        }).catch(e => {
            console.error(e);
        });
        backend.getVersion().then(version => {
            this.state.version = version;
            this.setState(this.state);
        }).catch(e => {
            console.error(e);
        });
    }

    render() {
        return (
        <div id="header" className='header'>
            <h1 id="title" className='header-item'>HDR {this.state.platform} Launcher</h1>
            <h1 id="installed" className='header-item'>Installed: {this.state.installed}</h1>
            <h1 id="version" className='header-item'>Version: {this.state.version}</h1>
        </div>
        );
    }
}