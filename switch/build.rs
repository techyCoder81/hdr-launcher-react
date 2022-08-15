use std::fs;
use std::env;
use std::path::Path;
use std::fs::File;
use std::io::{self, Read, Write};

static JS_FILE_PATH: &str = "../.webpack/renderer/main_window/index.js";
static HTML_FILE_PATH: &str = "../.webpack/renderer/main_window/index.html";

fn main() -> std::io::Result<()> {
    println!("current dir: {}", env::current_dir()?.display());
    // Tell Cargo that if the given file changes, to rerun this build script.
    println!("cargo:rerun-if-changed={}", JS_FILE_PATH);
    println!("cargo:rerun-if-changed={}", HTML_FILE_PATH);
    println!("cargo:rerun-if-changed=build.rs");
    if Path::exists(Path::new("./web-build")) {
        fs::remove_dir_all("./web-build")?;
    }
    fs::create_dir_all("./web-build")?;
    let mut src = File::open(HTML_FILE_PATH)?;
    let mut data = String::new();
    src.read_to_string(&mut data); 
    println!("current data:\n{}", data);

    let new_data = format!("{}<!-- this was written by the build script -->", data.replace("main_window/", ""));
    let mut dest = File::create("web-build/index.html")?;
    dest.write(new_data.as_bytes())?;
    println!("\nnew data:\n{}", new_data);
    fs::copy(JS_FILE_PATH, "web-build/index.js")?;
    Ok(()) 
} 