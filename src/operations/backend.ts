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

    /** sends the quit message to the backend */
    quit(): Promise<string> {
        return this.invoke("quit", null);
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
                console.debug("resolving with: " + output);
                resolve(output);
                return;
            }).catch(e => {
                console.error("error while invoking on node backend. " + JSON.stringify(e));
                throw e;
            });
        });
    }
}
