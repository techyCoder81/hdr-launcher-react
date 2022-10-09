import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";

/**
 * header implementation
 */
 function HeaderInner(props: { version: string}) {
    return (
    <div id="header" className='header'>
        <h1 id="title" className='header-item'>HDR {Backend.platformName()} Launcher</h1>
        <h1 id="version" className='header-item'>Version: {props.version}</h1>
    </div>
    );
}

export const Header = React.memo(HeaderInner);