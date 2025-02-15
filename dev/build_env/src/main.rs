extern crate winapi;

use libc;
use std::mem;
use winapi::ctypes::c_void;
use winapi::um::handleapi::CloseHandle;
use winapi::um::processthreadsapi::{GetCurrentProcess, OpenProcessToken};
use winapi::um::securitybaseapi::GetTokenInformation;
use winapi::um::winnt::{TokenElevation, HANDLE, TOKEN_ELEVATION, TOKEN_QUERY};

use fs_extra::dir::{copy, CopyOptions};
use std::os::windows::fs::symlink_dir;
use std::{process::Command, path::{Path, PathBuf}};
use std::fs;

fn is_elevated() -> bool {

    let mut handle: HANDLE = std::ptr::null_mut();
    unsafe { OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &mut handle) };

    let elevation = unsafe { libc::malloc(mem::size_of::<TOKEN_ELEVATION>()) as *mut c_void };
    let size = std::mem::size_of::<TOKEN_ELEVATION>() as u32;
    let mut ret_size = size;
    unsafe {
        GetTokenInformation(
            handle,
            TokenElevation,
            elevation,
            size as u32,
            &mut ret_size,
        )
    };
    let elevation_struct: TOKEN_ELEVATION = unsafe{ *(elevation as *mut TOKEN_ELEVATION)};

    if !handle.is_null() {
        unsafe {
            CloseHandle(handle);
        }
    }

    elevation_struct.TokenIsElevated == 1
}

fn copy_dir(src: &str, dest: &str) -> Result<(), Box<dyn std::error::Error>> {
    println!("Copying dir {} to {}", src, dest);
    
    let options = CopyOptions {
        overwrite: true,
        copy_inside: true,
        ..Default::default()
    };
    let src_path = Path::new(src);
    let dest_path = Path::new(dest);

    let _ = copy(src_path, dest_path, &options);

    println!("\tFinished copying dir.");
    Ok(())
}
fn symlink(target: &str, link: &str) -> std::io::Result<()> {
    println!("Making symlink {}", target);

    let target_path = Path::new(target);
    let sym_path = Path::new(link);
    
    symlink_dir(target_path, sym_path)?;

    println!("\tFinished making symlink.");
    Ok(())
}
fn rmdir(path: &str) -> std::io::Result<()> {
    fs::remove_dir_all(path)?;
    Ok(())
}
fn rmfile(path: &str) -> std::io::Result<()> {
    fs::remove_file(path)?;
    Ok(())
}
fn stop_xampp(path: &PathBuf) -> std::io::Result<()> {
    println!("Stopping XAMPP...");

    Command::new(&join(path, "xampp_stop.exe"))
        .output()
        .expect("Failed to stop XAMPP.");
    println!("\tFinished stopping XAMPP.");

    Ok(())
}
fn join(p: &PathBuf, s: &str) -> String {
    // Converts the PathBuf into a string
    p.join(s).to_string_lossy().to_string()
}
fn main() {
    let mut xampp_path = "C:\\xampp";
    // Check if it doesn't exist
    if !Path::new(xampp_path).exists() {
        xampp_path = "C:\\Program Files\\xampp";
    }
    if !Path::new(xampp_path).exists() {
        xampp_path = "C:\\Program Files (x86)\\xampp";
    }
    if !Path::new(xampp_path).exists() {
        panic!("XAMPP not found.");
    }

    
    let xampp_path = Path::new(xampp_path).to_path_buf();
    let path = std::env::current_dir().unwrap();

    println!("\n======================= build_env =======================");
    println!("XAMPP path: {}", xampp_path.to_string_lossy());
    println!("Current path: {}", path.to_string_lossy());
    println!("===========================================================");
    println!("Warning: while rebuilding local environment, it is best not to launch any XAMPP services or modify XAMPP.");
    println!("Find an issue? Open a PR/issue on GitHub.\n");

    // Make sure we're running with administrative privileges.
    if !is_elevated() {
        panic!("This script won't work without admin privileges.\n");
    }

    // Stop xampp
    let _ = stop_xampp(&xampp_path);

    // Remove existing htdocs/mysql
    //      Will fail if there isn't a directory there, but we don't care:
    let _ = copy_dir(&join(&xampp_path, "htdocs"), &join(&xampp_path, "htdocs-backup"));
    //      Could be a symbolic link or directory
    let _ = rmdir(&join(&xampp_path, "htdocs"));
    let _ = rmfile(&join(&xampp_path, "htdocs"));
    //      Remove mysql/data
    let _ = rmdir(&join(&xampp_path, "mysql\\data"));

    // Copy new htdocs/mysql
    let _ = symlink(&join(&path, "..\\..\\"), &join(&xampp_path, "htdocs"));
    let _ = copy_dir(&join(&path, "..\\rebuild-resourc\\data"), &join(&xampp_path, "mysql\\data"));
    
    // Build filter words
    println!("Building filter words...");
    Command::new("node")
        .arg(&join(&path, "..\\..\\server\\conf\\moderator\\static\\genregex.js"))
        .output()
        .expect("Failed to build filter words.");
    println!("\tFinished building filter words.");
}