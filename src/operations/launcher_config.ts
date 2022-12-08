import { Backend } from "./backend";

type BooleanSetting = "skip_launcher" | "ignore_music";

export async function setBoolean(setting: BooleanSetting, enabled: boolean): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        try {
            let backend = Backend.instance();
            let sdroot = await backend.getSdRoot();
            let configDir = sdroot + "ultimate/hdr-config";
            let exists = await backend.fileExists(configDir + "/" + setting);
            if (exists) {
                await backend.deleteFile(configDir + "/" + setting);
            } else {
                await backend.mkdir(configDir);
                await backend.writeFile(configDir + "/" + setting, "foo");
            }
            resolve();
        } catch (e) {
            alert("Could not set config setting " + setting + "\n" + e);
            reject(e);
        }
    });
}

export async function getBoolean(setting: BooleanSetting): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
        try {
            let backend = Backend.instance();
            let sdroot = await backend.getSdRoot();
            let configDir = sdroot + "ultimate/hdr-config";
            let exists = await backend.fileExists(configDir + "/" + setting);
            if (exists) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (e) {
            alert("Could not get config setting " + setting + "\n" + e);
            reject(e);
        }
    });
}