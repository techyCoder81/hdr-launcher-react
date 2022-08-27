use serde::{Deserialize, Serialize};
use std::fmt;
use skyline_web::{Webpage, WebSession};
use std::path::Path;
use crate::*;
use std::fs;
use smashnet::*;

/// trait to handle a message
pub trait Handleable {
    fn handle(&self, session: &WebSession) -> bool;
}

/// simple, named message, which may warrant a response
#[derive(Serialize, Deserialize)]
pub struct Message {
    id: String,
    call_name: String,
    arguments: Option<Vec<String>>
}

impl fmt::Display for Message {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "(id: {}, call_name: {})", self.id, self.call_name)
    }
}

impl Handleable for Message {
    
    fn handle(&self, session: &WebSession) -> bool {
        println!("Handling message {}", self.call_name);
        match self.call_name.as_str() {
            "play" => {session.exit(); return false;},
            "quit" => unsafe { skyline::nn::oe::ExitApplication();},
            "open_mod_manager" => {
                session.exit();
                session.wait_for_exit();
                try_open_arcropolis();
                unsafe { skyline::nn::oe::RequestToRelaunchApplication(); }
            },
            "ping" => session.respond_string("Pong from switch!", &self.id),
            "get_platform" => session.respond_string("Switch", &self.id),
            "get_sdcard_root" => session.respond_string("sd:/", &self.id),
            "is_installed" => {
                let exists = Path::new("sd:/ultimate/mods/hdr").exists();
                session.respond_bool(exists, &self.id)
            },
            "get_version" => {
                let path = "sd:/ultimate/mods/hdr/ui/hdr_version.txt";
                let exists = Path::new(path).exists();
                if !exists {
                    session.error("Version file does not exist!", &self.id);
                } else {
                    match fs::read_to_string(path) {
                        Ok(version) => session.ok(&version, &self.id),
                        Err(e) => session.error(format!("{:?}", e).as_str(), &self.id)
                    }
                }
            },
            "read_file" => {
                let args = match &self.arguments {
                    Some(args) => args,
                    None => {session.error("No arguments were provided to read_file!", &self.id); return true;}
                };

                if args.len() < 1 {
                    session.error("Not enough arguments provided to read_file!", &self.id);
                    return true;
                }

                let path = format!("sd:/{}", args[0].clone());
                let exists = Path::new(path).exists();
                if !exists {
                    session.error("requested file does not exist!", &self.id);
                } else {
                    match fs::read_to_string(path) {
                        Ok(version) => session.ok(&version, &self.id),
                        Err(e) => session.error(format!("{:?}", e).as_str(), &self.id)
                    }
                }
            },
            "download_file" => {
                let args = match &self.arguments {
                    Some(args) => args,
                    None => {session.error("No arguments were provided to download_file!", &self.id); return true;}
                };

                if args.len() < 2 {
                    session.error("Not enough arguments provided to download_file!", &self.id);
                    return true;
                }

                let url = args[0].clone();
                let location = format!("sd:/{}", args[1].clone());

                let result = Curler::new()
                    //.progress_callback(|total, current| session.progress(current/total, &self.id))
                    .download(url, location);

                match result {
                    Ok(()) => session.ok("File downloaded successfully!", &self.id),
                    Err(e) => session.error(format!("Error during download, error code: {}", e).as_str(), &self.id)
                }
            }
            _ => println!("ERROR: doing nothing for unknown message {}", self)
        }
        return true;
    }
}

impl BoolRespond for WebSession {
    fn respond_bool(&self, result: bool, id: &String) {
        self.send_json(&BooleanResponse{id: id.clone(), result: result});
    }
}

impl StringRespond for WebSession {
    fn respond_string(&self, message: &str, id: &String) {
        self.send_json(&StringResponse{id: id.clone(), message: message.to_string()});
    }
}

impl OkOrError for WebSession {
    fn ok(&self, message: &str, id: &String) {
        self.send_json(&OkOrErrorResponse{ 
            id: id.clone(), ok: true, message: message.to_string()
        });
    }
    fn error(&self, message: &str, id: &String) {
        self.send_json(&OkOrErrorResponse{ 
            id: id.clone(), ok: false, message: message.to_string()
        });
    }
}