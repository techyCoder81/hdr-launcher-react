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
            console.info("Response message type: " + response.message);
            return true;
        }).catch((e: string) => {
            console.error("Error while performing ping: " + e);
            return false;
        });
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
            /*console.info("request sent!");

            // listen for the message ID's response
            window.Main.once(message.getId(), (value: Responses.BaseResponse) => {
                console.log("got response: " + JSON.stringify(value));
                resolve(JSON.stringify(value));
            });
            console.info("listener registered for ID: " + message.getId());
            */
        });
    }
}

export class SwitchBackend extends Backend {
    constructor() {
        super();
    }

    override invoke(message: Messages.Message): Promise<string> {
        console.log("trying to invoke on nx: " + JSON.stringify(message));
        return new Promise((resolve, reject) => {
            try {
                console.log("sending message to skyline: " + JSON.stringify(message));
                skyline.sendMessage(JSON.stringify(message));
                console.log("waiting for response from skyline");
                var response = skyline.receiveMessage();
                console.log("Skyline response: " + response);
                resolve(response);
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