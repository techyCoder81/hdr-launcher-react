import { Backend } from './backend';
import { fromDisplay, stageInfo, toDisplay } from './stage_info';

const ACTIVE_CONFIG_FILE = 'ultimate/hdr-config/tourney_mode.json';
const BACKUP_STAGE_CONFIG = 'ultimate/hdr-config/tourney_mode_backup.json';
const CONFIG_PATH = 'ultimate/hdr-config/';

// require() all of the stage previews
Object.keys(stageInfo).forEach((key) => {
  try {
    require('../../../assets/stage_previews/stage_2_' +
      key.toLowerCase() +
      '.jpg');
  } catch {
    console.warn('Could not find stage preview for: ' + key);
  }
});


/**
 * this mirrors the tourney config in the plugin
 */
export type ConfigData = {
  enabled: boolean,
  starters: string[],
  counterpicks: string[]
};

/**
 * singleton class representing the currently configured tourney mode
 */
export class TourneyConfig {
  public data: ConfigData | undefined;

  private static singleton: undefined | TourneyConfig;

  private constructor() {}

  /**
   * gets the singleton instance of the stage config
   * @returns the instance of the StageConfig
   */
  static instance() {
    if (this.singleton === undefined) {
      this.singleton = new TourneyConfig();
    }
    return this.singleton;
  }

  /**
   * loads the currently tourney config from the sd card
   * @returns void when completed
   */
  async load(): Promise<ConfigData> {
    return new Promise<ConfigData>(async (resolve, reject) => {
      try {
        let backend = Backend.instance();
        let root = await backend.getSdRoot();

        if (this.data != undefined) {
          resolve(this.data);
          return;
        }

        // if the config doesn't already exist, default to empty
        if (!(await backend.fileExists(root + ACTIVE_CONFIG_FILE))) {
          this.data = {enabled: false, starters: [], counterpicks: []};
          resolve(this.data);
          return;
        }

        await backend
          .readFile(root + ACTIVE_CONFIG_FILE)
          .then(json => {
            let data: ConfigData = JSON.parse(json);
            data.counterpicks = data.counterpicks.map(properName => toDisplay(properName))
            data.starters = data.starters.map(properName => toDisplay(properName))
            this.data = data;
            resolve(data);
          })
          .catch((e) => reject(e));
      } catch (e) {
        reject(e);
      }
    });
  }

  async resetDefaults(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        this.data = {enabled: false, starters: [], counterpicks: []};
        await this.save();
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  async save(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (this.data === undefined) {
          reject('the json data is not loaded!');
          return;
        }

        let root = await Backend.instance().getSdRoot();
        let config: ConfigData = {enabled: this.data.enabled, starters: [], counterpicks: []};
        config.counterpicks = this.data.counterpicks.map(display => fromDisplay(display));
        config.starters = this.data.starters.map(display => fromDisplay(display));
        let json = JSON.stringify(config);
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

}
