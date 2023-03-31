import { Backend } from './backend';

type BooleanSetting = 'skip_launcher' | 'ignore_music' | 'enable_dev_tools';

const CONFIG_PATH = 'ultimate/hdr-config';

export async function setBoolean(
  setting: BooleanSetting,
  enabled: boolean
): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      let backend = Backend.instance();
      let sdroot = await backend.getSdRoot();
      let configDir = sdroot + CONFIG_PATH;
      let exists = await backend.fileExists(configDir + '/' + setting);
      if (exists) {
        // if the file already exists, then it's enabled.
        resolve();
        return;
      } else {
        await backend.mkdir(configDir);
        await backend.writeFile(configDir + '/' + setting, 'foo');
      }
      resolve();
    } catch (e) {
      alert('Could not set config setting ' + setting + '\n' + e);
      reject(e);
    }
  });
}

export async function getBoolean(setting: BooleanSetting): Promise<boolean> {
  return new Promise<boolean>(async (resolve, reject) => {
    try {
      let backend = Backend.instance();
      let sdroot = await backend.getSdRoot();
      let configDir = sdroot + CONFIG_PATH;
      let exists = await backend.fileExists(configDir + '/' + setting);
      if (exists) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      alert('Could not get config setting ' + setting + '\n' + e);
      reject(e);
    }
  });
}
