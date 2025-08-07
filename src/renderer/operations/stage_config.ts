import { Backend } from './backend';
import { Stage, StageInfo } from './stage_info';

export const ACTIVE_CONFIG_FILE = 'ultimate/hdr-config/tourney_mode.json';
export const BACKUP_STAGE_CONFIG = 'ultimate/hdr-config/tourney_mode_backup.json';
export const OFFICIAL_STAGE_CONFIG = 'ultimate/mods/hdr-stages/tourney_mode_official.json';
const CONFIG_PATH = 'ultimate/hdr-config/';

// require() all of the stage previews
new StageInfo().list().then((stages) =>
  stages.forEach((stage) => {
    try {
      require(`../../../assets/stage_previews/stage_2_${stage.name_id.toLowerCase()}.jpg`);
    } catch {
      console.warn(`Could not find stage preview for: ${stage.name_id}`);
    }
  })
);

export interface StageList {
  starters: Stage[];
  counterpicks: Stage[];
}

export interface Page extends StageList {
  name: string;
  useOfficial: boolean;
}

export interface StageConfig {
  enabled: boolean;
  pages: Page[];
}

async function loadStageList(data: any): Promise<StageList> {
  const info = new StageInfo();
  const stageList: StageList = {
    starters: [],
    counterpicks: [],
  }
  // load starters
  const starters: string[] = data?.starters ?? [];
  for (const nameId of starters) {
    try {
      let stage = await info.getById(nameId);
      stage ||= (await info.list())[0]; // default to the first stage if the named stage could not be loaded
      stageList.starters.push(stage);
    } catch (e) {
      console.error(`Error loading stage ${nameId}: ${e}`);
    }
  }

  // load counterpicks
  const counterpicks: string[] = data?.counterpicks ?? [];
  for (const nameId of counterpicks) {
    try {
      let stage = await info.getById(nameId);
      stage ||= (await info.list())[0]; // default to the first stage if the named stage could not be loaded
      stageList.counterpicks.push(stage);
    } catch (e) {
      console.error(`Error loading stage ${nameId}: ${e}`);
    }
  }

  return stageList;
}

async function getOfficialStageList(): Promise<StageList> {
  return new Promise<StageList>(async (resolve, reject) => {
    try {
      const backend = Backend.instance();
      const root = await backend.getSdRoot();
      if (!(await backend.fileExists(root + OFFICIAL_STAGE_CONFIG))) {
        resolve({
          starters:[],
          counterpicks:[],
        });
        return;
      }

      await backend.readFile(root + OFFICIAL_STAGE_CONFIG)
        .then(async (json) => {
          const data = JSON.parse(json);
          const stageList = await loadStageList(data);
          resolve(stageList)
        })
        .catch((e) => reject(e));
    } catch (e) {
      reject(e);
    }
  });
}

async function loadPages(data: any): Promise<Page[]> {
  const pages: Page[] = []
  for (let i = 0; i < data.pages.length; i++) {
    const name = data.pages[i]?.name ?? "Page " + i;
    const useOfficial = data.pages[i]?.useOfficial ?? false;
    let stageList;
    if (useOfficial) {
      stageList = await getOfficialStageList();
    } else {
      stageList = await loadStageList(data.pages[i]);
    }
    pages.push({
      name,
      useOfficial,
      ...stageList
    });
  }
  return pages;
}

export async function loadStageConfig(location: string): Promise<StageConfig> {
  return new Promise<StageConfig>(async (resolve, reject) => {
    try {
      const backend = Backend.instance();
      const root = await backend.getSdRoot();

      // if the config doesn't already exist, default to empty
      if (!(await backend.fileExists(root + location))) {
        resolve({
          enabled: false,
          pages: [],
        });
        return;
      }

      // load the config from the input file
      await backend.readFile(root + location)
        .then(async (json) => {
          const data = JSON.parse(json);
          const enabled: boolean = data.enabled ?? false;
          const pages: Page[] = await loadPages(data);
          resolve({
            enabled: enabled,
            pages: pages,
          })
        })
        .catch((e) => reject(e));
    } catch (e) {
      reject(e);
    }
  });
}

export async function saveStageConfig(location: string, stageConfig: StageConfig): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const backend = Backend.instance();
      const root = await backend.getSdRoot();
      const config = {
        ...stageConfig,
        pages: stageConfig.pages.map((page) => {
          return {
            ...page,
            starters: page.starters.map((stage) => stage.name_id),
            counterpicks: page.counterpicks.map((stage) => stage.name_id)
          }
        })
      }

      const json = JSON.stringify(config);
      const configDir = root + CONFIG_PATH;
      const exists = await backend.fileExists(configDir);
      if (!exists) {
        await backend.mkdir(configDir);
      }

      await Backend.instance().writeFile(root + location, json);
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}