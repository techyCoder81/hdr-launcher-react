import { Backend } from "./backend";
import StageData from "./stage_data";

const ACTIVE_CONFIG_FILE = "ultimate/mods/hdr-stages/ui/param/database/ui_stage_db.prcxml";
const DEFAULT_CONFIG_FILE = "ultimate/mods/hdr-stages/ui/param/database/ui_stage_db.default";
const BACKUP_STAGE_CONFIG = "ultimate/hdr-config/backup_ui_stage_db.prcxml";
const CONFIG_PATH = "ultimate/hdr-config/";

export const stageInfo: Record<string, string> = {
    Random: "Random (All)",
    RandomNormal: "Normal Random",
    BattleField: "Battlefield",
    BattleFieldL: "Deadline",
    End: "Final Destination",
    Mario_Castle64: "Peach's Castle 64",
    DK_Jungle: "DK Jungle 64",
    Zelda_Hyrule: "Hyrule Castle 64",
    Kirby_Pupupu64: "Dreamland",
    Poke_Yamabuki: "Saffron City",
    Mario_Past64: "Mushroom Kingdom",
    Mario_CastleDx: "Princess Peach's Castle",
    Mario_Rainbow: "Rainbow Cruise",
    DK_WaterFall: "Kongo Falls",
    DK_Lodge: "Jungle Japes",
    Zelda_Greatbay: "Great Bay",
    Zelda_Temple: "Hyrule Temple",
    Metroid_ZebesDx: "Brinstar",
    Yoshi_Yoster: "Yoshi's Island (Melee)",
    Yoshi_CartBoard: "Yoshi's Story",
    Kirby_Fountain: "Fountain of Dreams",
    Kirby_Greens: "Green Greens",
    Fox_Corneria: "Corneria",
    Fox_Venom: "Venom",
    Poke_Stadium: "Pokémon Stadium",
    Mother_Onett: "Onett",
    Mario_PastUsa: "Mushroom Kingdom II",
    Metroid_Kraid: "Brinstar Depths",
    Yoshi_Story: "Yoshi's Island (Brawl)",
    Fzero_Bigblue: "Big Blue",
    Mother_Fourside: "Fourside",
    Mario_Dolpic: "Delfino Plaza",
    Mario_PastX: "Mushroomy Kingdom",
    Kart_CircuitX: "Mario Circuit",
    Wario_Madein: "WarioWare, Inc.",
    Zelda_Oldin: "Bridge of Elden",
    Metroid_Norfair: "Norfair",
    Metroid_Orpheon: "Frigate Orpheon",
    Yoshi_Island: "Yoshi's Island",
    Kirby_Halberd: "Halberd",
    Fox_LylatCruise: "Lylat Cruise",
    Poke_Stadium2: "Pokémon Stadium 2",
    Fzero_Porttown: "Port Town Aero Dive",
    FE_Siege: "Castle Siege",
    Pikmin_Planet: "Distant Planet",
    Animal_Village: "Smashville",
    Mother_Newpork: "New Pork Town",
    Ice_Top: "Summit",
    Icarus_SkyWorld: "Skyworld",
    MG_Shadowmoses: "Shadow Moses Island",
    LuigiMansion: "Luigi's Mansion",
    Zelda_Pirates: "Pirate Ship",
    Poke_Tengam: "Spear Pillar",
    MarioBros: "Mario Bros.",
    Plankton: "Electroplankton",
    Sonic_Greenhill: "Green Hill Zone",
    Mario_3DLand: "3D Land",
    Mario_NewBros2: "Mushroom Kingdom 2",
    Mario_Paper: "Paper Mario",
    Zelda_Gerudo: "Gerudo Valley",
    Zelda_Train: "Spirit Tracks",
    Kirby_Gameboy: "Dreamland GB",
    Poke_Unova: "Unova Pokemon League",
    Poke_Tower: "Prism Tower",
    Fzero_Mutecity3DS: "Mute City",
    Mother_Magicant: "Magicant",
    FE_Arena: "Arena Ferox",
    Icarus_Uprising: "Reset Bomb Forest",
    Animal_Island: "Tortimer Island",
    BalloonFight: "Balloon Fight",
    NintenDogs: "NintenDogs",
    StreetPass: "Find Mii",
    Tomodachi: "Tomodachi Life",
    Pictochat2: "Pictochat 2",
    Mario_Uworld: "Mushroom Kingdom U",
    Mario_Galaxy: "Mario Galaxy",
    Kart_CircuitFor: "Mario Circuit",
    Zelda_Skyward: "Skyloft",
    Kirby_Cave: "Great Cave Offensive",
    Poke_Kalos: "Kalos Pokemon League",
    FE_Colloseum: "Colloseum",
    FlatZoneX: "Flat Zone",
    Icarus_Angeland: "Palutena's Temple",
    Wario_Gamer: "Gamer",
    Pikmin_Garden: "Garden of Hope",
    Animal_City: "Town & City",
    WiiFit: "Wii Fit Studio",
    PunchOutSB: "Boxing Ring (SSB)",
    Xeno_Gaur: "Guar Plains",
    DuckHunt: "Duck Hunt",
    WreckingCrew: "Wrecking Crew",
    Pilotwings: "Pilotwings",
    WufuIsland: "Wuhu Island",
    Sonic_Windyhill: "Windy Hill Zone",
    Rock_Wily: "Wily's Castle",
    Pac_Land: "Pac Land",
    Mario_Maker: "Mario Maker",
    SF_Suzaku: "Suzaku Castle",
    FF_Midgar: "Midgar",
    Bayo_Clock: "Umbra Clock Tower",
    Mario_Odyssey: "New Donk City",
    Zelda_Tower: "Great Plateau Tower",
    Spla_Parking: "Moray Towers",
    Dracula_Castle: "Dracula's Castle",
    Training: "Training",
    Jack_Mementoes: "Mementos",
    Brave_Altar: "Yggdrasil's Altar",
    Buddy_Spiral: "Spiral Mountain",
    Dolly_Stadium: "KoF Stadium",
    FE_Shrine: "Garreg Mach Monastery",
    Tantan_Spring: "Spring Stadium",
    Pickel_World: "Minecraft World",
    FF_Cave: "Northern Cave",
    Xeno_Alst: "Cloud Sea of Alrest",
    Demon_Dojo: "Demon Dojo",
    Trail_Castle: "Hallow Bastion",
    BattleFieldS: "Small Battlfield"
}

// require() all of the stage previews
Object.keys(stageInfo).forEach(key => {
    try {
        require("../../../assets/stage_previews/stage_2_" + key.toLowerCase() + ".jpg")
    } catch {
        console.warn("Could not find stage preview for: " + key);
    }
});

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