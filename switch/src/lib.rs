use skyline_web::{Webpage, WebSession};
use std::thread::{self};
use serde::{Deserialize, Serialize};
use arcropolis_api::{self, ApiVersion, get_api_version};
use serde_json::Result;
use std::fmt;
use std::path::Path;
use nx_request_handler::*;
use std::fs;
use semver::{BuildMetadata, Prerelease, Version, VersionReq};

mod stage_config;

const VERSION: &str = env!("CARGO_PKG_VERSION");

pub fn is_emulator() -> bool {
    return unsafe { skyline::hooks::getRegionAddress(skyline::hooks::Region::Text) as u64 } == 0x8004000;
}

pub fn check_for_self_updates() {
    println!("checking for updates");
    let response = match minreq::get("https://api.github.com/repos/techyCoder81/hdr-launcher-react/releases/latest")
        .with_header("User-Agent", "hdr-launcher")    
        .send() {
        Ok(resp) => resp,
        Err(err) => {
            println!("{:?}", err);
            return;
        },
    };
    let result = match response.as_str() {
        Ok(res) => res,
        Err(e) => {
            println!("{:?}", e);
            return;
        }
    };
    println!("result: {}", &result);
    let json: serde_json::Value = match serde_json::from_str(&result) {
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
        let ok = skyline_web::Dialog::yes_no("An update is available for the HDR launcher, would you like to install it? (This will take a moment)");
        if !ok {
            return;
        }
        let update = match minreq::Request::new(minreq::Method::Get, "https://github.com/techyCoder81/hdr-launcher-react/releases/latest/download/hdr-launcher.nro")
            .with_header("Accept", "application/octet-stream")
            .with_header("User-Agent", "hdr-launcher")
            .send() {
            Ok(resp) => resp,
            Err(err) => {
                println!("{:?}", err);
                return;
            },
        };
        if !update.status_code == 200 {
            let info = format!("ERROR: Update Failed! Status Code: {}\nExplanation:\n{}", update.status_code, update.reason_phrase);
            skyline_web::DialogOk::ok(info);
            return;
        }
        println!("finished get");
        match std::fs::write("sd:/atmosphere/contents/01006A800016E000/romfs/skyline/plugins/hdr-launcher.nro", update.into_bytes()){
            Ok(_) => println!("new update installed!"),
            Err(err) => println!("{:?}", err)
        };
        unsafe { skyline::nn::oe::RequestToRelaunchApplication(); }
    }
}


static HTML_TEXT: &str = include_str!("../web-build/index.html");
static JS_TEXT: &str = include_str!("../web-build/index.js");
static LOGO_PNG: &[u8] = include_bytes!("../web-build/logo_full.png");
static THEME_WAV: &[u8] = include_bytes!("../web-build/theme.wav");

#[skyline::main(name = "hdr-launcher-react")]
pub fn main() {
    if is_emulator() {
        println!("HDR Launcher nro cannot run on emulator! Exiting launcher nro!");
        return;
    }

    println!("starting browser!");
    let browser_thread = thread::spawn(move || {
        #[cfg(feature = "updater")]
        check_for_self_updates();

        unsafe {
            extern "C" {
                #[link_name = "_ZN2nn2oe24SetExpectedVolumeBalanceEff"]
                fn set_volume_balance(applet: f32, system: f32);
            }
    
            set_volume_balance(0.5, 1.0);
        }

        let session = Webpage::new()
            .htdocs_dir("hdr-launcher")
            .file("index.html", &HTML_TEXT)
            .file("index.js", &JS_TEXT)
            .file("logo_full.png", &LOGO_PNG)
            .file("theme.wav", &THEME_WAV)
            .web_audio(true)
            .background(skyline_web::Background::Default)
            .boot_display(skyline_web::BootDisplay::Black)
            .open_session(skyline_web::Visibility::InitiallyHidden).unwrap();
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