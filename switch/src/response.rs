use serde::{Deserialize, Serialize};
use std::fmt;
use skyline_web::{Webpage, WebSession};
use crate::*;

/// a basic string response
#[derive(Serialize, Deserialize)]
pub struct StringResponse {
    pub id: String,
    pub message: String,
    pub more: bool,
}

impl fmt::Display for StringResponse {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "(id: {}, message: {})", self.id, self.message)
    }
}

/// a basic boolean response
#[derive(Serialize, Deserialize)]
pub struct BooleanResponse {
    pub id: String,
    pub result: bool,
}

impl fmt::Display for BooleanResponse {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "(id: {}, message: {})", self.id, self.result)
    }
}

pub trait BoolRespond {
    fn respond_bool(&self, result: bool, id: &String);
}

pub trait StringRespond {
    fn respond_string(&self, message: &str, id: &String);
}

pub trait OkOrError {
    fn ok(&self, message: &str, id: &String);
    fn error(&self, message: &str, id: &String);
}

/// a response that contains a flag for whether the
/// operation was successful, as well as a message field.
#[derive(Serialize, Deserialize)]
pub struct OkOrErrorResponse {
    pub id: String,
    pub ok: bool,
    pub message: String,
    pub more: bool,
}

impl fmt::Display for OkOrErrorResponse {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "(id: {}, ok: {}, message: {})", self.id, self.ok, self.message)
    }
}

pub const FILE:i32 = 0;
pub const DIRECTORY:i32 = 1;

/**
 * represents a single Path entry, which may be a file or directory
 */
#[derive(Serialize, Deserialize)]
pub struct PathEntry {
    pub path: String,
    pub kind: i32
}

/**
 * represents a list of paths
 */
#[derive(Serialize, Deserialize)]
pub struct PathList {
    pub list: Vec<PathEntry>
}

/**
 * represents a directory tree
 */
#[derive(Serialize, Deserialize)]
pub struct DirTree {
    pub name: String,
    pub dirs: Vec<DirTree>,
    pub files: Vec<String>
}