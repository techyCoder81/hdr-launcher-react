import { Progress } from 'nx-request-api';
import { Backend } from './backend';
import { handleDeletions } from './update';
import verify from './verify';

export enum InstallType {
  Beta,
  PreRelease,
  Unknown,
}

export function getInstallType(version: string): InstallType {
  if (version.toLowerCase().includes('prerelease')) {
    return InstallType.PreRelease;
  }
  if (version.toLowerCase().includes('beta')) {
    return InstallType.Beta;
  }
  return InstallType.Unknown;
}

export function getRepoName(type: InstallType) {
  switch (type) {
    case InstallType.Beta:
      return 'HDR-Releases';
    case InstallType.PreRelease:
      return 'HDR-PreReleases';
    default:
      return 'unknown';
  }
}

export async function installLatest(
  progressCallback?: (p: Progress) => void,
  type?: InstallType
) {
  if (typeof type === 'undefined') {
    console.info('defaulting to beta installation');
    return installArtifact(
      'switch-package.zip',
      'latest',
      InstallType.Beta,
      progressCallback
    );
  }

  return installArtifact(
    'switch-package.zip',
    'latest',
    type,
    progressCallback
  );
}

export async function switchToPrerelease(
  currentVersion: string,
  progressCallback?: (p: Progress) => void
) {
  return installArtifact(
    'to-prerelease.zip',
    currentVersion,
    InstallType.Beta,
    progressCallback
  ).then(() =>
    handleDeletions(
      currentVersion,
      'to_prerelease_deletions.json',
      progressCallback
    )
  );
}

export async function switchToBeta(
  currentVersion: string,
  progressCallback?: (p: Progress) => void
) {
  return installArtifact(
    'to-beta.zip',
    currentVersion,
    InstallType.PreRelease,
    progressCallback
  ).then(() =>
    handleDeletions(currentVersion, 'to_beta_deletions.json', progressCallback)
  );
}

async function installArtifact(
  artifact: string,
  version: string,
  type: InstallType,
  progressCallback?: (p: Progress) => void
) {
  try {
    const backend = Backend.instance();
    let sdroot = '';

    await backend
      .getSdRoot()
      .then((value) => {
        sdroot = value;
      })
      .catch((e) => {
        console.error(`Could not get SD root. ${e}`);
      });

    if (progressCallback) {
      progressCallback(new Progress('Checking version', 'Checking', null));
    }

    const downloads = `${sdroot}downloads/`;

    console.info(`version: ${version}`);

    const repoName = getRepoName(type);

    const url =
      version == 'latest'
        ? `https://github.com/HDR-Development/${repoName}/releases/latest/download/${artifact}`
        : `https://github.com/HDR-Development/${repoName}/releases/download/${
            version.split('-')[0]
          }/${artifact}`;

    console.info(`downloading from: ${url}`);
    if (progressCallback) {
      progressCallback(
        new Progress(`Downloading ${artifact}`, 'Downloading', null)
      );
    }
    await backend
      .downloadFile(url, `${downloads}hdr-install.zip`, progressCallback)
      .then((result) => console.info(`Result of download: ${result}`))
      .then(() => {
        if (progressCallback) {
          progressCallback(new Progress('Extracting', 'Extracting files', 0));
        }
      })
      .then(() =>
        backend.unzip(`${downloads}hdr-install.zip`, sdroot, progressCallback)
      )
      .then((result) => console.info(`Result of extraction: ${result}`))
      .catch((e) => {
        console.error(`Error during install! ${e}`);
        alert(`Error during install: ${e}`);
      });
  } catch (e) {
    alert(`Exception while installing: ${e}`);
  }
}
