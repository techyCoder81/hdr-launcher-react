use skyline_web::{Webpage, WebSession};
use std::thread::{self};
use serde::{Deserialize, Serialize};
use serde_json::Result;
use std::fmt;

static HTML_TEXT: &str = include_str!("../web-build/index.html");
static JS_TEXT: &str = include_str!("../web-build/index.js");

#[derive(Serialize, Deserialize)]
struct Message {
    id: String,
    call_name: String,
}

#[derive(Serialize, Deserialize)]
struct StringResponse {
    id: String,
    message: String,
}

impl fmt::Display for Message {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "(id: {}, call_name: {})", self.id, self.call_name)
    }
}

impl fmt::Display for StringResponse {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "(id: {}, message: {})", self.id, self.message)
    }
}

trait Handleable {
    fn handle(&self, session: &WebSession) -> bool;
}

impl Handleable for Message {
    /// return: true, if we should keep going, false if we should not
    fn handle(&self, session: &WebSession) -> bool {
        match self.call_name.as_str() {
            "play" => {session.exit(); return false;},
            "quit" => unsafe { skyline::nn::oe::ExitApplication();},
            "ping" => send_string_response(session, self.id.clone(), "pong from switch!".to_string()),
            "get_platform" => send_string_response(session, self.id.clone(), "Switch".to_string()),
            "get_sdcard_root" => send_string_response(session, self.id.clone(), "sd:/".to_string()),
            "is_installed" => {
                let exists = Path::new("sd:/ultimate/mods/hdr").exists();
                send_string_response(session, self.id.clone(), format!("{}", exists));
            },
            _ => println!("doing nothing for message {}", self)
        }
        return true;
    }
}

pub fn send_string_response(session: &WebSession, msgId: String, responseMsg: String) {
    let response = &StringResponse{ 
        id: msgId, message: responseMsg
    };
    println!("Sending string response: {}", response);
    session.send_json(response);
}

#[skyline::main(name = "hdr-launcher-react")]
pub fn main() {
    println!("starting browser!");
    let browser_thread = thread::spawn(move || {
        let session = Webpage::new()
            .htdocs_dir("hdr-launcher")
            .file("index.html", &HTML_TEXT)
            .file("index.js", &JS_TEXT)
            .background(skyline_web::Background::Default)
            .boot_display(skyline_web::BootDisplay::Black)
            .open_session(skyline_web::Visibility::InitiallyHidden).unwrap();
        session.show();

        println!("session is open");
        loop {
            if let Some(msg) = session.try_recv() {
                let message: Message = serde_json::from_str(&msg).unwrap();
                println!("received a message: {}" , message);
                if !message.handle(&session) {
                    break;
                }
            }
        }
    });

    // End thread so match can actually start
    browser_thread.join();
}