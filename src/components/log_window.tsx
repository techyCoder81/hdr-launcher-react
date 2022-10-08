import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";

/**
 * log window implementation
 */
export class LogWindow extends React.Component {
    /** the selected log level */
    static selected: string = "INFO";

    /** whether the console logging functions have been redirected yet */
    static logRedirected: boolean = false;

    /** 
     * adds the given message with the given level
     * to the log div.
     */
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

    /** constructor */
    constructor(props: {} | Readonly<{}>) {
        super(props);
        this.redirectLogs();
    }

    /**
     * redirects the console.log, console.error, console.info, etc
     * to the log window, if it hasnt already been done.
     */
    redirectLogs() {
        if (LogWindow.logRedirected) {
            return;
        }
        var old_debug = console.debug;
        console.debug = (...data) => {
            try {
                old_debug(...data);
            } catch (e) {}
            data.forEach(item => this.add_to_log("DEBUG", item));
        }
        var old_log = console.log;
        console.log = (...data) => {
            try {
                old_log(...data);
            } catch (e) {}
            data.forEach(item => this.add_to_log("INFO", item));
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
        LogWindow.logRedirected = true;
    }

    /**
     * the list of log levels
     * TODO: make this an enum instead.
     */
    static LOG_LEVELS = [
        "DEBUG",
        "INFO",
        "WARNING",
        "ERROR",
        "TRACE"
    ]

    render() {
        function getOption(level: string) {
            if (level == LogWindow.selected) {
                return <option value={level} key={level} selected>{level}</option>
            } else {
                return <option value={level} key={level}>{level}</option>
            }
        }

        return ( 
            <div className='log-box'>
                <select className='simple-button inline' name="loglevels" id="loglevels" onChange={
                    (item: { target: { value: any; }; }) => {
                        LogWindow.selected = item.target.value;
                    }}> 
                    {
                    LogWindow.LOG_LEVELS.map((level) => getOption(level))
                    } 
                </select>
                <button className='simple-button inline' onClick={() => {
                    var box = document.getElementById("log-box");
                    if (box != null) {
                        box.innerHTML = "";
                    }
                }}>&nbsp;Clear Logs&nbsp;</button> 
                <div className="log-box" id="log-box"></div>
            </div>
        );
    }
}
