import { Backend } from '../backend'
import { Progress } from '../progress'
import { PathList } from '../responses'

export default async function verify (progressCallback?: (p: Progress) => void) {
  var backend = Backend.instance()
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

  let downloads = sdroot + 'downloads/'
  let version = 'unknown'
  await backend.getVersion().then(ver => {
    version = ver
    console.debug('version is: ' + ver)
  })

  let version_stripped = version.split('-')[0]
  let hash_file = downloads + 'content_hashes.json'
  
  // get the hashes file from github
  await backend
    .downloadFile(
      'https://github.com/HDR-Development/HDR-Nightlies/releases/download/' +
        version_stripped +
        '/content_hashes.json',
      hash_file,
      (p: Progress) => {if (typeof progressCallback !== 'undefined') {progressCallback(p);}}
    )
    .then(result => console.info(result))
    .catch(e => console.error(e))
  let matches = true
  
  await backend
    // read the hash file
    .readFile(hash_file)
    .then(async str => {
      let entries = JSON.parse(str)
      let count = 0
      let total = entries.length
      if (entries.length === undefined || entries.length == 0) {
        throw new Error('Could not get file hashes!')
      }

      let missing = [];
      let wrong: any[] = [];
      let errors: string[] = [];

      // check to make sure every file has the right hash
      while (count < total) {
        let path = entries[count].path
        let expected_hash = entries[count].hash

        if (typeof progressCallback !== 'undefined') {
          progressCallback(
            new Progress(
              "verifying", 
              "file: " + path, 
              String(Math.trunc((100 * count) / entries.length)) + '%'
            )
          );
        }

        let exists = await backend.fileExists(sdroot + path)

        if (exists) {
          //console.debug("Checking file " + path + ", with expected hash: " + expected_hash);
          await backend
            .getMd5(sdroot + path)
            .then(hash => {
              if (hash != expected_hash) {
                matches = false
                console.error(
                  'hash was wrong for ' + path + '\nGot: ' + hash + ', Expected: ' + expected_hash
                )
                wrong.push(path);
              }
            })
            .catch(e => {
              matches = false
              console.error(
                'Error while getting hash for path :' + path + '\nError: ' + e
              )
              errors.push(path + ": " + e);
            })
        } else {
          // file did not exist, report error
          missing.push(path);
        }
        count++
      }

      // check for any files which should not exist in the HDR folders
      let expected_files: string[] = [];
      let unexpected_files: string[] = [];
      entries.forEach((element: any) => expected_files.push(element.path.replace(/\\/g, "/")));

      let hdr_folders = [
        "ultimate/mods/hdr",
        "ultimate/mods/hdr-stages",
        "ultimate/mods/hdr-assets",
      ];

      for (const folder of hdr_folders) {
        // check the hdr dirs
        let hdr_files =  (await backend.listDirAll(sdroot + folder)).toList("/" + folder)
            .map(str => str.replace(/\\/g, "/"));
        console.info("got " + folder + " files");
        
        for (const element of hdr_files) {
          if (!expected_files.includes(element)) {
            console.error("File should be removed: " + element);
            unexpected_files.push(element);
          }
        }
      }

      // delete any problematic files in the HDR dirs
      if (unexpected_files.length > 0) {
        let ok = confirm("The following unexpected files were found which will be deleted:\n"
          + unexpected_files.join("\n"));

        if (ok) {
          unexpected_files.forEach(async file => 
            await (backend.deleteFile(sdroot + file).catch(e => {
              alert("an error occurred while deleting file:\n" + e);
              errors.push(e);
            }))
          );
          unexpected_files = [];
        } else {
          alert("The files were not deleted. Be aware, this constitutes an nonstandard HDR install which may desync online.");
        }
      }

      // determine if all is well
      if (missing.length > 0 || errors.length > 0 || wrong.length > 0 || unexpected_files.length > 0) {
        alert("Verify Outcome:\nMissing: \n" + missing.join("\n") 
          + "\nWrong: \n" + wrong.join("\n") 
          + "\nUnexpected: \n" + unexpected_files.join("\n")
          + "\nErrors: \n" + errors.join("\n"));
      } else {
        alert("HDR's files are correct.");
      }

      console.info('All expected files are correct: ' + matches)
    })
    .catch(e => {
      console.error('Major error during verify: ' + e)
    }) 
}
