import { contextBridge, ipcRenderer } from 'electron'
import * as Messages from "../src/messages";
import * as Responses from "../src/responses";

export class RequestHandler {
    handle(request: Messages.Message): Responses.BaseResponse {
        let name = request.call_name;
        console.info("handling request: " + name);
        var response;
        switch (name) {
            case "ping":
                response = new Responses.StringResponse("request was received and processed!");
                break;
            default:
                console.error("Could not handle request with name: " + name);
                throw new Error("unable to handle request " + name);
        }
        console.info("Handled request " + request.id);
        return response;
    }
}