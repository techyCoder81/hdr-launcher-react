import * as skyline from "./skyline";
import * as Messages from "./messages";
import * as Responses from "./responses";
import { resolve } from "../webpack/main.webpack";
import { lutimes } from "original-fs";

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
    async ping(): Promise<boolean> {
        console.info("beginning ping");
        return await this.invoke(new Messages.Message("ping")).then((value: string) => {
            console.info("Frontend got response: " + value);
            let response = JSON.parse(value);
            return true;
        }).catch((e: string) => {
            console.error("Error while performing ping: " + e);
            return false;
        });
    }

    /**
     * pings the backend with a message.
     * @returns whether the backend responded.
     */
    private async stringRequest(name: string): Promise<string> {
        console.info("beginning " + name);
        return await this.invoke(new Messages.Message(name)).then((value: string) => {
            console.info("Frontend got response: " + value);
            let response = JSON.parse(value);
            return response.message;
        }).catch((e: string) => {
            console.error("Error while performing ping: " + e);
            return "Unknown";
        });
    }

    /** gets the platform of the current backend, 
     * according to the backend itself. */
    async getPlatform() {
        return this.stringRequest("platform");
    }

    /** gets the platform of the current backend, 
     * according to the backend itself. */
     async getSdRoot() {
        return this.stringRequest("sdcard_root");
    }

    /** sends the play message to the backend */
    play() {
        this.send(new Messages.Message("play"));
    }

    /** sends the quit message to the backend */
    quit() {
        this.send(new Messages.Message("quit"));
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
            // add the newly returned object to the responses list
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
        skyline.printData();
        console.log("trying to send to nx: " + JSON.stringify(message));
        skyline.sendMessage(JSON.stringify(message));
    }
}