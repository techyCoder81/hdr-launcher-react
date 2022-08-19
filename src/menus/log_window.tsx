import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";

const add_to_box = (...text: any[]) => {
    var box = document.getElementById("log-box");
    if (box != null) {
        box.innerHTML += "<p>" + JSON.stringify(text) + "</p>";
    }
}

/**
 * log window implementation
 */
export class LogWindow extends React.Component {

    constructor(props: {} | Readonly<{}>) {

        super(props);
        const old_log = console.log;
        console.log = (...data) => {
            add_to_box(data);
            old_log(data);
        };

        const old_info = console.info;
        console.info = (...data) => {
            add_to_box(data);
            old_info(data);
        };

        const old_error = console.error;
        console.error = (...data) => {
            add_to_box(data);
            old_error(data);
        };

        const old_warn = console.warn;
        console.warn = (...data) => {
            add_to_box(data);
            old_warn(data);
        };

        const old_trace = console.trace;
        console.trace = (...data) => {
            add_to_box(data);
            old_trace(data);
        };

        const old_debug = console.debug;
        console.debug = (...data) => {
            add_to_box(data);
            old_debug(data);
        };
    }

    render() {
        return (
        <div className="scroll-box" id="log-box">
            
        </div>
        );
    }
}
