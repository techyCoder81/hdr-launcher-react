import { Progress, BackendSupplier, DefaultMessenger, Messages } from "nx-request-api"

type BackendType = 'Node' | 'Switch';

/**
 * this will represent the backend interface, which
 * could be either node.js or Skyline web.
 */
export class Backend extends DefaultMessenger {
    /** singleton instance of the backend */
    private static backendInstance: Backend | null = null;
    private backendType: BackendType;

    constructor(backendType: BackendType, supplier?: BackendSupplier) {
        super(supplier);
        this.backendType = backendType;
    }

    public static instance(): Backend {
        if (Backend.backendInstance == null) {
            if (window.Main == undefined) {
                Backend.backendInstance = new Backend('Switch');

            } else {
                Backend.backendInstance = new Backend('Node', new NodeBackend());
            }
        }
        return Backend.backendInstance;
    }

    /**
     * returns whether this is running on pc or not,
     * without making a backend call
     * @returns whether this is running on pc (node.js)
     */
    public static isNode() {
        return Backend.instance().backendType == 'Node';
    }

    /**
     * returns whether this is running on switch or not,
     * without making a backend call
     * @returns whether this is running on switch
     */
    public static isSwitch() {
        return Backend.instance().backendType == 'Switch';
    }

    /**
     * Gets the user friendly backend name, without making a backend call.
     * @returns the platform name
     */
    public static platformName() {
        return (this.isNode() ? "Ryujinx" : "Switch");
    }


    private static platform: string;

    /** gets the platform of the current backend, 
     * according to the backend itself. */
    async getPlatform(): Promise<string> {
        if (!Backend.platform) {
            Backend.platform = await this.customRequest("get_platform", null);
        }
        return Backend.platform;
    }

    /** gets the platform of the current backend, 
     * according to the backend itself. */
     async getSdRoot(): Promise<string> {
        return this.customRequest("get_sdcard_root", null);
    }

    /** gets whether hdr is installed */
     async isInstalled(): Promise<boolean> {
        return this.booleanRequest("is_installed", null);
    }

    /** gets the hdr version installed */
    async getVersion(): Promise<string> {
        return this.customRequest("get_version", null);
    }

    /** sends the play message to the backend */
    play(): Promise<string> {
        return this.exitSession();
    }

    /** sends the mod manager message to the backend */
    openModManager(): Promise<string> {
        return this.invoke("open_mod_manager", null);
    }

    /** checks if the given mod path is enabled (relative to sd:/) */
    isModEnabled(mod_path: string): Promise<boolean> {
        return this.booleanRequest("is_mod_enabled", [mod_path]);
    }

    /** gets the arcropolis api version */
    getArcropApiVersion(): Promise<string> {
        return this.customRequest("get_arcrop_api_version", null);
    }

    /** gets the the launcher version */
    getLauncherVersion(): Promise<string> {
        return this.customRequest("get_launcher_version", null);
    }

    /** reads the ui_stage_db.prcxml file */
    readStageXml(): Promise<string> {
        return this.customRequest("read_stage_xml", null);
    }

    /** writes the given string data to the stage ui file */
    writeStageXml(xml: string): Promise<string> {
        //if (Backend.isNode()) {
            return this.customRequest("write_stage_xml", [xml])
        //}
        return new Promise<string>(async (resolve, reject) => {
            try {
                // create a temp file
                await this.customRequest("new_temp_stage_data", null);
                let trimmed = xml.trim();
                let chunks = trimmed.split("<string");
                console.info("length of xml data: " + xml.length);
                for (var i = 0; i < chunks.length; ++i) {
                    //let line_trimmed = lines[i].trim();
                    //console.info("appending: " + line_trimmed);
                    let chunk = chunks[i];
                    if (i != 0) {
                        chunk = "      <string" +  chunk.trim();
                    }
                    await this.customRequest("append_temp_stage_line", [chunk]);
                }
                
                let result = await this.customRequest("overwrite_stage_file", null);
                resolve(result);
            } catch (e) {
                reject(e);
            }
        });
    }

    /** resets the stage xml file to the defaults */
    resetStageXml(): Promise<string> {
        return this.customRequest("reset_stage_xml", null);
    }
}

/**
 * this is an implementation that intends to 
 */
export class NodeBackend implements BackendSupplier {

    invoke(call_name: string, args: string[] | null, progressCallback?: (p: Progress) => void): Promise<string> {
        let message = new Messages.Message(call_name, args);
        console.debug("invoking on node backend:\n" + JSON.stringify(message));
        var retval = null;
        return new Promise<string>((resolve, reject) => {
            // if defined, set the progress callback
            if (typeof progressCallback !== 'undefined') {
                window.Main.on("progress", (progress: Progress) => {
                    progressCallback(progress);
                });
            }
            // send the request
            window.Main.invoke("request", message).then(response => {
                console.debug("got response: " + JSON.stringify(response));
                let output = JSON.stringify(response);
                //console.debug("resolving with: " + output);
                resolve(output);
                return;
            }).catch(e => {
                console.error("error while invoking on node backend. " + JSON.stringify(e));
                throw e;
            });
        });
    }
}
