import { Backend } from "./backend";
import { LogListener } from "./log_listener";

class Node {
    public next;
    public previous;
    public entry: LogEntry;
    constructor(next: Node | null, previous: Node | null, entry: LogEntry) {
        this.next = next;
        this.previous = previous;
        this.entry = entry;
    }
}

class LogList {
    public head: Node | null = null;
    public tail: Node | null = null;
    public length = 0;
    append(entry: LogEntry) {
        this.length += 1;
        if (this.head === null || this.tail === null) {
            this.head = new Node(null, null, entry);
            this.tail = this.head;
            return;
        }
        this.tail.next = new Node(null, this.tail, entry);
        this.tail = this.tail.next;
    }
    prepend(entry: LogEntry) {
        this.length += 1;
        if (this.head === null || this.tail === null) {
            this.head = new Node(null, null, entry);
            this.tail = this.head;
            return;
        }
        this.head.previous = new Node(this.head, null, entry);
        this.head = this.head.previous;
    }
    removeHead() {
        if (this.head === null) {
            // it must be empty
            return;
        }
        this.length = this.length - 1;
        if (this.head.next !== null) {
            // make the next node the head
            this.head = this.head.next;
            this.head.previous = null;
        } else {
            // there is only one node, which means we should delete this node
            this.head = null;
            this.tail = null;
        }
    }
    removeTail() {
        if (this.tail === null) {
            // it must be empty
            return;
        }
        this.length = this.length - 1;
        if (this.tail.previous !== null) {
            // make the second to last node the tail
            this.tail = this.tail.previous;
            this.tail.next = null;
        } else {
            // there is only one node, which means we should delete this node
            this.tail = null;
            this.head = null;
        }
    }
}

export type Level = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
    
export class LogEntry {
    public level: Level;
    public data: any;
    public time: Date;
    constructor(level: Level, data: any) {
        this.level = level;
        this.data = data;
        this.time = new Date();
    }
}

/// gets the numeric value of a logging level
export function getValue(level: Level) {
    switch (level) {
        case 'DEBUG':
            return 0;
        case 'INFO':
            return 1;
        case 'WARNING':
            return 2;
        case 'ERROR':
            return 3;
        default:
            return 3;
    }
}

/**
 * singleton for holding logger data
 */
 export class Logs {
    private static singleton: Logs;

    /** the internal structure holding the log data */
    private logs: LogList = new LogList();

    /** the max number of log entries to allow at any
     *  given time. Older entries are removed. */
    private max = 10000;

    /** the current level */
    private level: Level = 'INFO';

    /** 
     * the listeners that wish to be notified when
     * the log data changes.
     */
    private listeners: Set<LogListener> = new Set<LogListener>();

    /**
     * private constructor
     */
    private constructor() { 
        this.redirectLogs();
    }

    /** singleton getter */
    public static instance(): Logs {
        if (!Logs.singleton) {
            Logs.singleton = new Logs();
        }

        return Logs.singleton;
    }

    /**
     * saves the logs to the log file on sd root
     */
    public async save() {
        let backend = Backend.instance()
        let root = await backend.getSdRoot();
        let logPath = root + "hdr_launcher_log.json";
        let exists = await backend.fileExists(logPath);
        if (exists) {
            await backend.deleteFile(logPath);
        }
        await backend.writeFile(logPath, JSON.stringify(Logs.instance().getAll()))
            .then(result => {
                let str = "Logs were written to sd:/hdr_launcher_log.json";
                console.info(str);
                alert(str);
            })
            .catch(e => {
                let err = "Error while saving logs: " + e;
                console.error(err);
                alert(err);
            });
    }

    /**
     * sets the max number of entries. Older entries are removed.
     * @param count the max number of entries
     */
    public setMax(count: number) {
        this.max = count;
    }

    /**
     * sets the current level of the logger
     * @param level the level
     */
    public setLevel(level: Level) {
        this.level = level;
        // invoke the listener
        this.triggerListeners();
    }

    /**
     * gets the current logging level
     * @returns the current level
     */
    public getLevel(): Level {
        return this.level;
    }

    /**
     * this calls back all of the log listeners
     */
    public triggerListeners() {
        this.listeners.forEach(element => {
            if (element === undefined || element === null || element.update === undefined) {
                this.listeners.delete(element);
            } else {
                try {
                    element.update();
                } catch(e) {
                    alert("Error while calling back log listener " + element + " : " + e);
                }
            }
        });
    }

    /**
     * adds the given data to the structure
     * @param level the log level
     * @param data the log data
     */
    public add(level: Level, data: any) {
        // add the data
        if (getValue(level) >= getValue(this.level)) {
            this.logs.prepend(new LogEntry(level, data));

            // limit the size of the logs
            if (this.logs.length > this.max) {
                this.logs.removeTail();
            }

            // invoke the listener
            this.triggerListeners();
        }
    }

    /**
     * register a callback which will be invoked when
     * the log data changes.
     * @param fn the change callback
     */
    public registerChangeCallback(listener: LogListener) {
        this.listeners.add(listener);
    }

    /**
     * unregister a callback
     * @param fn the change callback
     */
     public unregisterChangeCallback(listener: LogListener) {
        this.listeners.delete(listener);
    }

    /**
     * gets all of the log entries in sequence, regardless of level
     */
    public getAll(): LogList {
        return this.logs;
    }

    /** clears the logs */
    public clear() {
        Logs.instance().logs = new LogList();
        this.triggerListeners();
    }

    /**
     * redirects the log output to the singleton
     */
    private redirectLogs() {
        // the first time the log singleton is made, we want 
        // to go ahead and redirect the log output.
        var old_debug = console.debug;
        console.debug = (...data) => {
            try {
                old_debug(...data);
            } catch (e) {}
            data.forEach(item => Logs.instance().add('DEBUG', item));
        }
        var old_log = console.log;
        console.log = (...data) => {
            try {
                old_log(...data);
            } catch (e) {}
            data.forEach(item => Logs.instance().add('INFO', item));
        }
        var old_info = console.info;
        console.info = (...data) => {
            try {
                old_info(...data);
            } catch (e) {}
            data.forEach(item => Logs.instance().add('INFO', item));
        }
        
        var old_warn = console.warn;
        console.warn = (...data) => {
            try {
                old_warn(...data);
            } catch (e) {}
            data.forEach(item => Logs.instance().add('WARNING', item));
        }
        var old_error = console.error;
        console.error = (...data) => {
            try {
                old_error(...data);
            } catch (e) {}
            data.forEach(item => Logs.instance().add('ERROR', item));
        }
        var old_trace = console.trace;
        console.trace = (...data) => {
            try {
                old_trace(...data);
            } catch (e) {}
            data.forEach(item => Logs.instance().add('ERROR', item));
        }
    }
}