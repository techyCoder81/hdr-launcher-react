import { Backend } from './backend';
import { Progress } from 'nx-request-api';
import { getInstallType, getRepoName } from './install';

export async function isAvailable(
  progressCallback?: (p: Progress) => void
): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      var reportProgress = (prog: Progress) => {
        if (typeof progressCallback !== 'undefined') {
          progressCallback(prog);
        }
      };
      let latest = await getLatest(progressCallback);
      let version = await Backend.instance().getVersion();
      if (latest === version) {
        resolve(false);
      } else {
        resolve(true);
      }
    } catch (e) {
      console.warn("Could not determine if an update is available: " + e);
      resolve(false);
    }
  });
}

export async function getLatest(
  progressCallback?: (p: Progress) => void
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      var reportProgress = (prog: Progress) => {
        if (typeof progressCallback !== 'undefined') {
          progressCallback(prog);
        }
      };

      let backend = Backend.instance();
      let current_version = await backend.getVersion();
      let repoName = getRepoName(getInstallType(current_version));

      // get the latest for that repo
      let latest = await backend.getRequest(
        'https://github.com/HDR-Development/' +
          repoName +
          '/releases/latest/download/hdr_version.txt'
      );
      if (latest.startsWith('"') && latest.endsWith('"')) {
        latest = latest.substring(1, latest.length - 1);
      }
      console.info('Latest is ' + latest);
      resolve(latest);
    } catch (e) {
      reject(e);
    }
  });
}

export default async function update(
  progressCallback?: (p: Progress) => void
): Promise<string[]> {
  return new Promise(async (resolve, reject) => {
    try {
      var reportProgress = (prog: Progress) => {
        if (typeof progressCallback !== 'undefined') {
          progressCallback(prog);
        }
      };

      var backend = Backend.instance();
      let sdroot = await backend.getSdRoot();
      reportProgress(
        new Progress('Checking for Updates', 'checking for updates', 1.0)
      );
      let downloads = sdroot + 'downloads/';
      let version_stripped = 'unknown';
      let latest = await getLatest(progressCallback);
      let version = await backend.getVersion();
      let repoName = getRepoName(getInstallType(version));

      if (version === latest) {
        console.info('The latest version was already installed.');
        resolve(['The latest version was already installed!']);
      }

      let changelogs = ["Updates:"];

      console.info('attempting to update chain');
      while (!(version === latest)) {
        reportProgress(
          new Progress('Checking for Updates', 'checking for updates', 1.0)
        );
        version = await backend.getVersion();
        version_stripped = version.split('-')[0];
        console.info('version is: ' + version);
        var versionText = document.getElementById('version');
        if (versionText != null) {
          versionText.innerHTML = 'Version: ' + String(version);
        }
        console.info('latest is: ' + latest);
        if (String(version) == latest) {
          resolve(changelogs);
          //resolve(['Your install has been updated.']);
          return;
        }
        reportProgress(
          new Progress(
            'Updating to ' + version_stripped,
            'Updating to version ' + version,
            0
          )
        );
        let result;
        // try to download the upgrade zip.
        try {
          result = await backend.downloadFile(
            'https://github.com/HDR-Development/' +
              repoName +
              '/releases/download/' +
              version_stripped +
              '/upgrade.zip',
            downloads + 'upgrade.zip',
            (p: Progress) => reportProgress(p)
          );
        } catch (e) {
          // this likely means that 
          reject("An error occurred while downloading upgrade.zip from version " 
            + version 
            + "!\nError info: " + e
            + "\nPlease report this in #help-questions in the HDR Discord, "
            + "as this is likely a packaging issue (not a *you* issue).");
          return;
        }
        console.info(result);

        reportProgress(
          new Progress('Extracting', 'Extracting update' + version, 0)
        );
        await backend.unzip(
          downloads + 'upgrade.zip',
          sdroot,
          progressCallback
        );
        await backend.deleteFile(downloads + 'upgrade.zip');
        await handleDeletions(version, 'deletions.json', progressCallback);
        // get changelogs. If these fail, we should still successfully finish updating.
        try {
          reportProgress(new Progress("Getting Changelog", "Getting changelog" + version, 0));
          let changelog = await backend.getRequest('https://github.com/HDR-Development/' + repoName + '/releases/download/' +
                version_stripped + '/CHANGELOG.md');
          //let changes = processChangelog(changelog);
          //changes.forEach(entry => changelogs.push(entry));
          //console.info("got changelog: " + changelog);
          changelogs.push(changelog);
        } catch (e) {
          console.error("Error while getting changelogs: " + e);
        }
      }
    } catch (e) {
      console.error('During update: ' + e);
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
      var reportProgress = (prog: Progress) => {
        if (typeof progressCallback !== 'undefined') {
          progressCallback(prog);
        }
      };
      // check for files that should be deleted
      let backend = Backend.instance();
      var sdroot = await backend.getSdRoot();

      let downloads = sdroot + 'downloads/';
      let version_stripped = version.split('-')[0];
      let repoName = getRepoName(getInstallType(version));

      let deletions_file = downloads + 'deletions.json';
      await backend.downloadFile(
        'https://github.com/HDR-Development/' +
          repoName +
          '/releases/download/' +
          version_stripped +
          '/' +
          deletions_artifact,
        deletions_file,
        (p: Progress) => reportProgress(p)
      );

      let str = await backend.readFile(deletions_file);
      let entries = JSON.parse(str);
      let count = 0;
      let total = entries.length;
      if (entries.length === undefined) {
        throw new Error('Could not get file deletions!');
      }
      if (entries.length == 0) {
        console.debug('No files to delete.');
        resolve('no files to delete.');
        return;
      }
      while (count < total) {
        let path = entries[count];
        reportProgress(
          new Progress(
            'deleting removed files',
            'file: ' + path,
            count / entries.length
          )
        );

        try {
          // check for the deleted files
          let exists = await backend.fileExists(sdroot + path);
          if (exists) {
            await backend.deleteFile(sdroot + path);
            console.debug('File deleted successfully');
          }
        } catch (e) {
          // for deleting individual files, we can just warn the user to verify later if it fails.
          console.error('Failed to detect/delete file: ' + path);
          alert(
            'Failed to detect/delete certain HDR files. Please run verify to ensure your installation is correct.'
          );
        }
        count++;
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
  let changes_out: string[] = [];
  let changes = changelog.split('\n');
  changes.forEach((line) => {
    if (line.includes('[')) {
      changes_out.push(line.substring(0, line.indexOf('[')));
    }
  });

  return changes_out;
}
