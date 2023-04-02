#![feature(exit_status_error)]
use std::process::{ExitStatusError};
use std::path::Path;
use npm_rs::*;
use fs_extra::dir::CopyOptions;
use std::io::{Write, Read};

const JS_FILE_PATH: &str = "./web-build/renderer/renderer.js";

fn main() -> (){
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-changed=../release/app/dist/renderer/assets-manifest.json");
    
    #[cfg(not(feature = "no-npm"))] 
    // do the npm run build
    NpmEnv::default()
        .set_path("../")
        .init_env()
        .install(None)
        .run("build")
        .exec().unwrap()
        .exit_ok().unwrap();

    #[cfg(feature = "no-npm")]
    println!("Not using automatic npm install and build.");

    // clear the web build dir if necessary
    if Path::exists(Path::new("./web-build")) {
        std::fs::remove_dir_all("./web-build").unwrap();
    }
    std::fs::create_dir_all("./web-build").unwrap();

    
    let paths = std::fs::read_dir("../").unwrap();
    for path in paths {
        println!("Path: {}", path.unwrap().path().display());
    }
    let options = CopyOptions::new();
    fs_extra::dir::copy("../release/app/dist/renderer/", "./web-build/", &options).unwrap();

    // read and transform the js file
    let mut src_js = std::fs::File::open(JS_FILE_PATH).unwrap();
    let mut data_js = String::new();
    src_js.read_to_string(&mut data_js).unwrap();
    let new_data_js = data_js 
        .replace("const ", "var ")
        .replace("let ", "var ")
        .replace("let{", "var{")
        .replace("let[", "var[")
        .replace("const{", "var{")
        .replace("const[", "var[")
        .replace("() => e.default : () => e", "(() => e.default) : (() => e)")
        .replace("()=>e.default:()=>e", "(()=>e.default):(()=>e)")
        .replace("() =>(module['default'])", "(()=>(module['default']))")
        .replace("() =>(module)", "(() =>(module))")
        .replace("e=>Object.getPrototypeOf(e)", "(e=>Object.getPrototypeOf(e))")
        .replace(".Component{state=yr;", ".Component{")
        .replace("resetErrorBoundary=(...e)=>", "resetErrorBoundary(e)")
        //.replace("this.isNode() ? \"Ryujinx\" : \"Switch\"", "(this.isNode() ? \"Ryujinx\" : \"Switch\")")
        .replace("\"assets/", "\"");

    std::fs::remove_file(JS_FILE_PATH).unwrap();
    let mut dest_js = std::fs::File::create(JS_FILE_PATH).unwrap();

    // prettyprint and then write the file
    let (pretty, _) = prettify_js::prettyprint(&new_data_js);
    let formatted = pretty.replace(" ? .", "?.")
        .replace("props.onReset?.(", "props.onReset && props.onReset(")
        .replace("props.onError?.(", "props.onError && props.onError(");
    dest_js.write(formatted.as_bytes()).unwrap(); 
}


/*use std::fs;
use std::env;
use std::path::Path;
use std::fs::File;
use std::io::{self, Read, Write};
use prettify_js::*;

static JS_FILE_PATH: &str = "../.webpack/renderer/main_window/index.js";
static HTML_FILE_PATH: &str = "../.webpack/renderer/main_window/index.html";
static LOGO_FILE_PATH: &str = "../.webpack/renderer/assets/logo_full.png";
static MUSIC_FILE_PATH: &str = "../.webpack/renderer/assets/theme.wav";

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
        .replace("../assets/", "")
        .replace("./assets/", "")
        .replace("/assets", "")
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
        .replace("()=>e.default:()=>e", "(()=>e.default):(()=>e)"))
        .replace("() =>(module['default'])", "(()=>(module['default']))")
        .replace("() =>(module)", "(() =>(module))")
        .replace("\"assets/", "\"");
    let mut dest_js = File::create("web-build/index.js")?;

    // prettyprint and then write the file
    let (pretty, _) = prettify_js::prettyprint(&new_data_js);
    dest_js.write(pretty.as_bytes())?; 

    // copy the logo image file
    fs::copy(LOGO_FILE_PATH, "web-build/logo_full.png")?;

    // copy the music file
    fs::copy(MUSIC_FILE_PATH, "web-build/theme.wav")?;

    Ok(()) 
} */