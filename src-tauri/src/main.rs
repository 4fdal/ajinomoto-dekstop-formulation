#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::process::{Command, Stdio, Child};
use std::os::windows::process::CommandExt;
use std::sync::{Arc, Mutex};
use tauri::Manager;

const CREATE_NO_WINDOW: u32 = 0x08000000;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let executable_paths = vec![
                // "resources/be/prisma-backend.exe",
                // "resources/sc/prisma-scale-service.exe",
                "resources/pr/prisma-printer-service.exe",
                // "resources/ws/prisma-websocket-service.exe",
                "resources/sy/prisma-syncronizer.exe",
                // Add more paths as needed
            ];

            // Shared vector to hold the child processes
            let child_processes: Arc<Mutex<Vec<Child>>> = Arc::new(Mutex::new(Vec::new()));

            for path in executable_paths {
                // Construct the full path to the executable in the resources folder
                let exe_path = app
                    .path_resolver()
                    .resolve_resource(path)
                    .expect("failed to resolve resource dir");

                // Convert the path to a string and strip the `\\?\` prefix if present
                let exe_path_str = exe_path.to_str().unwrap().to_string();
                let stripped_path = exe_path_str.strip_prefix(r"\\?\").unwrap_or(&exe_path_str);

                println!("Executable path: {}", stripped_path);

                // Get the directory path containing the executable
                let exe_dir = exe_path.parent().expect("Failed to get executable directory");

                // Attempt to run the executable from its directory
                let result = Command::new(stripped_path)
                    .current_dir(exe_dir)
                    .creation_flags(CREATE_NO_WINDOW)
                    .stdout(Stdio::null())
                    .stderr(Stdio::null())
                    .spawn();

                match result {
                    Ok(child) => {
                        // child_processes.push(child);
                        println!("Successfully started {}", path);
                        child_processes.lock().unwrap().push(child);
                    }
                    Err(e) => {
                        eprintln!("Failed to execute {}: {}", path, e);
                    }
                }
            }

            // Clone the Arc so it can be moved into the event handler
            let child_processes = Arc::clone(&child_processes);

            // Listen for the custom event and kill the child processes
            app.listen_global("kill-processes", move |_| {
                let mut processes = child_processes.lock().unwrap();
                for child in processes.iter_mut() {
                    match child.kill() {
                        Ok(_) => println!("Killed process"),
                        Err(e) => eprintln!("Failed to kill process: {}", e),
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
