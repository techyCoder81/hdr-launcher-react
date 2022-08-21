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
     * @param message the message for the ping
     * @returns whether the backend responded.
     */
    ping(message: string): boolean {
        this.invoke(new Messages.Message("ping")).then(value => {
            let response = JSON.parse(value) as Responses.StringResponse;
            console.info("Frontend got response: " + response.getMessage());
            return true;
        }).catch(e => {
            console.error("Error while performing ping: " + JSON.stringify(e));
            return false;
        });
        return false;
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
        window.Main.send("message", message)
    }

    override invoke(message: Messages.Message): Promise<string> {
        console.log("invoking on node backend:\n" + JSON.stringify(message));
        var retval = null;
        return new Promise((resolve) => {
            // send the request
            window.Main.send("request", message);

            // listen for the message ID's response
            window.Main.once(message.getId(), (value: Responses.BaseResponse) => {
                console.log("got response: " + JSON.stringify(value));
                resolve(JSON.stringify(value));
            });
        });
    }
}

export class ConsoleBackend extends Backend {
    override invoke(message: Messages.Message): Promise<string> {
        return new Promise((resolve) => {
            console.log(JSON.stringify(message));
            var input = prompt("response?\n") + "";
            resolve(input)
        });
    }
    override send(message: Messages.Message) {
        console.log(JSON.stringify(message));
    }
}

export class SwitchBackend extends Backend {
    constructor() {
        super();
        try {
            new Promise((resolve, reject) => {
                this.invoke(new Messages.Message("frontend has arrived lol"));
            });
        } catch (e) {
            console.error(e);
        }
    }
    override invoke(message: Messages.Message): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                console.log("sending message to skyline: " + JSON.stringify(message));
                skyline.sendMessage(JSON.stringify(message));
                console.log("waiting for response from skyline");
                var response = skyline.receiveMessage();
                console.log("Skyline response: " + response);
                resolve(response);
            } catch (e) {
                console.log("Error while invoking on skyline: " + JSON.stringify(e))
                reject("Error: " + JSON.stringify(e));
            }
        });
    }

    override send(message: Messages.Message) {
        skyline.sendMessage(JSON.stringify(message));
    }
}