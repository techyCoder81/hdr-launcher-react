use skyline_web::{Webpage, WebSession};
use std::thread::{self};

static HTML_TEXT: &str = include_str!("../web-build/index.html");
static JS_TEXT: &str = include_str!("../web-build/index.js");

#[skyline::main(name = "hdr-launcher-react")]
pub fn main() {
    println!("starting browser!");
    let browser_thread = thread::spawn(move || {
        let session = Webpage::new()
            .htdocs_dir("contents")
            .file("index.html", &HTML_TEXT)
            .file("index.js", &JS_TEXT)
            .background(skyline_web::Background::Default)
            .boot_display(skyline_web::BootDisplay::Black)
            .open_session(skyline_web::Visibility::InitiallyHidden).unwrap();
        session.show();
        loop {
            std::thread::sleep(std::time::Duration::from_millis(2000));
            println!("browser thread is alive still");
        }
    });

    // End thread so match can actually start
    browser_thread.join();

}
