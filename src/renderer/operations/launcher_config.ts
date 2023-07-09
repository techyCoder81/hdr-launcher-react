import { Backend } from './backend';

type BooleanSetting = 'skip_launcher' | 'ignore_music' | 'enable_dev_tools';

const CONFIG_PATH = 'ultimate/hdr-config';

export async function setBoolean(
  setting: BooleanSetting,
  enabled: boolean
): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const backend = Backend.instance();
      const sdroot = await backend.getSdRoot();
      const configDir = sdroot + CONFIG_PATH;
      const exists = await backend.fileExists(`${configDir}/${setting}`);
      if (exists && !enabled) {
        // the file exists and should be removed.
        await backend.deleteFile(`${configDir}/${setting}`);
      } else if (!exists && enabled) {
        // the file does not exist and should be created.
        await backend.mkdir(configDir);
        await backend.writeFile(`${configDir}/${setting}`, 'foo');
      }

      resolve();
    } catch (e) {
      alert(`Could not set config setting ${setting}\n${e}`);
      reject(e);
    }
  });
}

export async function getBoolean(setting: BooleanSetting): Promise<boolean> {
  return new Promise<boolean>(async (resolve, reject) => {
    try {
      const backend = Backend.instance();
      const sdroot = await backend.getSdRoot();
      const configDir = sdroot + CONFIG_PATH;
      const exists = await backend.fileExists(`${configDir}/${setting}`);
      if (exists) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      alert(`Could not get config setting ${setting}\n${e}`);
      reject(e);
    }
  });
}
