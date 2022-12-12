import { useRef } from "react";
import { Backend } from "../../operations/backend";
import { StageConfig } from "../../operations/stage_config";
import { FocusButton } from "../buttons/focus_button";
import { FocusCheckbox } from "../buttons/focus_checkbox";

const stageInfo: Record<string, string> = {
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
    Yoshi_Story: "Yoshi's Island (Brawl)'",
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
    Xeno_Guar: "Guar Plains",
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
    Dolly_Stadium: "King of Fighters Stadium",
    FE_Shrine: "Garreg Mach Monastery",
    Tantan_Spring: "Spring Stadium",
    Pickel_World: "Minecraft World",
    FF_Cave: "Northern Cave",
    Xeno_Alst: "Cloud Sea of Alrest",
    Demon_Dojo: "Demon Dojo",
    Trail_Castle: "Hallow Bastion",
    BattleFieldS: "Small Battlfield"
}

export default function StageEntry(props: {stageName: string, onClick: () => Promise<void>, enabled: boolean}) {
    const selfRef = useRef<HTMLButtonElement>(null);

    return <FocusButton
        ref={selfRef}
        children={<input className="focus-check" type="checkbox" readOnly checked={props.enabled}/>}
        onClick={() => {return props.onClick();}}
        className={"main-buttons smaller-main-button"}
        text={(stageInfo[props.stageName] ? stageInfo[props.stageName] : props.stageName) + "\u00A0"}
        onFocus={() => {
            if (selfRef != null && Backend.isSwitch()) {
                let sibling = selfRef.current?.nextElementSibling;
                if (sibling !== null && sibling !== undefined) {
                    if (sibling.getBoundingClientRect().top > window.innerHeight - 70) {
                        sibling.scrollIntoView(false);
                    }
                }

                let prev_sibling = selfRef.current?.previousElementSibling;
                if (prev_sibling !== null && prev_sibling !== undefined) {
                    if (prev_sibling.getBoundingClientRect().top < 50) {
                        prev_sibling.scrollIntoView(true);
                    }
                }
            }
        }}
    />
}
