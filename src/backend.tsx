import * as skyline from "./skyline";
import * as Messages from "./messages";
import { Message } from "./messages";
import { resolve } from "../webpack/main.webpack";

/**
 * this will represent the backend interface, which
 * could eventually be both node.js and also Skyline web.
 */
export interface Backend {
    send(message: Message): any;
    invoke(message: Message): Promise<string>;
}

/**
 * this is an implementation that intends to 
 */
export class NodeBackend implements Backend {


    constructor() {
    }

    send(message: Message) {
        console.log("sending to node backend:\n" + JSON.stringify(message));
        window.Main.send(message.message_name(), message)
    }

    invoke(message: Message): Promise<string> {
        console.log("invoking on node backend:\n" + JSON.stringify(message));
        var retval = null;
        return new Promise((resolve) => {
            window.Main.send(message.message_name(), message);
            window.Main.once("pong", (value: Messages.Response) => {
                console.log("got response: " + JSON.stringify(value));
                resolve(JSON.stringify(value));
            });
        });
    }
}

export class ConsoleBackend implements Backend {
    invoke(message: Messages.Message): Promise<string> {
        return new Promise((resolve) => {
            console.log(JSON.stringify(message));
            var input = prompt("response?\n") + "";
            resolve(input)
        });
    }
    send(message: Message) {
        console.log(JSON.stringify(message));
    }
}

export class SwitchBackend implements Backend {
    constructor() {
        try {
            new Promise((resolve, reject) => {
                this.invoke(new Messages.Ping("frontend has arrived lol"));
            });
        } catch (e) {
            console.error(e);
        }
    }
    invoke(message: Messages.Message): Promise<string> {
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

    send(message: Message) {
        skyline.sendMessage(JSON.stringify(message));
    }
}