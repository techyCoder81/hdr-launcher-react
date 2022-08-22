import { contextBridge, ipcRenderer } from 'electron'
import * as Messages from "../src/messages";
import * as Responses from "../src/responses";
import { StringResponse } from '../src/responses';
import Config from './config';

export class RequestHandler {
    handle(request: Messages.Message): Responses.BaseResponse {
        let name = request.call_name;
        console.info("handling request: " + name);
        var response;
        switch (name) {
            case "ping":
                response = new StringResponse("ping was received and processed!", request.id);
                break;
            case "platform":
                response = new StringResponse("Ryujinx", request.id);
                break;
            case "sdcard_root":
                response = new StringResponse(Config.getSdcardPath(), request.id);
                break;
            default:
                console.error("Could not handle request with name: " + name);
                throw new Error("unable to handle request " + name);
        }
        console.info("Handled request " + request.id);
        return response;
    }
}