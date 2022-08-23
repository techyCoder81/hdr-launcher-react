use serde::{Deserialize, Serialize};
use std::fmt;
use skyline_web::{Webpage, WebSession};
use std::path::Path;
use crate::*;
use std::fs;

/// trait to handle a message
pub trait Handleable {
    fn handle(&self, session: &WebSession) -> bool;
}

/// simple, named message, which may warrant a response
#[derive(Serialize, Deserialize)]
pub struct Message {
    id: String,
    call_name: String
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
            "play" => {session.exit(); return true;},
            "quit" => unsafe { skyline::nn::oe::ExitApplication();},
            "open_mod_manager" => {
                session.exit();
                session.wait_for_exit();
                try_open_arcropolis();
                unsafe { skyline::nn::oe::RequestToRelaunchApplication(); }
            },
            "ping" => self.respond_string("Pong from switch!", session),
            "get_platform" => self.respond_string("Switch", session),
            "get_sdcard_root" => self.respond_string("sd:/", session),
            "is_installed" => {
                let exists = Path::new("sd:/ultimate/mods/hdr").exists();
                self.respond_bool(exists, session)
            },
            "get_version" => {
                let path = "sd:/ultimate/mods/hdr/ui/hdr_version.txt";
                let exists = Path::new(path).exists();
                if !exists {
                    self.error("Version file does not exist!", session);
                } else {
                    match fs::read_to_string(path) {
                        Ok(version) => self.ok(&version, session),
                        Err(e) => self.error(format!("{:?}", e).as_str(), session)
                    }
                }
            },
            _ => println!("ERROR: doing nothing for unknown message {}", self)
        }
        return true;
    }
}

impl BoolRespond for Message {
    fn respond_bool(&self, result: bool, session: &WebSession) {
        session.send_json(&BooleanResponse{id: self.id.clone(), result: result});
    }
}

impl StringRespond for Message {
    fn respond_string(&self, message: &str, session: &WebSession) {
        session.send_json(&StringResponse{id: self.id.clone(), message: message.to_string()});
    }
}

impl OkOrError for Message {
    fn ok(&self, message: &str, session: &WebSession) {
        session.send_json(&OkOrErrorResponse{ 
            id: self.id.clone(), ok: true, message: message.to_string()
        });
    }
    fn error(&self, message: &str, session: &WebSession) {
        session.send_json(&OkOrErrorResponse{ 
            id: self.id.clone(), ok: false, message: message.to_string()
        });
    }
}