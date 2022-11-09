import { Backend } from './backend'
import { Progress } from 'nx-request-api'
import { getInstallType, getRepoName } from './install'

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
    });

  if (typeof progressCallback !== 'undefined') {
    progressCallback(
      new Progress(
        "Checking Versions", 
        "Checking", 
        null
      )
    );
  }

  let downloads = sdroot + 'downloads/'
  let version = 'unknown'
  await backend.getVersion().then(ver => {
    version = ver
    console.debug('version is: ' + ver)
  }).catch(e => {
    console.error('Could not get current version. ' + e)
    return;
  });

  let version_stripped = version.split('-')[0]
  let hash_file = downloads + 'content_hashes.json'
  let repoName = getRepoName(getInstallType(version));
  
  // get the hashes file from github
  await backend
    .downloadFile(
      'https://github.com/HDR-Development/' + repoName + '/releases/download/' +
        version_stripped +
        '/content_hashes.json',
      hash_file,
      (p: Progress) => {if (typeof progressCallback !== 'undefined') {progressCallback(p);}}
    )
    .then(result => console.debug(result))
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
              "Verifying Files", 
              "File: " + path, 
              (Math.trunc((1000 * count) / entries.length) /10)
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
        if (typeof progressCallback !== 'undefined') {
          progressCallback(
            new Progress(
              "Checking " + folder, 
              "Folder: " + folder, 
              Math.trunc((100 * count) / hdr_folders.length)
            )
          );
        }

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
        let text = unexpected_files.length < 10 ? "The following unexpected files were found which will be deleted:\n"
          + unexpected_files.join("\n") : "Multiple unexpected files were found in the HDR folders, which will be deleted.";
        let ok = confirm(text);

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


      // if these files are present, we will always move them into disabled_plugins
      let plugins_dir = "atmosphere/contents/01006A800016E000/romfs/skyline/plugins";
      let always_disable_plugins = [
        plugins_dir + "/libsmashline_hook_development.nro",
        plugins_dir + "/libhdr.nro",
        plugins_dir + "/libnn_hid_hook",
        plugins_dir + "/libparam_hook.nro",
        plugins_dir + "/libtraining_modpack.nro",
        plugins_dir + "/libHDR-Launcher.nro",
        plugins_dir + "/libnn_hid_hook.nro",
        plugins_dir + "/libacmd_hook.nro",
      ];
      let should_disable = [];
      let should_warn = [];

      // check the plugins
      let plugins =  (await backend.listDirAll(sdroot + plugins_dir)).toList("/" + plugins_dir)
      .map(str => str.replace(/\\/g, "/"));
      console.info("got existing plugins.");
      
      // for every plugin in their plugins dir, make sure it should be there
      for (const plugin of plugins) {
        if (always_disable_plugins.includes(plugin)) {
          console.error("Plugin should be disabled: " + plugin);
          should_disable.push(plugin);
        } else if (!expected_files.includes(plugin)) {
          should_warn.push(plugin);
        }
      }

      // launcher nro is unnecessary on ryujinx and will actually cause a crash (for the old launcher)
      if (Backend.isNode() && (await backend.fileExists(sdroot + plugins_dir + "/hdr-launcher.nro"))) {
        await backend.deleteFile(sdroot + plugins_dir + "/hdr-launcher.nro")
          .then(str => console.debug("deleted old launcher"))
          .catch(e => console.error(e));
      }

      // determine if all is well
      if (missing.length > 0 || errors.length > 0 || wrong.length > 0 || unexpected_files.length > 0 || should_disable.length > 0 || should_warn.length > 0) {
        alert("Verify Outcome:\nMissing: \n" + missing.join("\n") 
          + "\nWrong: \n" + wrong.join("\n") 
          + "\nUnexpected files: \n" + unexpected_files.join("\n")
          + "\nPlugins to please disable: \n" + should_disable.join("\n")
          + "\nOther plugins: \n" + should_warn.join("\n")
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
