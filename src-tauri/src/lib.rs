#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      
      // Spawn sidecar
      use tauri_plugin_shell::ShellExt;
      let sidecar_command = app.shell().sidecar("sidecar").expect("failed to create sidecar command");
      let (_receiver, mut child) = sidecar_command.spawn().expect("failed to spawn sidecar");
      
      tauri::async_runtime::spawn(async move {
          println!("Sidecar process started.");
      });
      
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
