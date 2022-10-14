import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";

/**
 * header implementation
 */
 function HeaderInner(props: { version: string}) {
    return (
    <div id="header" className='header'>
        <p id="title" className='header-item'>HDR {Backend.platformName()} Launcher</p>
        <p id="version" className='header-item'>Version: {props.version}</p>
    </div>
    );
}

export const Header = React.memo(HeaderInner);