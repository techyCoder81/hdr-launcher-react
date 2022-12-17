import { Backend } from "./backend";
import { StageConfig } from "./stage_config";

type BooleanSetting = "skip_launcher" | "ignore_music";

const ACTIVE_CONFIG_FILE = "ultimate/mods/hdr-stages/ui/param/database/ui_stage_db.prcxml";
const DEFAULT_CONFIG_FILE = "ultimate/mods/hdr-stages/ui/param/database/ui_stage_db.default";
const BACKUP_STAGE_CONFIG = "ultimate/hdr-config/backup_ui_stage_db.prcxml";
const CONFIG_PATH = "ultimate/hdr-config/";

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

export async function isTournamentMode(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
        try {
            console.info("checking if tournament mode is enabled");
            let backend = Backend.instance();
            let root = await backend.getSdRoot();
            let exists = await backend.fileExists(root + ACTIVE_CONFIG_FILE);
            resolve(exists);
        } catch (e) {
            reject(e);
        }
    });
}

export async function setTournamentMode(will_enable: boolean): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        try {
            console.info("setting tournament mode to: " + will_enable);
            // unload the stage config data
            StageConfig.instance().unload();

            let is_enabled = await isTournamentMode();
            if (will_enable == is_enabled) {
                // NOP
                resolve();
                return;
            }

            
            let backend = Backend.instance();
            let root = await backend.getSdRoot();
            if (will_enable) {
                // if we are enabling tournament mode
                if (await backend.fileExists(root + BACKUP_STAGE_CONFIG)) {
                    // if a backup exists, restore it
                    console.info("restoring backup of config");
                    let xml = await backend.readFile(root + BACKUP_STAGE_CONFIG);
                    await backend.writeFile(root + ACTIVE_CONFIG_FILE, xml);
                } else {
                    // otherwise, create a new default config
                    console.info("reading default config data");
                    let xml = await backend.readFile(root + DEFAULT_CONFIG_FILE);
                    console.info("writing to active file");
                    await backend.writeFile(root + ACTIVE_CONFIG_FILE, xml);
                }
            } else {
                if (await backend.fileExists(root + ACTIVE_CONFIG_FILE)) {
                    // backup the stage config so far
                    console.info("backing up stage config");
                    let xml = await backend.readFile(root + ACTIVE_CONFIG_FILE);
                    await backend.writeFile(root + BACKUP_STAGE_CONFIG, xml);
                    
                    // delete the active config file
                    console.info("deleting active config");
                    await backend.deleteFile(root + ACTIVE_CONFIG_FILE);
                }
            }
            console.info("done setting config.")
            resolve();
        } catch (e) {
            console.error("failed to set tourney mode to " + will_enable);
            reject(e);
        }
    });
}