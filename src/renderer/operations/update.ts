import { Progress } from 'nx-request-api';
import { Backend } from './backend';
import { getInstallType, getRepoName } from './install';
import path from 'path';

export async function isAvailable(
  progressCallback?: (p: Progress) => void
): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const reportProgress = (prog: Progress) => {
        if (typeof progressCallback !== 'undefined') {
          progressCallback(prog);
        }
      };
      const latest = await getLatest(progressCallback);
      const version = await Backend.instance().getVersion();
      if (latest === version) {
        resolve(false);
      } else {
        resolve(true);
      }
    } catch (e) {
      console.warn(`Could not determine if an update is available: ${e}`);
      resolve(false);
    }
  });
}

export async function getLatest(
  progressCallback?: (p: Progress) => void
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const reportProgress = (prog: Progress) => {
        if (typeof progressCallback !== 'undefined') {
          progressCallback(prog);
        }
      };

      const backend = Backend.instance();
      const current_version = await backend.getVersion();
      const repoName = getRepoName(getInstallType(current_version));

      // get the latest for that repo
      let latest = await backend.getRequest(
        `https://github.com/HDR-Development/${repoName}/releases/latest/download/hdr_version.txt`
      );
      if (latest.startsWith('"') && latest.endsWith('"')) {
        latest = latest.substring(1, latest.length - 1);
      }
      console.info(`Latest is ${latest}`);
      resolve(latest);
    } catch (e) {
      reject(e);
    }
  });
}

export interface UpdateResult {
  updated: boolean;
  text: string[];
}

export default async function update(
  progressCallback?: (p: Progress) => void
): Promise<UpdateResult> {
  return new Promise(async (resolve, reject) => {
    try {
      const reportProgress = (prog: Progress) => {
        if (typeof progressCallback !== 'undefined') {
          progressCallback(prog);
        }
      };

      const backend = Backend.instance();
      const sdroot = await backend.getSdRoot();
      reportProgress(
        new Progress('Checking for Updates', 'checking for updates', 1.0)
      );
      const downloads = `${sdroot}downloads/`;
      let versionStripped = 'unknown';
      const latest = await getLatest(progressCallback);
      let version = await backend.getVersion();
      const repoName = getRepoName(getInstallType(version));

      if (version === latest) {
        console.info('The latest version was already installed.');
        resolve({
          updated: false,
          text: ['The latest version was already installed!'],
        });
      }

      const changelogs = ['Updates:'];

      console.info('attempting to update chain');
      while (!(version === latest)) {
        reportProgress(
          new Progress('Checking for Updates', 'checking for updates', 1.0)
        );
        version = await backend.getVersion();
        versionStripped = version.split('-')[0];
        console.info(`version is: ${version}`);
        const versionText = document.getElementById('version');
        if (versionText != null) {
          versionText.innerHTML = `Version: ${String(version)}`;
        }
        console.info(`latest is: ${latest}`);
        if (String(version) === latest) {
          resolve({ updated: true, text: changelogs });
          // resolve(['Your install has been updated.']);
          return;
        }
        reportProgress(
          new Progress(
            `Updating to ${versionStripped}`,
            `Updating to version ${version}`,
            0
          )
        );
        let result;
        // try to download the upgrade zip.
        try {
          result = await backend.downloadFile(
            `https://github.com/HDR-Development/${repoName}/releases/download/${versionStripped}/upgrade.zip`,
            `${downloads}upgrade.zip`,
            (p: Progress) => reportProgress(p)
          );
        } catch (e) {
          // this likely means that
          reject(
            new Error(
              `An error occurred while downloading upgrade.zip from version ${version}!\nError info: ${e}\nPlease report this in #help-questions in the HDR Discord, ` +
                `as this is likely a packaging issue (not a *you* issue).`
            )
          );
          return;
        }
        console.info(result);

        reportProgress(
          new Progress('Extracting', `Extracting update${version}`, 0)
        );
        await backend.unzip(
          `${downloads}upgrade.zip`,
          sdroot,
          progressCallback
        );
        await backend.deleteFile(`${downloads}upgrade.zip`);
        await handleDeletions(version, 'deletions.json', progressCallback);
        // get changelogs. If these fail, we should still successfully finish updating.
        try {
          reportProgress(
            new Progress('Getting Changelog', `Getting changelog${version}`, 0)
          );
          const changelog = await backend.getRequest(
            `https://github.com/HDR-Development/${repoName}/releases/download/${versionStripped}/CHANGELOG.md`
          );
          // let changes = processChangelog(changelog);
          // changes.forEach(entry => changelogs.push(entry));
          // console.info("got changelog: " + changelog);
          changelogs.push(changelog);
        } catch (e) {
          console.error(`Error while getting changelogs: ${e}`);
        }
      }
    } catch (e) {
      console.error(`During update: ${e}`);
      reject(e);
    }
  });
}

/**
 * handles deleting files based on a deletions.json or equivalent
 * @param version the version to download from
 * @param deletions_artifact the deletions file name
 * @param progressCallback optional progress callback
 */
export async function handleDeletions(
  version: string,
  deletions_artifact: string,
  progressCallback?: (p: Progress) => void
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const reportProgress = (prog: Progress) => {
        if (typeof progressCallback !== 'undefined') {
          progressCallback(prog);
        }
      };
      // check for files that should be deleted
      const backend = Backend.instance();
      const sdroot = await backend.getSdRoot();

      const downloads = `${sdroot}downloads/`;
      const versionStripped = version.split('-')[0];
      const repoName = getRepoName(getInstallType(version));

      const deletions_file = `${downloads}deletions.json`;
      await backend.downloadFile(
        `https://github.com/HDR-Development/${repoName}/releases/download/${versionStripped}/${deletions_artifact}`,
        deletions_file,
        (p: Progress) => reportProgress(p)
      );

      // check for hdr-launcher.nro and delete it if we're on emulator
      const platform = await backend.getPlatform();
      const nroPath = path.join('atmosphere', 'contents', '01006A800016E000', 'romfs', 'skyline', 'plugins', 'hdr-launcher.nro');
      try {
        if (platform === "Emulator") {
          const exists = await backend.fileExists(sdroot + nroPath);
          if (exists) {
            await backend.deleteFile(sdroot + nroPath);
            console.debug('hdr-launcher.nro deleted successfully');
          }
        }
      } catch (e) {
        console.error(`Failed to detect/delete file: ${nroPath}`);
      }

      const str = await backend.readFile(deletions_file);
      const entries = JSON.parse(str);
      let count = 0;
      const total = entries.length;
      if (entries.length === undefined) {
        throw new Error('Could not get file deletions!');
      }
      if (entries.length === 0) {
        console.debug('No files to delete.');
        resolve('no files to delete.');
        return;
      }
      while (count < total) {
        const path = entries[count];
        reportProgress(
          new Progress(
            'deleting removed files',
            `file: ${path}`,
            count / entries.length
          )
        );

        try {
          // check for the deleted files
          const exists = await backend.fileExists(sdroot + path);
          if (exists) {
            await backend.deleteFile(sdroot + path);
            console.debug('File deleted successfully');
          }
        } catch (e) {
          // for deleting individual files, we can just warn the user to verify later if it fails.
          console.error(`Failed to detect/delete file: ${path}`);
          alert(
            'Failed to detect/delete certain HDR files. Please run verify to ensure your installation is correct.'
          );
        }
        count += 1;
      }

      console.info('done deleting removed files.');
      resolve('done deleting files.');
    } catch (e) {
      reject(e);
    }
  });
}

const MERGED_STRING = '**Merged pull requests:**';
const CHANGELOG_GENERATOR_STRING = '* *This Changelog';

function processChangelog(changelog: string): string[] {
  const changesOut: string[] = [];
  const changes = changelog.split('\n');
  changes.forEach((line) => {
    if (line.includes('[')) {
      changesOut.push(line.substring(0, line.indexOf('[')));
    }
  });

  return changesOut;
}
