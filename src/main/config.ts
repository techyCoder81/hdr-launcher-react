import * as fs from 'fs';
import * as os from 'os';
import xdg from 'xdg-portable';

export default class Config {
  private static CONFIG_FILE = 'launcher-config.json';

  ryuPath: string = '';

  sdcardPath: string = '';

  private static createFile() {
    if (!fs.existsSync(Config.configFilePath())) {
      const configStr = JSON.stringify({
        ryuPath: null,
        sdcardPath: null,
      });
      fs.writeFileSync(Config.configFilePath(), configStr);
    }
  }

  private static readFile(): Config {
    // create the file if necessary
    Config.createFile();

    // read the file
    return JSON.parse(
      fs.readFileSync(Config.configFilePath(), 'utf-8')
    ) as Config;
  }

  private static saveConfig(config: Config) {
    fs.writeFileSync(Config.configFilePath(), JSON.stringify(config));
  }

  static getRyuPath() {
    const config = Config.readFile();
    return config.ryuPath;
  }

  static setRyuPath(path: string) {
    const config = Config.readFile();
    config.ryuPath = path;
    Config.saveConfig(config);
  }

  static getSdcardPath() {
    const config = Config.readFile();
    return config.sdcardPath;
  }

  static setSdcardPath(path: string) {
    const config = Config.readFile();
    config.sdcardPath = path;
    Config.saveConfig(config);
  }

  // Ensure that the config file only lives in one place on linux
  // Path is `/home/user/.config/hdr-launcher/launcher-config.json`
  private static configFilePath() {
    if (os.platform() == 'linux') {
      return xdg.config() + '/hdr-launcher/' + this.CONFIG_FILE;
    }

    return this.CONFIG_FILE;
  }

  private constructor() {}
}
