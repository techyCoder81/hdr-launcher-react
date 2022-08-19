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
    invoke(message: Message): Promise<Messages.Response>;
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

    invoke(message: Message): Promise<Messages.Response> {
        console.log("invoking on node backend:\n" + JSON.stringify(message));
        var retval = null;
        return new Promise((resolve) => {
            window.Main.send(message.message_name(), message);
            window.Main.once("pong", (value: Messages.Response) => {
                console.log("got response: " + JSON.stringify(value));
                resolve(value)
            });
        });
    }
}

export class ConsoleBackend implements Backend {
    invoke(message: Messages.Message): Promise<Messages.Response> {
        return new Promise((resolve) => {
            console.log(JSON.stringify(message));
            var input = prompt("response?\n") + "";
            resolve(JSON.parse(input) as Messages.Response)
        });
    }
    send(message: Message) {
        console.log(JSON.stringify(message));
    }
}

export class SwitchBackend implements Backend {
    constructor() {
    }
    invoke(message: Messages.Message): Promise<Messages.Response> {
        skyline.sendMessage(JSON.stringify(message))
        return skyline.receive();
    }

    send(message: Message) {
        skyline.sendMessage(JSON.stringify(message));
    }
}