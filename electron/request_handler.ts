import { BrowserWindow, contextBridge, ipcRenderer } from 'electron'
import * as Messages from "../src/messages";
import * as Responses from "../src/responses";
import { BaseResponse, BooleanResponse, OkOrError, StringResponse } from '../src/responses';
import Config from './config';
import * as fs from 'fs';
import * as path from 'path';
import * as dl from 'electron-dl';
const webrequest = require('request');
import { mainWindow } from './main';

export class RequestHandler {
    async handle(request: any): Promise<Responses.BaseResponse> {
        return new Promise<Responses.BaseResponse>(async (resolve, reject) => {
            let name = request.call_name;
            console.info("handling request: " + name);
            switch (name) {
                case "ping":
                    resolve(new StringResponse("ping was received and processed!", request.id))
                    break;
                case "get_platform":
                    resolve(new StringResponse("Ryujinx", request.id));
                    break;
                case "get_sdcard_root":
                    resolve(new StringResponse(Config.getSdcardPath(), request.id));
                    break;
                case "is_installed":
                    resolve(new BooleanResponse(
                        fs.existsSync(path.join(Config.getSdcardPath(),"ultimate/mods/hdr")), 
                        request.id));
                    break;
                case "get_version":
                    try {
                        // ensure that hdr is installed
                        let versionFile: string = path.join(Config.getSdcardPath(),"ultimate/mods/hdr/ui/hdr_version.txt");
                        let exists = fs.existsSync(versionFile);
                        if (!exists) {
                            resolve(new OkOrError(false, "Version file does not exist! HDR may not be installed.", request.id));
                            break;
                        }

                        // read the version
                        let version = fs.readFileSync(versionFile, 'utf-8');
                        resolve(new OkOrError(true, version, request.id));
                        break;
                    } catch (e) {
                        resolve(new OkOrError(false, String(e), request.id));
                        break;
                    }
                case "read_file":
                    try {
                        let args = request.arguments;
                        if (args == 0 || args === undefined) {
                            console.error("no arguments were provided for read_file");
                            resolve(new OkOrError(false, "no arguments were provided for read_file", request.id));
                            break;
                        }
                        if (args.length < 1) {
                            console.error("not enough args passed for read_file!");
                            resolve(new OkOrError(false, "not enough args passed for read_file!", request.id));
                            break;
                        }
                        // read the given file path
                        let file: string = path.join(Config.getSdcardPath(), args[0]);
                        let exists = fs.existsSync(file);
                        if (!exists) {
                            resolve(new OkOrError(false, "specified file does not exist! HDR may not be installed.", request.id));
                            break;
                        }

                        // read the version
                        let text = fs.readFileSync(file, 'utf-8');
                        resolve(new OkOrError(true, text, request.id));
                        break;
                    } catch (e) {
                        resolve(new OkOrError(false, String(e), request.id));
                        break;
                    }
                case "download_file":
                    let args = request.arguments;
                    if (args == 0 || args === undefined) {
                        console.error("no arguments were provided for download_file");
                        resolve(new OkOrError(false, "no arguments were provided for download_file", request.id));
                        break;
                    }
                    if (args.length < 2) {
                        console.error("not enough args passed for download_file!");
                        resolve(new OkOrError(false, "not enough args passed for download_file!", request.id));
                        break;
                    }
                    let url = args[0];
                    let location = args[1];
                    console.log("preparing to download...\nurl: " + url + "\nlocation: " + location);
                    if (mainWindow == null) {
                        console.error("cannot download without a main window!");
                        resolve(new OkOrError(false, "cannot download without a main window!", request.id));
                        break;
                    }

                    let absolute = path.join(Config.getSdcardPath(), location);
                    if (fs.existsSync(absolute)) {
                        fs.unlinkSync(absolute);
                    }

                    console.info("beginning download.");
                    console.info("Absolute path: " + absolute);
                    var out = fs.createWriteStream(absolute);

                    var req = webrequest({
                        method: 'GET',
                        uri: url
                    });

                    req.pipe(out);
                    let current = 0;
                    let total = 0;

                    req.on( 'response', function ( data: any ) {
                        total = data.headers[ 'content-length' ];
                    } );

                    let counter = 0;
                    req.on('data', function (chunk: any) {
                        current += chunk.length;
                        ++counter;
                        if (counter > 500) {
                            console.log("progress: " + current/total);
                            counter = 0;
                        }
                    });

                    req.on('end', function() {
                        resolve(new OkOrError(true, "download finished successfully", request.id));
                        out.close();
                    });                    
                    
                    req.on("error", function(e: any){
                        console.log("Error: " + e.message);
                        resolve(new OkOrError(false, "download failed with error: " + e.message, request.id));
                    });

                    break;
                default:
                    console.error("Could not handle request with name: " + name);
                    reject(new Error("unable to handle request " + name));
            }
        });
    }
}