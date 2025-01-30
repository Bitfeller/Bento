use fs_extra::dir::{copy, CopyOptions};
use std::os::windows::fs::symlink_dir;
use std::{process::Command, path::Path};

fn copy_dir(src: &str, dest: &str) -> Result<(), Box<dyn std::error::Error>> {
    println!("Copying dir {} to {}", src, dest);
    
    let options = CopyOptions {
        overwrite: true,
        ..Default::default()
    };
    let src_path = Path::new(src);
    let dest_path = Path::new(dest);

    let _ = copy(src_path, dest_path, &options);

    println!("\tFinished copying dir.");
    Ok(())
}
fn symlink(target: &str, link: &str) -> Result<(), std::io::Error> {
    println!("Making symlink {}", target);

    let target_path = Path::new(target);
    let sym_path = Path::new(link);
    
    symlink_dir(target_path, sym_path)?;

    println!("\tFinished making symlink.");
    Ok(())
}
fn stop_xampp() -> Result<(), std::io::Error> {
    println!("Stopping XAMPP");

    Command::new("C:\\xampp\\xampp_stop.exe")
        .output()
        .expect("Failed to stop XAMPP.");
    println!("\tFinished stopping Apache/MySQL.");

    Ok(())
}
fn join(mut p: &Path, s: &str) -> &'a str {
    p.join(s).to_str().unwrap()
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
    let xampp_path = Path::new(xampp_path);
    let path = std::env::current_dir().unwrap();
    let _ = stop_xampp();
    // Will fail if there isn't a directory there, but we don't care:
    let _ = copy_dir(join(xampp_path, "htdocs"), join(xampp_path, "htdocs-backup"));
    let _ = symlink(join(path, "..\\..\\"), join(xampp_path, "htdocs"));
    let _ = copy_dir(join(path, "..\\rebuild-resourc\\mysql"), join(xampp_path, "mysql\\data"));
}