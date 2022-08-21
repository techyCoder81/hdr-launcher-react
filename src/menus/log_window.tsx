import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";

const add_to_box = (message?: any) => {
    try {
        var box = document.getElementById("log-box");
        if (box != null) {
            box.innerHTML += "<p>LOG: " + JSON.stringify(message) + "</p>"
        } else {
            console.error("log box was null!");
        }
    } catch (e) {
        // yikes
    }
}

/**
 * log window implementation
 */
export class LogWindow extends React.Component {

    constructor(props: {} | Readonly<{}>) {

        super(props);
        const old_log = console.log;
        console.log = (message?: any, ...optionalParams: any[]) => {
            add_to_box(message);
            old_log(message);
        };

        const old_info = console.info;
        console.info = (message?: any, ...optionalParams: any[]) => {
            add_to_box(message);
            old_info(message);
        };

        const old_error = console.error;
        console.error = (message?: any, ...optionalParams: any[]) => {
            add_to_box(message);
            old_error(message);
        };

        const old_warn = console.warn;
        console.warn = (message?: any, ...optionalParams: any[]) => {
            add_to_box(message);
            old_warn(message);
        };

        const old_trace = console.trace;
        console.trace = (message?: any, ...optionalParams: any[]) => {
            add_to_box(message);
            old_trace(message);
        };

        const old_debug = console.debug;
        console.debug = (message?: any, ...optionalParams: any[]) => {
            add_to_box(message);
            old_debug(message);
        };
    }

    render() {
        return (
        <div className="scroll-box" id="log-box">
            
        </div>
        );
    }
}
