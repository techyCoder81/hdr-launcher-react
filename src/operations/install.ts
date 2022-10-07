import { Backend } from '../backend'
import { Progress } from '../progress';
import verify from './verify';

export default async function install_latest(progressCallback?: (p: Progress) => void) {
  var reportProgress = (prog: Progress) => {
    if (typeof progressCallback !== 'undefined') {
      progressCallback(prog);
    }
  }
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
    let downloads = sdroot + 'downloads/';

    reportProgress(new Progress("Downloading the latest HDR nightly", "downloading HDR", null));


    await backend.downloadFile(
        'https://github.com/HDR-Development/HDR-Nightlies/releases/latest/download/switch-package.zip',
        downloads + 'hdr-install.zip',
        (p: Progress) => reportProgress(p)
      ).then(result => console.info("Result of download: " + result))
      .then(() => {
        reportProgress(new Progress("Extracting", "Extracting files", null));
      })
      .then(() => backend.unzip(downloads + "hdr-install.zip", sdroot))
      .then(result => console.info("Result of extraction: " + result))
      .then(() => verify(progressCallback))
      .catch(e => {
        console.error("Error during install! " + e);
        alert("Error during install: " + e);
      });
}