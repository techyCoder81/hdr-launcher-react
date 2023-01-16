use skyline_web::{Webpage, WebSession};
use std::io::Read;
use std::thread::{self};
use serde::{Deserialize, Serialize};
use arcropolis_api::{self, ApiVersion, get_api_version};
use serde_json::Result;
use std::fmt;
use std::path::Path;
use nx_request_handler::*;
use std::fs;
use semver::{BuildMetadata, Prerelease, Version, VersionReq};
use std::collections::HashMap;
use std::fs::File;
use skyline::info::get_program_id;
use include_dir::*;
use smashnet::curl::Curler;
use fs_extra::dir::CopyOptions;

mod stage_config;

const VERSION: &str = env!("CARGO_PKG_VERSION");

static WEB_DIR: Dir = include_dir!("./web-build/renderer");

pub fn is_emulator() -> bool {
    return unsafe { skyline::hooks::getRegionAddress(skyline::hooks::Region::Text) as u64 } == 0x8004000;
}

pub fn check_for_self_updates() {
    println!("checking for updates");
    let response = match Curler::new().get("https://api.github.com/repos/techyCoder81/hdr-launcher-react/releases/latest".to_owned()) {
        Ok(resp) => resp,
        Err(err) => {
            println!("{:?}", err);
            return;
        },
    };
    println!("result: {}", &response);
    let json: serde_json::Value = match serde_json::from_str(&response) {
        Ok(res) => res,
        Err(e) => {
            println!("{:?}", e);
            return;
        }
    };
    let tag = json["tag_name"].as_str();
    let tag = match &tag {
        Some(res) => res,
        None => {
            println!("tag name not found!");
            return;
        }
    };
    println!("Latest is: {}", tag);
    println!("Current is: {}" , VERSION);

    let current_version = match Version::parse(VERSION) {
        Ok(res) => res,
        Err(e) => {
            println!("{:?}", e);
            return;
        }
    };
    let latest_version = match Version::parse(&tag[1..]) {
        Ok(res) => res,
        Err(e) => {
            println!("{:?}", e);
            return;
        }
    };
    if latest_version > current_version {
        println!("We should update!");
        let ok = skyline_web::Dialog::yes_no("An update is available for the HDR launcher, would you like to install it? (This may take a few minutes)");
        if !ok {
            return;
        }
        if std::fs::metadata("sd:/downloads").is_err() {
            std::fs::create_dir_all("sd:/downloads");
        }
        match Curler::new().download(
            "https://github.com/techyCoder81/hdr-launcher-react/releases/latest/download/hdr-launcher.nro".to_owned(),
            "sd:/downloads/hdr-launcher.nro.dl".to_owned()
        ) {
            Ok(_) => {},
            Err(err) => {
                println!("{:?}", err);
                let info = format!("ERROR: Update Failed!\nCurl error code: {}", err);
                skyline_web::DialogOk::ok(info);
                return;
            },
        };
        
        println!("finished get");
        match std::fs::copy("sd:/downloads/hdr-launcher.nro.dl", "sd:/atmosphere/contents/01006A800016E000/romfs/skyline/plugins/hdr-launcher.nro") {
            Ok(_) => println!("new update installed!"),
            Err(err) => println!("{:?}", err)
        };
        unsafe { skyline::nn::oe::RequestToRelaunchApplication(); }
    }
}


#[skyline::main(name = "hdr-launcher-react")]
pub fn main() {
    if is_emulator() {
        println!("HDR Launcher nro cannot run on emulator! Exiting launcher nro!");
        return;
    }

    // check for launcher updates
    #[cfg(feature = "updater")]
    let update_thread = thread::spawn(move || unsafe {
        skyline::nn::os::ChangeThreadPriority(skyline::nn::os::GetCurrentThread(), 2);
        check_for_self_updates();
        skyline::nn::os::ChangeThreadPriority(skyline::nn::os::GetCurrentThread(), 16);
    });
    #[cfg(feature = "updater")]
    update_thread.join();

    println!("starting browser!");
    let browser_thread = thread::spawn(move || {
        
        unsafe {
            extern "C" {
                #[link_name = "_ZN2nn2oe24SetExpectedVolumeBalanceEff"]
                fn set_volume_balance(applet: f32, system: f32);
            }
    
            set_volume_balance(0.5, 1.0);
        }

        let mut page = Webpage::new();

        println!("files:");
        WEB_DIR.files().for_each(|file| println!("file: {}", file.path().display()));

        println!("dirs:");
        WEB_DIR.dirs().for_each(|file| println!("file: {}", file.path().display()));

        // parse the react-built manifest
        let manifest_file = match WEB_DIR.get_file("assets-manifest.json") {
            Some(value) => value,
            None => {
                println!("manifest not found!");
                return;
            }
        };
        let manifest_str = match manifest_file.contents_utf8() {
            Some(value) => value,
            None => {
                println!("manifest content reading failed!");
                return;
            }
        };
        let manifest = match serde_json::from_str::<serde_json::Value>(manifest_str) {
            Ok(value) => value,
            Err(e) => {
                println!("parsing as json failed! Error: {}", e);
                return;
            }
        };

        let assets = manifest.as_object().unwrap();
        
        let mut files: HashMap<String, &include_dir::File> = HashMap::new();

        // for each asset, add it to the webpage
        assets.iter().for_each(|entry| {
            let file_path = format!("{}", entry.1.to_string().trim_matches('\"').trim_start_matches('/'));
            let file = match WEB_DIR.get_file(&file_path) {
                Some(f) => f,
                None => {
                    println!("Could not find file: {}", file_path);
                    return;
                }
            };
            files.insert(file_path, file);
        });

        let program_id = get_program_id();
        let htdocs_dir = "hdr-launcher";
        let folder_path = Path::new("sd:/atmosphere/contents")
                .join(&format!("{:016X}", program_id))
                .join(&format!("manual_html/html-document/{}.htdocs/", htdocs_dir));
    
        // remove previous files if necessary
        if std::fs::metadata(&folder_path).is_ok() {
            std::fs::remove_dir_all(&folder_path);
        }

        for key in files.keys() {
            let contents = match files.get(key)  {
                Some(value) => value.contents(),
                None => {
                    println!("key not found: {}", key);
                    return;
                }
            };
            page.file(key, contents);
            let fullpath = Path::join(&folder_path, key);
            println!("adding file: {}", fullpath.display());
            match fs::create_dir_all(fullpath.parent().unwrap()) {
                Ok(_) => {},
                Err(e) => {println!("Error while making file path: {:?}", e); return;}
            }
        }

        let session = match page.htdocs_dir(htdocs_dir)
            .web_audio(true)
            .background(skyline_web::Background::Default)
            .boot_display(skyline_web::BootDisplay::Black)
            .open_session(skyline_web::Visibility::InitiallyHidden) {
                Ok(s) => s,
                Err(e) => {
                    skyline_web::DialogOk::ok(format!("Error: failed to open hdr-launcher websession!\n{:?}", e));
                    return;
                }
            };
        session.show();

        println!("session is open");
        RequestEngine::new(session)
            .register_defaults()
            .register("open_mod_manager", None, |context| {
                context.shutdown();
                try_open_arcropolis();
                unsafe { skyline::nn::oe::RequestToRelaunchApplication(); }
                //unreachable
            })
            .register("relaunch_application", None, |_| {
                unsafe { skyline::nn::oe::RequestToRelaunchApplication(); }
            })
            .register("get_platform", None, |context| {
                Ok("Switch".to_string())
            })
            .register("get_sdcard_root", None, |context| {
                Ok("sd:/".to_string())
            })
            .register("is_installed", None, |context| {
                let exists = Path::new("sd:/ultimate/mods/hdr").exists();
                Ok(exists.to_string())
            })
            .register("is_mod_enabled", Some(1), |context| {
                let mod_path = &context.arguments.as_ref().unwrap()[0];
                let enabled = arcropolis_api::is_mod_enabled(arcropolis_api::hash40(mod_path).as_u64());
                Ok(enabled.to_string())
            })
            .register("get_arcrop_api_version", None, |context| {
                let api_version = arcropolis_api::get_api_version();
                Ok(format!("{}.{}", api_version.major, api_version.minor))
            })
            .register("get_launcher_version", None, |_|{Ok(VERSION.to_string())})
            .register("get_version", None, |context| {
                let path = "sd:/ultimate/mods/hdr/ui/hdr_version.txt";
                let exists = Path::new(path).exists();
                if !exists {
                    return Err("Version file does not exist!".to_string());
                } else {
                    return match fs::read_to_string(path) {
                        Ok(version) => Ok(version.trim().to_string()),
                        Err(e) => Err(e.to_string())
                    }
                }
            })
            .register("remove_dir_all", Some(1), |context| {
                let args = context.arguments.as_ref().unwrap();
                let path = &args[0];
                return match fs::remove_dir_all(path) {
                    Ok(version) => Ok("Path removed successfully.".to_string()),
                    Err(e) => Err(e.to_string())
                }
            })
            .register("clone_mod", Some(2), |context| {
                let args = context.arguments.as_ref().unwrap();
                let src_mod = &args[0];
                let dest_mod = &args[1];
                let src = format!("sd:/ultimate/mods/{}", &src_mod);
                let dest = format!("sd:/ultimate/mods/{}", &dest_mod);
                let exists = Path::new(&src).exists();
                if !exists {
                    return Err(format!("{} folder does not exist, so we cannot make a copy of it!", &src_mod));
                } else {
                    // if the folder already exists, remove it
                    if Path::new(&dest).exists() {
                        match fs::remove_dir_all(&dest) {
                            Ok(()) => {},
                            Err(e) => return Err(format!("Error while removing existing {}: {}", &dest_mod, e.to_string()))
                        }
                    }
                    
                    // create a new pr folder
                    match fs::create_dir(&dest) {
                        Ok(()) => {},
                        Err(e) => return Err(format!("Error while creating empty {}: {}", &dest_mod, e.to_string()))
                    }

                    // count how many files we will be cloning
                    let mut total = 0.0;
                    println!("counting files to clone");
                    for entry in walkdir::WalkDir::new(&src) {
                        let dir_entry = match entry {
                            Ok(path) => path,
                            Err(e) => return Err(format!("Error while walking {} directory: {}", &src_mod, e))
                        };
                        total += 1.0;
                    }

                    // copy the assets into the new pr assets dir
                    println!("beginning directory clone");
                    let mut count = 0.0;
                    for entry in walkdir::WalkDir::new(src) {
                        let dir_entry = match entry {
                            Ok(path) => path,
                            Err(e) => return Err(format!("Error while walking {} directory: {}", &src_mod, e))
                        };

                        let path = dir_entry.path();
                        let progress = count / total;
                        context.send_progress(Progress { title: format!("Cloning asset: {:?}", path.file_name().unwrap()), info: "cloning asset file".to_string(), progress: progress });
                        //println!("sending progress: {progress}");
                        count += 1.0;

                        // create the PR equivalent path from the source mod path
                        let pr_path = path.to_str().unwrap().replace(src_mod, dest_mod);
                        match path.is_file() {
                            true =>  match std::fs::copy(path, pr_path) {
                                Ok(_) => {},
                                Err(e) => return Err(format!("Error while handling path: {}", path.display()))
                            },
                            false => match std::fs::create_dir_all(pr_path) {
                                Ok(_) => {},
                                Err(e) => return Err(format!("Error while handling path: {}", path.display()))
                            }
                        };
                    }

                    let info_toml = format!("sd:/ultimate/mods/{}/info.toml", dest_mod);
                    if Path::new(&info_toml).exists() {
                        fs::remove_file(info_toml);
                    }

                    return Ok("All files were cloned successfully.".to_string());
                }
            })
            .start();
        
    });

    // End thread so match can actually start
    browser_thread.join();
}

/// tries to open the main arcropolis configuration ui
pub fn try_open_arcropolis() {
    let exists = Path::new("sd:/atmosphere/contents/01006A800016E000/romfs/skyline/plugins/libarcropolis.nro").exists();
    if !exists {
        println!("Error: We cannot open arcrop because you do not have arcropolis!");
        skyline_web::DialogOk::ok("Error: Cannot open arcropolis menu because you do not have arcropolis!");
        return;
    }
    let api_version = arcropolis_api::get_api_version();
    println!("opening arcrop menu...");
    if api_version.major >= 1 && api_version.minor >= 7 {
        arcropolis_api::show_main_menu();
    } else {
        println!("Error: We cannot open arcrop because arcrop is out of date!");
        skyline_web::DialogOk::ok("Error: Cannot open arcropolis menu because your arcropolis is out of date! You may want to update in the launcher.");
    }
}