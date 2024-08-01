use tauri::Manager;

#[tauri::command]
fn get_current_name() -> String {
    "user".to_string() // You can replace this with actual logic to get the current user's name
}

#[tauri::command]
async fn handle_command(command: String) -> Result<String, String> {
    // Here you can implement any Rust-side commands you want to keep
    Ok(format!("Received command: {}", command))
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            window.set_title("Tiled Shell Manager").unwrap();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_current_name, handle_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}