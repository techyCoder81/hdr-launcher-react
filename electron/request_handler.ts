import { BrowserWindow, contextBridge, ipcRenderer } from 'electron'
import * as Messages from "../src/messages";
import * as Responses from "../src/responses";
import { BaseResponse, BooleanResponse, OkOrError, PathEntry, PathList, StringResponse } from '../src/responses';
import Config from './config';
import * as fs from 'fs';
import * as path from 'path';
import * as dl from 'electron-dl';
const webrequest = require('request');
import { mainWindow } from './main';
import * as  md5 from 'md5-file';

function readDirAll(dir: string, allitems: string[]) {
    let here = fs.readdirSync(dir);
    console.debug("Checking dir: " + dir);
    here.forEach(thispath => {
        console.debug("\tSubpath: " + thispath);
        let fullpath = path.join(dir, thispath);
        if (fs.statSync(fullpath).isFile()) {
            allitems.push(fullpath)
        } else {
            readDirAll(fullpath, allitems);
        }
    });
    
}

export class RequestHandler {
    async handle(request: any): Promise<Responses.BaseResponse> {
        return new Promise<Responses.BaseResponse>(async (resolve) => {

            // define the argument check "macro"
            function argcheck(count: number): boolean {
                if (request.arguments == 0 || request.arguments === undefined) {
                    console.error("no arguments were provided for request" + request.call_name);
                    resolve(new OkOrError(false, "no arguments were provided for request " + request.call_name, request.id));
                    return false;
                }
                if (request.arguments.length < 1) {
                    console.error("not enough args passed for request " + request.call_name);
                    resolve(new OkOrError(false, "not enough args passed for request" + request.call_name, request.id));
                    return false;
                }
                return true;
            }

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
                        if (!argcheck(1)) {break;}

                        let args = request.arguments;
                        // read the given file path
                        let file: string = args[0];
                        let exists = fs.existsSync(file);
                        if (!exists) {
                            resolve(new OkOrError(false, "specified file does not exist! HDR may not be installed.", request.id));
                            break;
                        }

                        // read the file
                        let text = fs.readFileSync(file, 'utf-8');
                        resolve(new OkOrError(true, text, request.id));
                        break;
                    } catch (e) {
                        resolve(new OkOrError(false, String(e), request.id));
                        break;
                    }
                case "download_file":
                    if (!argcheck(2)) {break;}

                    let args = request.arguments;
                    let url = args[0];
                    let location = args[1];
                    console.log("preparing to download...\nurl: " + url + "\nlocation: " + location);
                    if (mainWindow == null) {
                        console.error("cannot download without a main window!");
                        resolve(new OkOrError(false, "cannot download without a main window!", request.id));
                        break;
                    }

                    if (fs.existsSync(location)) {
                        fs.unlinkSync(location);
                    }

                    console.info("beginning download.");
                    console.info("Absolute path: " + location);
                    var out = fs.createWriteStream(location);

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
                case "get_md5":
                    try {
                        if (!argcheck(1)) {break;}

                        let args = request.arguments;
                        // read the given file path
                        let file: string = args[0];
                        let exists = fs.existsSync(file);
                        if (!exists) {
                            resolve(new OkOrError(false, "specified file for md5 does not exist!", request.id));
                            break;
                        }

                        // get the md5
                        let hash = md5.sync(file);
                        resolve(new OkOrError(true, hash, request.id));
                        break;
                    } catch (e) {
                        resolve(new OkOrError(false, String(e), request.id));
                        break;
                    }
                case "file_exists":
                    try {
                        if (!argcheck(1)) {break;}

                        // read the given file path
                        let file: string = request.arguments[0];

                        resolve(new BooleanResponse(
                            fs.existsSync(file) && fs.statSync(file).isFile(), 
                            request.id));
                        break;
                    } catch (e) {
                        resolve(new BooleanResponse(false, request.id));
                        break;
                    }
                case "dir_exists":
                    try {
                        if (!argcheck(1)) {break;}

                        // read the given dir path
                        let dir: string = request.arguments[0];

                        resolve(new BooleanResponse(
                            fs.existsSync(dir) && fs.statSync(dir).isDirectory(), 
                            request.id));
                        break;
                    } catch (e) {
                        resolve(new BooleanResponse(false, request.id));
                        break;
                    }
                case "list_dir":
                    try {
                        if (!argcheck(1)) {break;}

                        // read the given dir path
                        let dir: string = request.arguments[0];

                        if (!fs.existsSync(dir)) {
                            resolve(new OkOrError(false, "path does not exist!", request.id));
                            break;
                        } 
                        if (!fs.statSync(dir).isDirectory()) {
                            resolve(new OkOrError(false, "path was not a directory!", request.id));
                            break;
                        }
                        
                        let items = fs.readdirSync(dir);
                        let entries: Responses.PathEntry[] = [];
                        items.forEach(item => {
                            let fullpath = path.join(dir, item);
                            if (fs.statSync(fullpath).isDirectory()) {
                                entries.push(new PathEntry(fullpath, PathEntry.DIRECTORY));
                            } else {
                                entries.push(new PathEntry(fullpath, PathEntry.FILE));
                            }
                        });
                        
                        let list = new PathList(entries);
                        resolve(new OkOrError(true, JSON.stringify(list), request.id));
                        break;
                    } catch (e) {
                        resolve(new OkOrError(false, String(e), request.id));
                        break;
                    }
                case "list_all_files":
                    try {
                        if (!argcheck(1)) {break;}

                        // read the given dir path
                        let dir: string = request.arguments[0];

                        if (!fs.existsSync(dir)) {
                            resolve(new OkOrError(false, "path does not exist!", request.id));
                            break;
                        } 
                        if (!fs.statSync(dir).isDirectory()) {
                            resolve(new OkOrError(false, "path was not a directory!", request.id));
                            break;
                        }
                        
                        let items: string[] = [];
                        readDirAll(dir, items);
                        let entries: Responses.PathEntry[] = [];
                        items.forEach(item => {
                            if (fs.statSync(item).isDirectory()) {
                                entries.push(new PathEntry(item, PathEntry.DIRECTORY));
                            } else {
                                entries.push(new PathEntry(item, PathEntry.FILE));
                            }
                        });
                        
                        let list = new PathList(entries);
                        resolve(new OkOrError(true, JSON.stringify(list), request.id));
                        break;
                    } catch (e) {
                        resolve(new OkOrError(false, String(e), request.id));
                        break;
                    }
                default:
                    console.error("Could not handle request with name: " + name);
                    resolve(new Error("unable to handle request " + name));
            }
        });
    }
}