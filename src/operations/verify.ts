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

      if (missing.length > 0 || errors.length > 0 || wrong.length > 0) {
        alert("Missing: " + missing.join(",") 
          + "\nWrong: " + wrong.join(",") 
          + "\nErrors: " + errors.join("\n"));
      } else {
        alert("HDR's files are correct.");
      }
/*
      // delete any files that should not be present
      let hdr_files =  (await backend.listDirAll(sdroot + "ultimate/mods/hdr")).toList(sdroot + "ultimate/mods/hdr");
      hdr_files.forEach(str => str.replace("\\\\", "\\").replace("//", "/").replace("\\", "/"));
      let assets_files = (await backend.listDirAll(sdroot + "ultimate/mods/hdr-assets")).toList(sdroot + "ultimate/mods/hdr-assets");
      assets_files.forEach(str => str.replace("\\\\", "\\").replace("//", "/").replace("\\", "/"));
      let stages_files = (await backend.listDirAll(sdroot + "ultimate/mods/hdr-stages")).toList(sdroot + "ultimate/mods/hdr-stages");
      stages_files.forEach(str => str.replace("\\\\", "\\").replace("//", "/").replace("\\", "/"));

      let expected_files: string[] = [];
      entries.forEach((element: any) => expected_files.push(element.path.replace("\\\\", "\\").replace("//", "/").replace("\\", "/")));

      hdr_files.forEach(element => {
        if (!expected_files.includes(element)) {
          console.error("File should be removed: " + element);
        }
      });

      assets_files.forEach(element => {
        if (!expected_files.includes(element)) {
          console.error("File should be removed: " + element);
        }
      });

      stages_files.forEach(element => {
        if (!expected_files.includes(element)) {
          console.error("File should be removed: " + element);
        }
      });
*/
      console.info('All files are correct: ' + matches)
    })
    .catch(e => {
      console.error('Major error during verify: ' + e)
    }) 
}
