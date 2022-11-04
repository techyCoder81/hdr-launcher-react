import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";

/**
 * header implementation
 */
 function HeaderInner(props: { version: string, submenu: string[] }) {
    return (
    <div id="header" className='header'>
        <p id="title" className='header-item'>HDR {Backend.platformName()} Launcher {(props.submenu.length > 0) ? (" > " + props.submenu.join('>')) : ''}</p>
        <p id="version" className='header-right'>Version: {props.version}</p>
    </div>
    );
}

export const Header = React.memo(HeaderInner);