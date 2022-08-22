import { contextBridge, ipcRenderer } from 'electron'
import * as Messages from "../src/messages";
import * as Responses from "../src/responses";
import { app } from 'electron'
import * as Process from 'child_process';
import Config from './config';
import { createWindow, mainWindow } from './main';

export class MessageHandler {

    constructor() {

    }

    handle(message: Messages.Message) {
        let name = message.call_name;
        switch (name) {
            case "quit":
                app.quit();
                break;
            case "play":
                let command = Config.getRyuPath() + " " + Config.getRomPath();
                if (process.platform == "win32") {
                    command = "start cmd /k \"" + command + "\"";
                }
                console.log("Starting the game, with command: " + command);
                Process.exec(command, () => {
                    createWindow();
                });
                mainWindow?.close();
                break;
            default:
                console.error("Could not handle message with name: " + name);
                return;
        }
        console.info("Handled message " + name);
    }
}