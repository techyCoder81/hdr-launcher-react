import { Backend } from './backend';
import { Stage, StageInfo } from './stage_info';

const ACTIVE_CONFIG_FILE = 'ultimate/hdr-config/tourney_mode.json';
const BACKUP_STAGE_CONFIG = 'ultimate/hdr-config/tourney_mode_backup.json';
const CONFIG_PATH = 'ultimate/hdr-config/';


// require() all of the stage previews
new StageInfo().list().then(stages => stages.forEach(stage => {
  try {
    require('../../../assets/stage_previews/stage_2_' +
      stage.name_id.toLowerCase() +
      '.jpg');
  } catch {
    console.warn('Could not find stage preview for: ' + stage.name_id);
  }
}));


/**
 * the ephemeral configuration data
 */
export class ConfigData {
  public enabled: boolean;
  public starters: Stage[];
  public counterpicks: Stage[];

  constructor(enabled: boolean, starters: Stage[], counterpicks: Stage[]) {
    this.enabled = enabled;
    this.starters = starters;
    this.counterpicks = counterpicks;
  }

  public includes(stage: Stage) {
    return !(this.starters.find(thisStage => stage.name_id === thisStage.name_id) === undefined
      || this.counterpicks.find(thisStage => stage.name_id === thisStage.name_id) === undefined);
  }
};

/**
 * this mirrors the tourney config in the plugin, written to the json file
 */
export type FileFormat = {
  enabled: boolean,
  starters: string[],
  counterpicks: string[];
}

/**
   * loads the currently tourney config from the sd card
   * @returns void when completed
   */
export async function load(): Promise<ConfigData> {
  return new Promise<ConfigData>(async (resolve, reject) => {
    try {
      let backend = Backend.instance();
      let root = await backend.getSdRoot();

      // if the config doesn't already exist, default to empty
      if (!(await backend.fileExists(root + ACTIVE_CONFIG_FILE))) {
        let data = new ConfigData(false, [], []);
        resolve(data);
        return;
      }

      await backend
        .readFile(root + ACTIVE_CONFIG_FILE)
        .then(async json => {
          let fileData: FileFormat = JSON.parse(json);
          let info = new StageInfo();
          let data = new ConfigData(false, [], []);
          data.enabled = fileData.enabled;
          data.counterpicks = [];
          for (const nameId of fileData.counterpicks) {
            try {
              let stage = await info.getById(nameId);
              if (!stage) {
                // default to the first stage if the named stage could not be loaded
                stage = (await info.list())[0];
              }
              data.counterpicks.push(stage);
            } catch (e) {
              console.error("Error loading stage " + nameId + ": " + e);
            }
          }
          data.starters = [];
          for (const nameId of fileData.starters) {
            try {
              data.starters.push(await info.getById(nameId));
            } catch (e) {
              console.error("Error loading stage " + nameId + ": " + e);
            }
          }

          resolve(data);
        })
        .catch((e) => reject(e));
    } catch (e) {
      reject(e);
    }
  });
}

export async function save(data: ConfigData): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      let backend = Backend.instance();
      let root = await backend.getSdRoot();
      let config: FileFormat = {enabled: data.enabled, starters: [], counterpicks: []};
      let info = new StageInfo();
      config.counterpicks = data.counterpicks.map(stage => stage.name_id);
      config.starters = data.starters.map(stage => stage.name_id);
      let json = JSON.stringify(config);

      let configDir = root + CONFIG_PATH;
      let exists = await backend.fileExists(configDir);
      if (!exists) {
        await backend.mkdir(configDir);
      }

      await Backend.instance().writeFile(
        root + ACTIVE_CONFIG_FILE,
        json
      );
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}
