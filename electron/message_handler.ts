import { contextBridge, ipcRenderer } from 'electron'
import * as Messages from "../src/messages";
import * as Responses from "../src/responses";
import { app } from 'electron'

export class MessageHandler {
    constructor() {

    }

    handle(message: Messages.Message) {
        let name = message.getName();
        switch (name) {
            case "quit":
                app.quit();
                break;
            case "play":
                console.log("starting the game now haha");
                break;
            default:
                console.error("Could not handle message with name: " + name);
                return;
        }
        console.info("Handled message " + name);
    }
}