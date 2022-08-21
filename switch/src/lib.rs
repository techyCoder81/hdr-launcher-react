use skyline_web::{Webpage, WebSession};
use std::thread::{self};

static HTML_TEXT: &str = include_str!("../web-build/index.html");
static JS_TEXT: &str = include_str!("../web-build/index.js");

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
        loop {
            if let Some(msg) = session.try_recv() {
                handle(msg);
            }
        }
    });

    // End thread so match can actually start
    browser_thread.join();

}

pub fn handle(message: String) {
    println!("Received from frontend: {}", message);
    // TODO: actually handle the stuff here lol
}