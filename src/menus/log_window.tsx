import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";

/**
 * log window implementation
 */
export class LogWindow extends React.Component {
    static selected: string = "LOG";

    add_to_log(level: string, message: string) {
        var box = document.getElementById("log-box");
        if (box == null) {
            return;
        }
        var selector = document.getElementById("loglevels");
        // if the selector was not found, or the selected level is higher 
        // than the given log, dont add to the logs window.
        if (selector == null 
            || LogWindow.LOG_LEVELS.indexOf(level) < LogWindow.LOG_LEVELS.indexOf(LogWindow.selected)) {
            return;
        }
        box.innerHTML += "<p>" + level + ": " + message;
        box.scrollTop = box.scrollHeight;
    }

    constructor(props: {} | Readonly<{}>) {
        super(props);
        var old_log = console.log;
        console.log = (...data) => {
            try {
                old_log(...data);
            } catch (e) {}
            data.forEach(item => this.add_to_log("LOG", item));
        }
        var old_info = console.info;
        console.info = (...data) => {
            try {
                old_info(...data);
            } catch (e) {}
            data.forEach(item => this.add_to_log("INFO", item));
        }
        var old_warn = console.warn;
        console.warn = (...data) => {
            try {
                old_warn(...data);
            } catch (e) {}
            data.forEach(item => this.add_to_log("WARNING", item));
        }
        var old_error = console.error;
        console.error = (...data) => {
            try {
                old_error(...data);
            } catch (e) {}
            data.forEach(item => this.add_to_log("ERROR", item));
        }
        var old_trace = console.trace;
        console.trace = (...data) => {
            try {
                old_trace(...data);
            } catch (e) {}
            data.forEach(item => this.add_to_log("TRACE", item));
        }
    }

    static LOG_LEVELS = [
        "LOG",
        "INFO",
        "WARNING",
        "ERROR",
        "TRACE"
    ]

    updateSelected(item: { target: { value: any; }; }) {
        LogWindow.selected = item.target.value;
    }

    render() {
        return (
        <div>
            <label htmlFor="loglevels">Log level:</label>
            <select name="loglevels" id="loglevels" onChange={this.updateSelected}>
                {
                LogWindow.LOG_LEVELS.map((level) => <option value={level} key={level}>{level}</option>)
                } 
            </select>
            <div className="scroll-box" id="log-box"></div>
        </div>
        );
    }
}
