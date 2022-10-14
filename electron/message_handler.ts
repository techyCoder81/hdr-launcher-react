import { contextBridge, ipcRenderer } from 'electron'
import * as Messages from "../src/messages";
import * as Responses from "../src/responses";
import { app } from 'electron'
import * as Process from 'child_process';
import Config from './config';
import { createWindow, mainWindow } from './main';
import * as net from 'net';
import * as path from 'path';

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
                let command = path.normalize(Config.getRyuPath() + " " + Config.getRomPath());
                if (process.platform == "win32") {
                    command = "start cmd /k \"" + command + "\"";
                }
                console.log("Starting the game, with command: " + command);
                Process.exec(command, () => {
                    mainWindow?.show();
                });
                mainWindow?.hide();
                
                let did_connect = false;
                let connect = () => {
                    var s = net.createConnection(6969, "localhost");
                    s.on('data', function(data) {
                        did_connect = true;
                        console.log(data.toString());
                    });
                    s.on('error', e => {
                        if (!did_connect) {
                            console.info("waiting for skyline logger...");
                            setTimeout(connect, 1000);
                        }
                    });
                }
                setTimeout(connect, 1000);
                break;
            default:
                console.error("Could not handle message with name: " + name);
                return;
        }
        console.info("Handled message " + name);
    }
}