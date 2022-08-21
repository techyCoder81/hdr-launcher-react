use std::fs;
use std::env;
use std::path::Path;
use std::fs::File;
use std::io::{self, Read, Write};
use prettify_js::*;

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

    // read and transform the html file
    let mut src_html = File::open(HTML_FILE_PATH)?;
    let mut data_html = String::new();
    src_html.read_to_string(&mut data_html); 
    let new_data_html = format!("{}", data_html
        .replace("../main_window/", "")
        .replace("./main_window/", "")
        .replace("/main_window", "")
        .replace("const ", "var "));
    let mut dest_html = File::create("web-build/index.html")?;

    //write the file
    dest_html.write(new_data_html.as_bytes())?; 
    
    // read and transform the js file
    let mut src_js = File::open(JS_FILE_PATH)?;
    let mut data_js = String::new();
    src_js.read_to_string(&mut data_js); 
    let new_data_js = format!("{}", data_js
        .replace("const ", "var ")
        .replace("() => e.default : () => e", "(() => e.default) : (() => e)")
        .replace("()=>e.default:()=>e", "(()=>e.default):(()=>e)"));
    let mut dest_js = File::create("web-build/index.js")?;

    // prettyprint and then write the file
    let (pretty, _) = prettify_js::prettyprint(&new_data_js);
    dest_js.write(pretty.as_bytes())?; 

    Ok(()) 
} 