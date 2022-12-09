import { Backend } from './backend'
import { Progress } from 'nx-request-api'
import { getInstallType, getRepoName } from './install'
import * as config from "./launcher_config";

// if these files are present, we will always move them into disabled_plugins
const plugins_dir = "atmosphere/contents/01006A800016E000/romfs/skyline/plugins";
const always_disable_plugins = [
  plugins_dir + "/libsmashline_hook_development.nro",
  plugins_dir + "/libhdr.nro",
  plugins_dir + "/libnn_hid_hook",
  plugins_dir + "/libparam_hook.nro",
  plugins_dir + "/libtraining_modpack.nro",
  plugins_dir + "/libHDR-Launcher.nro",
  plugins_dir + "/libnn_hid_hook.nro",
  plugins_dir + "/libacmd_hook.nro",
];

const music_files = [  
  "bgm_property.bin",
  "ui_bgm_db.prc",
  "ui_series_db.prc",
  "msg_bgm+us_en.msbt",
  "msg_title+us_en.mbst",
  "bgm_property.bin"
];

const deprecated_ryu_mods_dir = "../mods/contents/01006A800016E000/";

const dev_nro_path = "atmosphere/contents/01006A800016E000/romfs/smashline/development.nro";

const hdr_folders = [
  "ultimate/mods/hdr",
  "ultimate/mods/hdr-stages",
  "ultimate/mods/hdr-assets",
];

const always_ignore_files = [
  "changelog.toml",
  "hdr-launcher.nro",
  "ui_stage_db.prcxml"
];

export default async function verify (progressCallback?: (p: Progress) => void): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {try {
    var reportProgress = (prog: Progress) => {
      if (typeof progressCallback !== 'undefined') {
        progressCallback(prog);
      }
    }
    let backend = Backend.instance();
    let sdroot = await backend.getSdRoot();

    reportProgress(new Progress(
      "Checking Versions", 
      "Checking", 
      null
    ));
  
    let downloads = sdroot + 'downloads/'
    let version = await backend.getVersion();
    console.debug('version is: ' + version);
    let ignore_music = await config.getBoolean("ignore_music");
  
    let version_stripped = version.split('-')[0]
    let hash_file = downloads + 'content_hashes.json'
    let repoName = getRepoName(getInstallType(version));
    
    // get the hashes file from github
    await backend.downloadFile(
      'https://github.com/HDR-Development/' + repoName + '/releases/download/' +
        version_stripped +
        '/content_hashes.json',
      hash_file,
      (p: Progress) => reportProgress(p)
    );
      
    let matches = true
    
    let hashes_str = await backend.readFile(hash_file);
    let entries = JSON.parse(hashes_str);
    let count = 0
    let total = entries.length
    if (entries.length === undefined || entries.length == 0) {
      throw new Error('Could not get file hashes!')
    }

    let missing = [];
    let wrong: any[] = [];
    let errors: string[] = [];
    let result_str = "";

    // check to make sure every file has the right hash
    while (count < total) {
      let path = entries[count].path
      let expected_hash = entries[count].hash

      // continue if we arent supposed to hash-check this file.
      let ignored = false;
      always_ignore_files.forEach(ignored_file => {
        if (path.includes(ignored_file)) {
          ignored = true;
        }
      });
      // check if this is an ignored music file
      if (ignore_music) {
        music_files.forEach(ignored_file => {
          if (path.includes(ignored_file)) {
            ignored = true;
          }
        });
      }

      //if we're supposed to ignore this file, break out
      if (ignored) {
        console.info("Ignoring: " + path);
        count++;
        continue;
      }

      reportProgress(new Progress(
            "Verifying Files", 
            "File: " + path, 
            count / entries.length
      ));
       

      let exists = await backend.fileExists(sdroot + path)

      // file did not exist, report error and go to next file
      if (!exists) {
        missing.push(path);
        count++;
        continue;
      }

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
      count++
    }

    // check for any files which should not exist in the HDR folders
    let expected_files: string[] = [];
    let unexpected_files: string[] = [];
    entries.forEach((element: any) => expected_files.push(element.path.replace(/\\/g, "/")));

    for (const folder of hdr_folders) {
      reportProgress(new Progress(
        "Checking " + folder, 
        "Folder: " + folder, 
        count / hdr_folders.length
      ));

      // check the files in this directory
      let hdr_files =  (await backend.listDirAll(sdroot + folder)).toList("/" + folder)
          .map(str => str.replace(/\\/g, "/"));
      console.info("got " + folder + " files");
      
      for (const element of hdr_files) {
        if (!expected_files.includes(element) && !always_ignore_files.includes(element)) {
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

    // warn the user if there is a development.nro
    if (await backend.fileExists(sdroot + dev_nro_path)) {
      let ok = confirm("You have a development nro, would you like to delete it?");
      if (ok) {
        await backend.deleteFile(sdroot + dev_nro_path);
      } else {
        result_str += "\nWarning: A development.nro is present on this machine.";
      }
    }

    // check if there are mods in the ryu mods folder
    if (Backend.isNode() && await backend.dirExists(sdroot + deprecated_ryu_mods_dir)) {
      await backend.listDir(sdroot + deprecated_ryu_mods_dir)
        .then(contents => {
          if (contents.list.length > 0) {
            result_str += "\nThere are files in " + sdroot + deprecated_ryu_mods_dir 
              + " which may cause conflicts with HDR, as we do not use this form of mod loading."
          }
        })
        .catch(e => console.error(e));
    }

    // launcher nro is unnecessary on ryujinx and will actually cause a crash (for the old launcher)
    if (Backend.isNode() && (await backend.fileExists(sdroot + plugins_dir + "/hdr-launcher.nro"))) {
      await backend.deleteFile(sdroot + plugins_dir + "/hdr-launcher.nro")
        .then(str => console.debug("deleted old launcher"))
        .catch(e => alert("Failed to delete old launcher nro for Ryujinx, which will likely crash on game boot."));
    }

    if (Backend.isSwitch()) {
      let api_version = (await backend.getArcropApiVersion()).split(".");
      if (Number(api_version[0]) >= 1 && Number(api_version[1]) >= 7) {
          // check if hdr is enabled
          let hdr_enabled = await backend.isModEnabled("sd:/ultimate/mods/hdr");
          let hdr_assets_enabled = await backend.isModEnabled("sd:/ultimate/mods/hdr-assets");
          let hdr_stages_enabled = await backend.isModEnabled("sd:/ultimate/mods/hdr-stages");
          let hdr_dev_enabled = await backend.isModEnabled("sd:/ultimate/mods/hdr-dev");
          let hdr_pr_enabled = await backend.isModEnabled("sd:/ultimate/mods/hdr-pr");

          if (!hdr_enabled) {
            result_str += "\nThe main hdr mod folder is not enabled in Arcropolis config! Please enable this in the options menu or the mod manager.";
          }
          if (!hdr_assets_enabled) {
            result_str += "\nThe hdr-assets mod folder is not enabled in Arcropolis config! Please enable this in the options menu or the mod manager.";
          }
          if (!hdr_stages_enabled) {
            result_str += "\nThe hdr-stages mod folder is not enabled in Arcropolis config! Please enable this in the options menu or the mod manager.";
          }
          if (hdr_dev_enabled) {
            result_str += "\nhdr-dev is currently enabled! Be aware that this is not currently an official build.";
          }
          if (hdr_pr_enabled) {
            result_str += "\nA Pull Request build (hdr-pr) is currently enabled! Be aware that this is not currently an official build.";
          }
      }
    }

    // build the results of hash checking
    if (missing.length > 0) {
      result_str += "\nMissing files: \n" + missing.join("\n");
    }
    if (wrong.length > 0) {
      result_str += "\nWrong: \n" + wrong.join("\n");
    }
    if (unexpected_files.length > 0) {
      result_str += "\nUnexpected files: \n" + unexpected_files.join("\n");
    }
    if (should_disable.length > 0) {
      result_str += "\nPlugins to please disable: \n" + should_disable.join("\n");
    }
    if (should_warn.length > 0) {
      result_str += "\nnon-HDR plugins: \n" + should_warn.join("\n");
    }
    if (errors.length > 0) {
      result_str += "\nErrors during verify: \n" + errors.join("\n");
    }
    
    if (result_str.length == 0) {
      resolve("Your installation should be clean and correct.");
    } else {
      reject(result_str);
    }

    console.info('All expected files are correct: ' + matches)

  } catch (e) {reject(e);}});
}
