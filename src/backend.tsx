import * as skyline from "./skyline";
import * as Messages from "./messages";
import * as Responses from "./responses";
import { resolve } from "../webpack/main.webpack";
import { lutimes } from "original-fs";
import { BooleanResponse, OkOrError, StringResponse } from "./responses";

/**
 * this will represent the backend interface, which
 * could eventually be both node.js and also Skyline web.
 */
export abstract class Backend {
    /** sends an async message to the backend instance */
    protected abstract send(message: Messages.Message): any;

    /** invokes on the backend instance and returns a promise of a result */
    protected abstract invoke(message: Messages.Message): Promise<string>;

    /**
     * pings the backend with a message.
     * @returns whether the backend responded.
     */
    private async stringRequest(name: string, args: string[] | null): Promise<string> {
        console.info("beginning " + name);
        return await this.invoke(new Messages.Message(name, args)).then((json: string) => {
            console.info("response for " + name + ": " + json);
            return StringResponse.from(json).getMessage();
        }).catch((e: string) => {
            console.error("Error while performing " + name + ": " + e);
            throw e;
        });
    }

    /**
     * performs a request of the given name and awaits a BooleanResponse
     * @param name the name of the request
     * @returns a boolean
     */
    private async booleanRequest(name: string, args: string[] | null): Promise<boolean> {
        console.info("beginning " + name);
        return await this.invoke(new Messages.Message(name, args)).then((json: string) => {
            console.info("response for " + name + ": " + json);
            let response = BooleanResponse.from(json);
            return response.isOk();
        }).catch((e: string) => {
            console.error("Error while performing " + name +": " + e);
            throw e;
        });
    }

    /**
     * performs a request of the given name and awaits a OkOrError response()
     * @param name the name of the request
     * @returns a promise which resolves if the result is Ok, and rejects if the result is a failure
     */
    private async okOrErrorRequest(name: string, args: string[] | null): Promise<string> {
        console.info("beginning " + name);
        return await this.invoke(new Messages.Message(name, args)).then((json: string) => {
            console.info("response for " + name + ": " + json);
            let response = OkOrError.from(json);
            if (response.isOk()) {
                return response.getMessage();
            } else {
                throw new Error("Operation failed on the backend, reason: " + response.message);
            }
        }).catch((e: string) => {
            return e;
        });
    }

    /**
     * pings the backend with a message.
     * @returns whether the backend responded.
     */
    async ping(): Promise<boolean> {
        return this.stringRequest("ping", null).then((response) => {
            console.log("Ping got response: " + response);
            return true;
        }).catch(e => {
            console.log("Ping failed: " + e);
            throw e;
        });
    }

    /** downloads the requested file to the requested 
     * location relative to sdcard root */
     async downloadFile(url: string, location: string): Promise<string> {
        return this.stringRequest("download_file", [url, location]);
    }

    /** gets the platform of the current backend, 
     * according to the backend itself. */
    async getPlatform(): Promise<string> {
        return this.stringRequest("get_platform", null);
    }

    /** gets the platform of the current backend, 
     * according to the backend itself. */
     async getSdRoot(): Promise<string> {
        return this.stringRequest("get_sdcard_root", null);
    }

    /** gets whether hdr is installed */
     async isInstalled(): Promise<boolean> {
        return this.booleanRequest("is_installed", null);
    }

    /** gets the hdr version installed */
    async getVersion(): Promise<string> {
        return this.okOrErrorRequest("get_version", null);
    }

    /** returns the text contents of a file */
    async readFile(filepath: string): Promise<string> {
        return this.okOrErrorRequest("read_file", [filepath]);
    }

    /** sends the play message to the backend */
    play() {
        this.send(new Messages.Message("play", null));
    }

    /** sends the mod manager message to the backend */
    openModManager() {
        this.send(new Messages.Message("open_mod_manager", null));
    }

    /** sends the quit message to the backend */
    quit() {
        this.send(new Messages.Message("quit", null));
    }
}

/**
 * this is an implementation that intends to 
 */
export class NodeBackend extends Backend {

    override send(message: Messages.Message) {
        console.log("sending to node backend:\n" + JSON.stringify(message));
        window.Main.send("message", message);
    }

    override invoke(message: Messages.Message): Promise<string> {
        console.log("invoking on node backend:\n" + JSON.stringify(message));
        var retval = null;
        return new Promise<string>((resolve, reject) => {
            // send the request
            window.Main.invoke("request", message).then(response => {
                console.log("got response: " + JSON.stringify(response));
                let output = JSON.stringify(response);
                console.log("resolving with: " + output);
                resolve(output);
                return;
            }).catch(e => {
                console.error("error while invoking on node backend. " + JSON.stringify(e));
                throw e;
            });
        });
    }
}

export class SwitchBackend extends Backend {

    /// the map of callbacks that have been registered
    /// Map<ID, function(received object){}>
    callbacks: Map<string, {(object: string): void}> = new Map();

    constructor() {
        super();
        // add listener for all messages from window.nx
        var retval = skyline.addEventListener("message", (event: any) => {
            // call any registered callbacks for this ID
            var response = JSON.parse(event.data);
            var id: string = response.id;

            var callback = this.callbacks.get(id);
            if (callback != undefined) {
                callback(response);
            } else {
                console.error("Received response for unknown ID: " + JSON.stringify(response));
            }
        });
    }

    override invoke(message: Messages.Message): Promise<string> {
        console.log("trying to invoke on nx: " + JSON.stringify(message));
        return new Promise((resolve, reject) => {
            try {
                console.log("setting callback for skyline invocation");
                // set a callback for when that ID is returned
                this.callbacks.set(message.id, (response) => {
                    console.log("response called back for id " + message.id + " with response: " + JSON.stringify(response));
                    this.callbacks.delete(message.id);
                    resolve(JSON.stringify(response));
                });
                console.log("sending message to skyline: " + JSON.stringify(message));
                skyline.sendMessage(JSON.stringify(message));
                console.log("waiting for response from skyline");
            } catch (e) {
                console.error("Error while invoking on skyline: " + e + ", object data: " + JSON.stringify(e))
                reject("Error: " + JSON.stringify(e));
            }
        });
    }

    override send(message: Messages.Message) {
        console.log("trying to send to nx: " + JSON.stringify(message));
        skyline.sendMessage(JSON.stringify(message));
    }
}