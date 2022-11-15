import { Backend } from './backend'
import { Progress } from "nx-request-api";
import { handleDeletions } from './update';
import verify from './verify';

export enum InstallType {
  Beta,
  Nightly,
  Unknown
}

export function getInstallType(version: string): InstallType {
  if (version.toLowerCase().includes("nightly")) {
    return InstallType.Nightly;
  } else if (version.toLowerCase().includes("beta")) {
    return InstallType.Beta;
  } else {
    return InstallType.Unknown;
  }
}

export function getRepoName(type: InstallType) {
  switch(type) {
    case InstallType.Beta:
      return "HDR-Releases";
    case InstallType.Nightly:
      return "HDR-Nightlies";
    default:
      return "unknown";
  }
}

export async function installLatest(progressCallback?: (p: Progress) => void, type?: InstallType) {
  if (typeof type === 'undefined') {
    console.info("defaulting to beta installation");
    return installArtifact("switch-package.zip", "latest", InstallType.Beta, progressCallback);
  }
  
  return installArtifact("switch-package.zip", "latest", type, progressCallback);
}

export async function switchToNightly(currentVersion: string, progressCallback?: (p: Progress) => void) {
  return installArtifact("to-nightly.zip", currentVersion, InstallType.Beta, progressCallback)
    .then(() => handleDeletions(currentVersion, "to_nightly_deletions.json", progressCallback));
}

export async function switchToBeta(currentVersion: string, progressCallback?: (p: Progress) => void) {
  return installArtifact("to-beta.zip", currentVersion, InstallType.Nightly, progressCallback)
    .then(() => handleDeletions(currentVersion, "to_beta_deletions.json", progressCallback));
}

async function installArtifact(artifact: string, version: string, type: InstallType, progressCallback?: (p: Progress) => void) {
  try {
    var backend = Backend.instance();
    var sdroot = ''

    await backend
      .getSdRoot()
      .then(value => {
        sdroot = value
      })
      .catch(e => {
        console.error('Could not get SD root. ' + e)
        return
      })

    if (progressCallback) {
      progressCallback(new Progress("Checking version", "Checking", null));
    }

    let downloads = sdroot + 'downloads/';

    console.info("version: " + version);

    let repoName = getRepoName(type);

    let url = version == "latest" ? 
      'https://github.com/HDR-Development/' + repoName + '/releases/latest/download/' + artifact
      : 'https://github.com/HDR-Development/' + repoName + '/releases/download/' + version.split('-')[0] + '/' + artifact;

    console.info("downloading from: " + url);
    if (progressCallback) {
      progressCallback(new Progress("Downloading " + artifact, "Downloading", null));
    }
    await backend.downloadFile(
        url,
        downloads + 'hdr-install.zip',
        progressCallback
      ).then(result => console.info("Result of download: " + result))
      .then(() => {
        if (progressCallback) {
          progressCallback(new Progress("Extracting", "Extracting files", 0));
        }
      })
      .then(() => backend.unzip(downloads + "hdr-install.zip", sdroot, progressCallback))
      .then(result => console.info("Result of extraction: " + result))
      .catch(e => {
        console.error("Error during install! " + e);
        alert("Error during install: " + e);
      });
    } catch (e) {
      alert("Exception while installing: " + e);
    }
}