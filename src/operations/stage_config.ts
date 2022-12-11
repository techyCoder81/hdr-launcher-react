import { Backend } from "./backend";
import StageData from "./stage_data";

const ACTIVE_CONFIG_FILE = "ultimate/mods/hdr-stages/ui/param/database/ui_stage_db.prcxml";
const DEFAULT_CONFIG_FILE = "ultimate/mods/hdr-stages/ui/param/database/ui_stage_db.default";
const BACKUP_STAGE_CONFIG = "ultimate/hdr-config/backup_ui_stage_db.prcxml";
const CONFIG_PATH = "ultimate/hdr-config/";

export class StageConfig {
    dom: null | Document = null;
    parser = new DOMParser();
    serializer = new XMLSerializer();
    private static singleton: undefined | StageConfig;
    
    private constructor() {}

    static instance() {
        if (this.singleton === undefined) {
            this.singleton = new StageConfig();
        }
        return this.singleton;
    }

    async load(): Promise<void> {
        return new Promise<void>(async (resolve,reject) => {
            try {
                let backend = Backend.instance();
                let root = await backend.getSdRoot();
                backend.fileExists(root + ACTIVE_CONFIG_FILE)
                    .then(async exists => {
                        if (!exists) {
                            await this.resetDefaults();
                        }
                    })
                    .catch(e => {throw e;});
                if (this.dom === null) {
                    await backend.readFile(root + ACTIVE_CONFIG_FILE)
                        .then(xml => {
                            this.dom = this.parser.parseFromString(xml.trim(), "text/xml");
                            resolve();
                        })
                        .catch(e => reject(e));
                } else {
                    resolve();
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    unload() {
        this.dom = null;
    }

    async resetDefaults(): Promise<void> {
        return new Promise<void>(async (resolve,reject) => {
            try {
                this.dom = null;
                let backend = Backend.instance();
                let root = await backend.getSdRoot();
                if (await backend.fileExists(root + ACTIVE_CONFIG_FILE)) {
                    await backend.deleteFile(root + ACTIVE_CONFIG_FILE);
                }
                if (await backend.fileExists(root + BACKUP_STAGE_CONFIG)) {
                    await backend.deleteFile(root + BACKUP_STAGE_CONFIG);
                }
                if (await backend.fileExists(root + DEFAULT_CONFIG_FILE)) {
                    let xml = await backend.readFile(root + DEFAULT_CONFIG_FILE);
                    backend.writeFile(root + ACTIVE_CONFIG_FILE, xml);
                }
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    async save(): Promise<void> {
        return new Promise<void>(async (resolve,reject) => {
            try {
                if (this.dom === null) {
                    reject("the XML data is not loaded!");
                    return;
                }
        
                const outXml = this.serializer.serializeToString(this.dom);
                var formatted = '', indent= '';
                var tab = '\t';
                outXml.split(/>\s*</).forEach(function(node) {
                    if (node.match( /^\/\w/ )) indent = indent.substring(tab.length); // decrease indent by one 'tab'
                    formatted += indent + '<' + node + '>\r\n';
                    if (node.match( /^<?\w[^>]*[^\/]$/ )) indent += tab;              // increase indent
                });
                let formattedXml = formatted.substring(1, formatted.length-3);
                let root = await Backend.instance().getSdRoot();
                await Backend.instance().writeFile(root + ACTIVE_CONFIG_FILE, formattedXml);
                this.dom = null;
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    async getStageNames(): Promise<string[]> {
        return new Promise<string[]>(async (resolve,reject) => {
            try {
                await this.load();
                let list = this.dom?.querySelectorAll("[hash=db_root]")[0];
                if (list === undefined) {
                    reject("db_root not found!");
                    return;
                }
                let names = [];
                for (var i = 0; i < list.children.length; ++i) {
                    let item = list.children[i];
                    if (item === null) {
                        reject("expected item in list was null!");
                        return;
                    }
                    let name_id = item.querySelector('[hash="name_id"]')?.innerHTML;
                    if (name_id !== undefined) {
                        names.push(name_id);
                    } else {
                        console.error("Could not get name field for item " + i);
                    }
                }
                resolve(names);
            } catch (e) {
                reject(e);
            }
        });
    }

    async isEnabled(name: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve,reject) => {
            try {
                await this.load();
                let list = this.dom?.querySelectorAll("[hash=db_root]")[0];
                if (list === undefined) {
                    reject("db_root not found!");
                    return;
                }
                for (var i = 0; i < list.children.length; ++i) {
                    let item = list.children[i];
                    let name_id = item.querySelector('[hash="name_id"]')?.innerHTML;
                    if (name_id === name) {
                        let disp_order = item.querySelector('[hash="disp_order"]')?.innerHTML;
                        if (disp_order === undefined) {
                            reject("could not find disp_order field!");
                            return;
                        }
                        resolve(!disp_order.includes("-1"));
                        return;
                    }
                }
                reject("Could not find stage with name: " + name);
            } catch (e) {
                reject(e);
            }
        });
    }

    async getAll(): Promise<StageData[]> {
        return new Promise<StageData[]>(async (resolve,reject) => {
            try {
                await this.load();
                let list = this.dom?.querySelectorAll("[hash=db_root]")[0];
                if (list === undefined) {
                    reject("db_root not found!");
                    return;
                }
                let stages = [];
                for (var i = 0; i < list.children.length; ++i) {
                    let item = list.children[i];
                    let name_id = item.querySelector('[hash="name_id"]')?.innerHTML;
                    if (name_id === undefined) {
                        reject("could not find name_id for entry " + i + "!");
                        return;
                    }

                    let disp_order = item.querySelector('[hash="disp_order"]')?.innerHTML;
                    if (disp_order === undefined) {
                        reject("could not find disp_order for entry " + name_id + "!");
                        return;
                    }
                    stages.push(new StageData(name_id, !disp_order.includes("-1")));
                }
                resolve(stages);
            } catch (e) {
                reject(e);
            }
        });
    }

    async setEnabled(name: string, enabled: boolean): Promise<void> {
        return new Promise<void>(async (resolve,reject) => {
            try {
                console.info("Setting stage " + name + " to " + enabled);
                await this.load();
                let list = this.dom?.querySelectorAll("[hash=db_root]")[0];
                if (list === undefined) {
                    reject("db_root not found!");
                    return;
                }
                for (var i = 0; i < list.children.length; ++i) {
                    let item = list.children[i];
                    let name_id = item.querySelector('[hash="name_id"]')?.innerHTML;
                    if (name_id === name) {
                        let element = item.querySelector('[hash="disp_order"]');
                        if (element === undefined || element === null) {
                            reject("could not find disp_order field for stage: " + name);
                            return;
                        }
                        // blindly set dis_order to 1 lol
                        element.innerHTML = (enabled ? "-1" : "1");
                        //await this.save();
                        resolve();
                        return;
                    }
                }
                reject("Could not find stage in prcxml file: " + name);
            } catch (e) {
                reject(e);
            }
        });
    }

    async toggle(name: string): Promise<void> {
        return new Promise<void>(async (resolve,reject) => {
            try {
                console.info("Toggling stage " + name);
                await this.load();
                let list = this.dom?.querySelectorAll("[hash=db_root]")[0];
                if (list === undefined) {
                    reject("db_root not found!");
                    return;
                }
                for (var i = 0; i < list.children.length; ++i) {
                    let item = list.children[i];
                    let name_id = item.querySelector('[hash="name_id"]')?.innerHTML;
                    if (name_id === name) {
                        let element = item.querySelector('[hash="disp_order"]');
                        if (element === undefined || element === null) {
                            reject("could not find disp_order field for stage: " + name);
                            return;
                        }
                        let enabled = !element.innerHTML.includes("-1");
                        // invert the current setting
                        // blindly set dis_order to 1 lol
                        element.innerHTML = (enabled ? "-1" : "1");
                        //await this.save();
                        resolve();
                        return;
                    }
                }
                reject("Could not find stage in prcxml file: " + name);
            } catch (e) {
                reject(e);
            }
        });
    }

    async setAll(enabled: boolean): Promise<void> {
        return new Promise<void>(async (resolve,reject) => {
            try {
                console.info("Setting stage all to " + enabled);
                await this.load();
                let list = this.dom?.querySelectorAll("[hash=db_root]")[0];
                if (list === undefined) {
                    reject("db_root not found!");
                    return;
                }
                for (var i = 0; i < list.children.length; ++i) {
                    let item = list.children[i];
                    let name_id = item.querySelector('[hash="name_id"]')?.innerHTML;
                        let element = item.querySelector('[hash="disp_order"]');
                        if (element === undefined || element === null) {
                            reject("could not find disp_order field for stage: " + name_id);
                            return;
                        }
                        
                        // blindly set disp_order to 1 lol
                        element.innerHTML = (enabled ? "1" : "-1");
                }
                //await this.save();
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }
}