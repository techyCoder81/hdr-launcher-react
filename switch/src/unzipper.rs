use std::{path::Path, io::{BufRead, BufReader, Read, Seek, SeekFrom}};

pub struct NintendoFile {
    handle: nn::fs::FileHandle,
    offset: isize,
    file_size: isize,
}

impl NintendoFile {
    pub fn open(path: &str) -> std::io::Result<Self> {
        std::thread::sleep(std::time::Duration::from_millis(100));
        let mut file_handle = nn::fs::FileHandle {
            handle: 0 as _
        };

        unsafe {
            let result = nn::fs::OpenFile(&mut file_handle, [path, "\0"].concat().as_ptr(), (nn::fs::OpenMode_OpenMode_Read | nn::fs::OpenMode_OpenMode_Write | nn::fs::OpenMode_OpenMode_Append) as i32);
            if result != 0x0 {
                return Err(std::io::Error::from_raw_os_error(result as i32));
            }

            let mut file_size = 0;
            let result = nn::fs::GetFileSize(&mut file_size, file_handle);
            if result != 0x0 {
                return Err(std::io::Error::from_raw_os_error(result as i32));
            }

            Ok(Self {
                handle: file_handle,
                offset: 0,
                file_size: file_size as isize
            })
        }
    }
}

impl Drop for NintendoFile {
    fn drop(&mut self) {
        unsafe {
            nn::fs::CloseFile(self.handle);
        }
    }
}

impl Read for NintendoFile {
    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
        // println!("Reading {} bytes!", buf.len());
        unsafe {
            let mut size = 0;
            let result = nn::fs::ReadFile1(&mut size, self.handle, self.offset as i64, buf.as_mut_ptr() as _, buf.len() as u64);
            if result != 0x0 {
                Err(std::io::Error::from_raw_os_error(result as i32))
            } else {
                self.offset += size as isize;
                Ok(size as usize)
            }
        }
    }
}

impl Seek for NintendoFile {
    fn seek(&mut self, pos: SeekFrom) -> std::io::Result<u64> {
        // println!("Seeking {:?}", pos);
        match pos {
            SeekFrom::Start(offset) => self.offset = offset as isize,
            SeekFrom::Current(offset) => self.offset += offset as isize,
            SeekFrom::End(offset) => self.offset = self.file_size + offset as isize
        }

        if self.offset < 0 {
            Err(std::io::Error::new(std::io::ErrorKind::InvalidInput, "File offset cannot be negative"))
        } else {
            Ok(self.offset as u64)
        }
    }
}

use skyline::nn;
use zip::{result::ZipResult, ZipArchive};

pub fn list_zip_contents(zip_path: &str) -> ZipResult<()> {
    let file = NintendoFile::open(zip_path)?;
    let reader = BufReader::new(file);
    let mut zip = zip::ZipArchive::new(reader)?;
    for i in 0..zip.len() {
        let mut file = zip.by_index(i)?;
        println!("FileName: {}", file.name());
    }

    Ok(())
}

pub fn get_zip_archive(zip_path: &str) -> ZipResult<ZipArchive<BufReader<NintendoFile>>> {
    let file = NintendoFile::open(zip_path)?;
    let reader = BufReader::new(file);
    zip::ZipArchive::new(reader)
}