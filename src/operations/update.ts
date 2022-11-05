import { resolve } from '../../webpack/main.webpack';
import { Backend } from '../backend'
import { Progress } from '../progress';
import { getInstallType, getRepoName } from './install';

export async function isAvailable(progressCallback?: (p: Progress) => void): Promise<boolean> {
  return new Promise(async (resolve) => {
    var reportProgress = (prog: Progress) => {
      if (typeof progressCallback !== 'undefined') {
        progressCallback(prog);
      }
    }
    let latest = await getLatest(progressCallback);
    let version = await Backend.instance().getVersion();
    if (latest === version) {
      resolve(false);
    } else {
      resolve(true);
    }
  });
}

export async function getLatest(progressCallback?: (p: Progress) => void): Promise<string> {
  return new Promise(async (resolve) => {
    var reportProgress = (prog: Progress) => {
      if (typeof progressCallback !== 'undefined') {
        progressCallback(prog);
      }
    }

    let backend = Backend.instance();
    let current_version = await backend.getVersion();
    let repoName = getRepoName(getInstallType(current_version));

    // get the latest for that repo
    let latest = String(await backend.getRequest(
      'https://github.com/HDR-Development/' + repoName + '/releases/latest/download/hdr_version.txt'
    ));
    if (latest.startsWith("\"") && latest.endsWith("\"")) {
      latest = latest.substring(1, latest.length-1);
    }
    console.info('Latest is ' + latest);
    resolve(latest);
  });
}

export default async function update(progressCallback?: (p: Progress) => void): Promise<string> {
  return new Promise(async (resolve, reject) => {
    var reportProgress = (prog: Progress) => {
      if (typeof progressCallback !== 'undefined') {
        progressCallback(prog);
      }
    }
    
    var backend = Backend.instance();
    let sdroot = await backend.getSdRoot();
    reportProgress(new Progress("Checking for Updates", "checking for updates", 100));
    let downloads = sdroot + 'downloads/'
    let version_stripped = 'unknown'
    let latest = await getLatest(progressCallback);
    let version = await backend.getVersion();
    let repoName = getRepoName(getInstallType(version));

    if (version === latest) {
      console.info("The latest version is already installed.");
      resolve("The latest version is already installed!");
    }

    console.info('attempting to update chain')
    while (!(version === latest)) {
      reportProgress(new Progress("Checking for Updates", "checking for updates", 100));
      await backend
        .getVersion()
        .then(ver => {
          version = ver
          version_stripped = version.split('-')[0]
          console.info('version is: ' + ver)
          var versionText = document.getElementById('version')
          if (versionText != null) {
            versionText.innerHTML = 'Version: ' + String(version)
          }
          console.info('latest is: ' + latest);
          if (String(version) == latest) {
            resolve("no need to update further.");
          }
          reportProgress(new Progress("Checking for Updates", "checking for updates for " + version, 0));
        })
        .then(() =>
          backend.downloadFile(
            'https://github.com/HDR-Development/' + repoName + '/releases/download/' +
              version_stripped +
              '/upgrade.zip',
            downloads + 'upgrade.zip',
            (p: Progress) => reportProgress(p)
          )
        )
        .then(result => console.info('Result:' + result))
        .then(() => {
          reportProgress(new Progress("Extracting", "Extracting update" + version, 0));
        })
        .then(() => backend.unzip(downloads + 'upgrade.zip', sdroot))
        .then(result => console.info(result))
        .then(() => backend.deleteFile(downloads + 'upgrade.zip'))

        .then(() => handleDeletions(version, "deletions.json", progressCallback))
        .catch(e => {console.error(e);reject(e);});
    }
  });
}

/**
 * handles deleting files based on a deletions.json or equivalent
 * @param version the version to download from
 * @param deletions_artifact the deletions file name
 * @param progressCallback optional progress callback
 */
export async function handleDeletions(version: string, deletions_artifact: string, progressCallback?: (p: Progress) => void) {
  // check for files that should be deleted
  let backend = Backend.instance();
  var sdroot = ''
  await backend
    .getSdRoot()
    .then(value => {
      sdroot = value
    })
    .catch(e => {
      console.error('Could not get SD root. ' + e)
      return
    });

  let downloads = sdroot + 'downloads/';
  let version_stripped = version.split('-')[0];
  let repoName = getRepoName(getInstallType(version));

  let deletions_file = downloads + 'deletions.json';
  await backend.downloadFile(
    'https://github.com/HDR-Development/' + repoName + '/releases/download/' +
      version_stripped +
      '/' + deletions_artifact,
    deletions_file,
    (p: Progress) => {if (typeof progressCallback !== 'undefined') {progressCallback(p);}}
  )
  .then(result => console.info(result))
  .catch(e => console.error(e))
  await backend
    .readFile(deletions_file)
    .then(async str => {
      let entries = JSON.parse(str)
      let count = 0
      let total = entries.length
      if (entries.length === undefined) {
        throw new Error('Could not get file deletions!')
      }
      if (entries.length == 0) {
        console.debug("No files to delete.");
      }
      while (count < total) {
        let path = entries[count];
        if (typeof progressCallback !== 'undefined') {
          progressCallback(
            new Progress(
              "deleting removed files", 
              "file: " + path, 
              Math.trunc((100 * count) / entries.length)
            )
          );
        }

        await backend.fileExists(sdroot + path).then()

        // check for the deleted files
        await backend
          .fileExists(sdroot + path)
          .then(async exists => {if (exists) {
            await backend.deleteFile(sdroot + path)
              .then(() => console.info("File deleted successfully"))
              .catch(e => {
                console.error(
                  'Error while deleting file: ' + path + '\nError: ' + e
                );
              })
          }})
          .catch(e => {
            console.error(
              'Error while checking if file exists: ' + path + '\nError: ' + e
            );
          })
        count++
      }
      console.info('deleted all removed files.');
    })
    .catch(e => {
      console.error('Major error while handling deletions: ' + e);
      alert("Error while handling deletions: " + e);
    })
}

