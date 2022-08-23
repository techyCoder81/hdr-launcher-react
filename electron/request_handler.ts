import { contextBridge, ipcRenderer } from 'electron'
import * as Messages from "../src/messages";
import * as Responses from "../src/responses";
import { BooleanResponse, OkOrError, StringResponse } from '../src/responses';
import Config from './config';
import * as fs from 'fs';
import * as path from 'path';

export class RequestHandler {
    handle(request: Messages.Message): Responses.BaseResponse {
        let name = request.call_name;
        console.info("handling request: " + name);
        var response;
        switch (name) {
            case "ping":
                response = new StringResponse("ping was received and processed!", request.id);
                break;
            case "get_platform":
                response = new StringResponse("Ryujinx", request.id);
                break;
            case "get_sdcard_root":
                response = new StringResponse(Config.getSdcardPath(), request.id);
                break;
            case "is_installed":
                response = new BooleanResponse(
                    fs.existsSync(path.join(Config.getSdcardPath(),"ultimate/mods/hdr")), 
                    request.id);
                break;
            case "get_version":
                try {
                    // ensure that hdr is installed
                    let versionFile: string = path.join(Config.getSdcardPath(),"ultimate/mods/hdr/ui/hdr_version.txt");
                    let exists = fs.existsSync(versionFile);
                    if (!exists) {
                        response = new OkOrError(false, "Version file does not exist! HDR may not be installed.", request.id);
                        break;
                    }

                    // read the version
                    let version = fs.readFileSync(versionFile, 'utf-8');
                    response = new OkOrError(true, version, request.id);
                    break;
                } catch (e) {
                    response = new OkOrError(false, String(e), request.id);
                    break;
                }
            default:
                console.error("Could not handle request with name: " + name);
                throw new Error("unable to handle request " + name);
        }
        console.info("Handled request " + request.id);
        return response;
    }
}