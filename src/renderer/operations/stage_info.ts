export type Stage = {
  name_id: string;
  display_name: string;
};

export class StageInfo {
  private static display_map: Map<string, Stage> = new Map<string, Stage>();

  private static id_map: Map<string, Stage> = new Map<string, Stage>();

  async getByDisplay(display_name: string): Promise<Stage> {
    if (!display_name) {
      throw new Error('display_name was not valid!');
    }
    this.loadCache();
    return StageInfo.display_map.get(display_name)!;
  }

  async getById(name_id: string): Promise<Stage> {
    if (!name_id) {
      throw new Error('display_name was not valid!');
    }
    this.loadCache();
    return StageInfo.id_map.get(name_id)!;
  }

  async list(): Promise<Stage[]> {
    this.loadCache();
    const values = [...StageInfo.display_map.values()];
    return values;
  }

  private loadCache() {
    if (StageInfo.display_map.size == 0) {
      const ids = Object.keys(stageInfo);
      for (const nameId of ids) {
        const display = stageInfo[nameId]?.display_name;
        StageInfo.display_map.set(display, {
          name_id: nameId,
          display_name: display,
        });
        StageInfo.id_map.set(nameId, {
          name_id: nameId,
          display_name: display,
        });
      }
    }
  }
}

export const stageInfo: Record<string, { display_name: string }> = {
  // Random: { display_name: 'Random (All)', },
  // RandomNormal: { display_name: 'Normal Random', },
  BattleField: {
    display_name: 'Battlefield',
  },
  BattleFieldL: {
    display_name: 'Deadline',
  },
  End: {
    display_name: 'Final Destination',
  },
  Mario_Castle64: {
    display_name: "Peach's Castle 64",
  },
  DK_Jungle: {
    display_name: 'Bramble Blast',
  },
  Zelda_Hyrule: {
    display_name: 'Hyrule Castle 64',
  },
  Kirby_Pupupu64: {
    display_name: 'Dreamland',
  },
  Poke_Yamabuki: {
    display_name: 'Saffron City',
  },
  Mario_Past64: {
    display_name: 'Mushroom Kingdom',
  },
  Mario_CastleDx: {
    display_name: "Princess Peach's Castle",
  },
  Mario_Rainbow: {
    display_name: 'Rainbow Cruise',
  },
  DK_WaterFall: {
    display_name: 'Kongo Falls',
  },
  DK_Lodge: {
    display_name: 'Jungle Japes',
  },
  Zelda_Greatbay: {
    display_name: 'Great Bay',
  },
  Zelda_Temple: {
    display_name: 'Hyrule Temple',
  },
  Metroid_ZebesDx: {
    display_name: 'Brinstar',
  },
  Yoshi_Yoster: {
    display_name: "Yoshi's Island (Melee)",
  },
  Yoshi_CartBoard: {
    display_name: "Yoshi's Story",
  },
  Kirby_Fountain: {
    display_name: 'Fountain of Dreams',
  },
  Kirby_Greens: {
    display_name: 'Green Greens',
  },
  Fox_Corneria: {
    display_name: 'Corneria',
  },
  Fox_Venom: {
    display_name: 'Venom',
  },
  Poke_Stadium: {
    display_name: 'Pokémon Stadium',
  },
  Mother_Onett: {
    display_name: 'Onett',
  },
  Mario_PastUsa: {
    display_name: 'Mushroom Kingdom II',
  },
  Metroid_Kraid: {
    display_name: 'Brinstar Depths',
  },
  Yoshi_Story: {
    display_name: "Yoshi's Island (Brawl)",
  },
  Fzero_Bigblue: {
    display_name: 'Big Blue',
  },
  Mother_Fourside: {
    display_name: 'Fourside',
  },
  Mario_Dolpic: {
    display_name: 'Delfino Plaza',
  },
  Mario_PastX: {
    display_name: 'Mushroomy Kingdom',
  },
  Kart_CircuitX: {
    display_name: 'Figure 8 Circuit',
  },
  Wario_Madein: {
    display_name: 'WarioWare, Inc.',
  },
  Zelda_Oldin: {
    display_name: 'Bridge of Elden',
  },
  Metroid_Norfair: {
    display_name: 'Norfair',
  },
  Metroid_Orpheon: {
    display_name: 'Frigate Orpheon',
  },
  Yoshi_Island: {
    display_name: "Yoshi's Island",
  },
  Kirby_Halberd: {
    display_name: 'Halberd',
  },
  Fox_LylatCruise: {
    display_name: 'Lylat Cruise',
  },
  Poke_Stadium2: {
    display_name: 'Pokémon Stadium 2',
  },
  Fzero_Porttown: {
    display_name: 'Port Town Aero Dive',
  },
  FE_Siege: {
    display_name: 'Castle Siege',
  },
  Pikmin_Planet: {
    display_name: 'Distant Planet',
  },
  Animal_Village: {
    display_name: 'Smashville',
  },
  Mother_Newpork: {
    display_name: 'New Pork Town',
  },
  Ice_Top: {
    display_name: 'Summit',
  },
  Icarus_SkyWorld: {
    display_name: 'Skyworld',
  },
  MG_Shadowmoses: {
    display_name: 'Shadow Moses Island',
  },
  LuigiMansion: {
    display_name: "Luigi's Mansion",
  },
  Zelda_Pirates: {
    display_name: "Ganon's Tower",
  },
  Poke_Tengam: {
    display_name: 'Spear Pillar',
  },
  MarioBros: {
    display_name: 'Mario Bros.',
  },
  Plankton: {
    display_name: 'Electroplankton',
  },
  Sonic_Greenhill: {
    display_name: 'Green Hill Zone',
  },
  Mario_3DLand: {
    display_name: '3D Land',
  },
  Mario_NewBros2: {
    display_name: 'Mushroom Kingdom 2',
  },
  Mario_Paper: {
    display_name: 'Paper Mario',
  },
  Zelda_Gerudo: {
    display_name: 'Gerudo Valley',
  },
  Zelda_Train: {
    display_name: 'Spirit Tracks',
  },
  Kirby_Gameboy: {
    display_name: 'Dreamland GB',
  },
  Poke_Unova: {
    display_name: 'Unova Pokemon League',
  },
  Poke_Tower: {
    display_name: 'Prism Tower',
  },
  Fzero_Mutecity3DS: {
    display_name: 'Mute City',
  },
  Mother_Magicant: {
    display_name: 'Magicant',
  },
  FE_Arena: {
    display_name: 'Arena Ferox',
  },
  Icarus_Uprising: {
    display_name: 'Reset Bomb Forest',
  },
  Animal_Island: {
    display_name: 'Tortimer Island',
  },
  BalloonFight: {
    display_name: 'Balloon Fight',
  },
  NintenDogs: {
    display_name: 'NintenDogs',
  },
  StreetPass: {
    display_name: 'Find Mii',
  },
  Tomodachi: {
    display_name: 'Tomodachi Life',
  },
  Pictochat2: {
    display_name: 'Pictochat 2',
  },
  Mario_Uworld: {
    display_name: 'Mushroom Kingdom U',
  },
  Mario_Galaxy: {
    display_name: 'Mario Galaxy',
  },
  Kart_CircuitFor: {
    display_name: 'Mario Circuit',
  },
  Zelda_Skyward: {
    display_name: 'Skyloft',
  },
  Kirby_Cave: {
    display_name: 'Great Cave Offensive',
  },
  Poke_Kalos: {
    display_name: 'Kalos Pokemon League',
  },
  FE_Colloseum: {
    display_name: 'Colloseum',
  },
  FlatZoneX: {
    display_name: 'Flat Zone',
  },
  Icarus_Angeland: {
    display_name: "Palutena's Temple",
  },
  Wario_Gamer: {
    display_name: 'Gamer',
  },
  Pikmin_Garden: {
    display_name: 'Garden of Hope',
  },
  Animal_City: {
    display_name: 'Town & City',
  },
  WiiFit: {
    display_name: 'Wii Fit Studio',
  },
  PunchOutSB: {
    display_name: 'Boxing Ring (SSB)',
  },
  Xeno_Gaur: {
    display_name: 'Guar Plains',
  },
  DuckHunt: {
    display_name: 'Duck Hunt',
  },
  WreckingCrew: {
    display_name: 'Wrecking Crew',
  },
  Pilotwings: {
    display_name: 'Pilotwings',
  },
  WufuIsland: {
    display_name: 'Wuhu Island',
  },
  Sonic_Windyhill: {
    display_name: 'Windy Hill Zone',
  },
  Rock_Wily: {
    display_name: "Wily's Castle",
  },
  Pac_Land: {
    display_name: 'Pac Land',
  },
  Mario_Maker: {
    display_name: 'Mario Maker',
  },
  SF_Suzaku: {
    display_name: 'Suzaku Castle',
  },
  FF_Midgar: {
    display_name: 'Midgar',
  },
  Bayo_Clock: {
    display_name: 'Umbra Clock Tower',
  },
  Mario_Odyssey: {
    display_name: 'New Donk City',
  },
  Zelda_Tower: {
    display_name: 'Great Plateau Tower',
  },
  Spla_Parking: {
    display_name: 'Moray Towers',
  },
  Dracula_Castle: {
    display_name: "Dracula's Castle",
  },
  // Training: { display_name: 'Training', },
  Jack_Mementoes: {
    display_name: 'Mementos',
  },
  Brave_Altar: {
    display_name: "Yggdrasil's Altar",
  },
  Buddy_Spiral: {
    display_name: 'Spiral Mountain',
  },
  Dolly_Stadium: {
    display_name: 'KoF Stadium',
  },
  FE_Shrine: {
    display_name: 'Garreg Mach Monastery',
  },
  Tantan_Spring: {
    display_name: 'Spring Stadium',
  },
  Pickel_World: {
    display_name: 'Minecraft World',
  },
  FF_Cave: {
    display_name: 'Northern Cave',
  },
  Xeno_Alst: {
    display_name: 'Cloud Sea of Alrest',
  },
  Demon_Dojo: {
    display_name: 'Demon Dojo',
  },
  Trail_Castle: {
    display_name: 'Hallow Bastion',
  },
  BattleFieldS: {
    display_name: 'Small Battlefield',
  },
};
