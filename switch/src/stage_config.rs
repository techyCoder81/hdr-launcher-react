use std::path::Path;
use std::fs::OpenOptions;
use std::io::prelude::*;


const FILE_PATH: &str = "sd:/ultimate/mods/hdr-stages/ui/param/database/ui_stage_db.prcxml";
const CONFIG_PATH: &str = "sd:/ultimate/hdr-config/";
const STAGING_FILE: &str = "sd:/ultimate/hdr-config/ui_stage_db.prcxml.temp";
const DEFAULT_FILE: &str = "sd:/ultimate/mods/hdr-stages/ui/param/database/default_ui_stage_db.prcxml";
/*
pub fn enable_stages(stage_names: &Vec<String>) -> Result<String, String> {
    return set_stages(stage_names, true);
}

pub fn disable_stages(stage_names: &Vec<String>) -> Result<String, String> {
    return set_stages(stage_names, false);
}

pub fn set_stages(stage_names: &Vec<String>, enabled: bool) -> Result<String, String> {
    let xml = read_file()?;
    
    // parse the xml raw string
    let mut out_lines = vec![];
    let mut lines = xml.lines();
    let mut line = lines.next();
    while line.is_some() {
        let mut line_str = line.unwrap();
        out_lines.push(line_str);
        if (line_str.contains("name_id")) {
            let name = line_str.trim().trim_start_matches("<string hash=\"name_id\">").trim_end_matches("</string>");
            if stage_names.contains(&name.to_string()) {
                while line.is_some() && !line_str.contains("can_select") {
                    line = lines.next();
                    line_str = line.unwrap();
                    out_lines.push(line_str);
                }
                let len = out_lines.len();
                out_lines[len - 1] = match enabled {
                    true => "    <string hash=\"can_select\">True</string>",
                    false => "    <string hash=\"can_select\">False</string>"
                }
            }
        }
        line = lines.next(); 
    }

    let result = match std::fs::write(FILE_PATH, out_lines.join("\n")) {
        Ok(()) => Ok("File written successfully".to_string()),
        Err(e) => Err(format!("{:?}", e))
    };
    println!("Done writing file, result: {:?}", result);
    return result;
}
*/

/// read the existing stage db xml file
pub fn read_file() -> Result<String, String> {
    let exists = Path::new(FILE_PATH).exists();
    if !exists {
        return Err("ui_stage_db.prcxml file does not exist!".to_string());
    }

    return match std::fs::read_to_string(FILE_PATH) {
        Ok(xml) => Ok(xml.trim().replace("\n", "")),
        Err(e) => Err(format!("{:?}", e))
    };
}

/// read the current temp file
pub fn read_temp_file() -> Result<String, String> {
    let exists = Path::new(STAGING_FILE).exists();
    if !exists {
        return Err("temp file does not exist!".to_string());
    }

    return match std::fs::read_to_string(STAGING_FILE) {
        Ok(xml) => Ok(xml.trim().replace("\n", "")),
        Err(e) => Err(format!("{:?}", e))
    }
}


/// create a new stage xml temp file
pub fn new_temp_file() -> Result<String, String> {
    let exists = Path::new(STAGING_FILE).exists();
    if exists {
        match std::fs::remove_file(STAGING_FILE) {
            Ok(()) => {},
            Err(e) => return Err(format!("error overwriting: {:?}", e))
        };
    }

    match std::fs::create_dir_all(CONFIG_PATH) {
        Ok(()) => (),
        Err(e) => return Err(format!("error creating config paths: {:?}", e))
    };
    return match std::fs::write(STAGING_FILE, "") {
        Ok(()) => Ok("file created successfully.".to_string()),
        Err(e) => return Err(format!("error writing to new temp file: {:?}", e))
    };
}

/// append data to the existing stage xml temp file
pub fn append_temp_line(data: &str) -> Result<String, String> {
    let exists = Path::new(STAGING_FILE).exists();
    if !exists {
        return Err("staging file does not already exist!".to_string());
    }

    let mut file = OpenOptions::new()
        .write(true)
        .append(true)
        .open(STAGING_FILE)
        .unwrap();

    if let Err(e) = write!(file, "\n{}", data) {
        return Err(format!("Couldn't write to staging file: {}", e));
    }

    Ok("Appended to file successfully.".to_string())
}

/// overwrite the stage file with the temp file's data
pub fn overwrite_stage_file() -> Result<String, String> {
    // ensure the temp file exists
    let exists = Path::new(STAGING_FILE).exists();
    if !exists {
        return Err("staging file does not already exist!".to_string());
    }

    // read the staged temp data
    let staged_xml = match std::fs::read_to_string(STAGING_FILE) {
        Ok(xml) => xml,
        Err(e) => return Err(format!("error overwriting: {:?}", e))
    };

    return write_stage_file(&staged_xml);
}

/// overwrite the stage file with the temp file's data
pub fn reset_stage_file() -> Result<String, String> {
    // ensure the default file exists
    let exists = Path::new(DEFAULT_FILE).exists();
    if !exists {
        return Err("default file does not already exist!".to_string());
    }

    // read the default data
    let default_xml = match std::fs::read_to_string(DEFAULT_FILE) {
        Ok(xml) => xml,
        Err(e) => return Err(format!("error resetting defaults: {:?}", e))
    };

    return write_stage_file(&default_xml);
}

pub fn write_stage_file(xml: &str) -> Result<String, String> {
    // write that data to the real file
    return match std::fs::write(FILE_PATH, xml.trim().replace("\t", "  ")) {
        Ok(()) => Ok("file overwritten successfully".to_string()),
        Err(e) => Err(format!("error overwriting: {:?}", e))
    }
}