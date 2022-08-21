import { contextBridge, ipcRenderer } from 'electron'
import * as Messages from "../src/messages";
import * as Responses from "../src/responses";

export class RequestHandler {
    handle(request: any): Responses.Response {
        let name = request.getName();
        var response;
        switch (name) {
            case "ping":
                response = new Responses.StringResponse("request was received and processed!");
                break;
            default:
                console.error("Could not handle request with name: " + name);
                throw new Error("unable to handle request " + name);
        }
        console.info("Handled message " + name + ", Sending response: " + JSON.stringify(response));
        return response;
    }
}