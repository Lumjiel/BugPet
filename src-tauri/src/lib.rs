use windows::{
    Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowTextW, GetWindowThreadProcessId},
    Win32::Graphics::Gdi::{GetDC, ReleaseDC, GetDeviceCaps},
    Win32::System::SystemInformation::GetTickCount,
    Win32::System::Threading::{
        OpenProcess,
        QueryFullProcessImageNameW,
        PROCESS_ACCESS_RIGHTS,
        PROCESS_NAME_FORMAT,
    },
    Win32::Foundation::{CloseHandle, HWND, RECT},
};

use serde::{Deserialize, Serialize};
use tauri::Manager;
use log::info;
use std::sync::atomic::{AtomicBool, Ordering};

static IS_DRAGGING: AtomicBool = AtomicBool::new(false);

#[repr(C)]
struct LASTINPUTINFO {
    cbSize: u32,
    dwTime: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WindowInfo {
    pub title: String,
    pub process_id: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ActivityInfo {
    pub frontmost_app_name: String,
    pub frontmost_window_title: String,
    pub idle_seconds: u32,
    pub is_coding_app: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ForegroundAppResult {
    pub app: String,
    pub idleTime: u32,
}

fn get_foreground_window_info() -> WindowInfo {
    unsafe {
        let hwnd = GetForegroundWindow();
        let mut title = [0u16; 512];
        let mut process_id = 0u32;

        let len = GetWindowTextW(hwnd, &mut title);
        let title_str = String::from_utf16_lossy(&title[..len as usize]);

        GetWindowThreadProcessId(hwnd, Some(&mut process_id));

        WindowInfo {
            title: title_str,
            process_id,
        }
    }
}

fn get_idle_seconds() -> u32 {
    unsafe {
        #[link(name = "user32")]
        extern "system" {
            fn GetLastInputInfo(plii: *mut LASTINPUTINFO) -> bool;
        }

        let mut last_input = LASTINPUTINFO {
            cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32,
            dwTime: 0,
        };

        if GetLastInputInfo(&mut last_input) {
            let tick_count = GetTickCount();
            let idle_time = (tick_count - last_input.dwTime) / 1000;
            idle_time as u32
        } else {
            0
        }
    }
}

fn get_process_name(process_id: u32) -> String {
    unsafe {
        let handle = match OpenProcess(
            PROCESS_ACCESS_RIGHTS(0x1000),
            false,
            process_id
        ) {
            Ok(h) => h,
            Err(_) => return String::new(),
        };

        let mut name = [0u16; 512];
        let mut size = name.len() as u32;

        let success = QueryFullProcessImageNameW(
            handle,
            PROCESS_NAME_FORMAT(0),
            windows::core::PWSTR(name.as_mut_ptr()),
            &mut size
        );

        let _ = CloseHandle(handle);

        if success.is_ok() {
            let path = String::from_utf16_lossy(&name[..size as usize]);
            path.split('\\').last().unwrap_or_default().to_string()
        } else {
            String::new()
        }
    }
}

fn is_coding_app(app_name: &str) -> bool {
    let coding_apps = vec!["code", "devenv", "rider", "idea", "webstorm", "pycharm", "goland", "clion", "androidstudio", "sublime_text", "atom", "notepad++", "vim", "emacs", "cursor", "trae"];
    let lower = app_name.to_lowercase();
    coding_apps.iter().any(|app| lower.contains(&app.to_lowercase()))
}

#[tauri::command]
fn get_foreground_app() -> ForegroundAppResult {
    let window_info = get_foreground_window_info();
    let app_name = get_process_name(window_info.process_id);
    let idle_seconds = get_idle_seconds();

    info!("Foreground app: {}, idle: {}s", app_name, idle_seconds);

    ForegroundAppResult {
        app: app_name,
        idleTime: idle_seconds,
    }
}

#[tauri::command]
fn get_activity_info() -> ActivityInfo {
    let window_info = get_foreground_window_info();
    let app_name = get_process_name(window_info.process_id);
    let idle_seconds = get_idle_seconds();
    let is_coding = is_coding_app(&app_name);

    info!("Activity: app={}, title={}, idle={}s, coding={}",
          app_name, window_info.title, idle_seconds, is_coding);

    ActivityInfo {
        frontmost_app_name: app_name,
        frontmost_window_title: window_info.title,
        idle_seconds,
        is_coding_app: is_coding,
    }
}

#[tauri::command]
fn get_idle_time() -> u32 {
    get_idle_seconds()
}

#[tauri::command]
fn get_process_path(process_id: u32) -> Result<String, String> {
    unsafe {
        let handle = match OpenProcess(
            PROCESS_ACCESS_RIGHTS(0x1000),
            false,
            process_id
        ) {
            Ok(h) => h,
            Err(e) => return Err(format!("无法打开进程: {:?}", e)),
        };

        let mut name = [0u16; 512];
        let mut size = name.len() as u32;

        let success = QueryFullProcessImageNameW(
            handle,
            PROCESS_NAME_FORMAT(0),
            windows::core::PWSTR(name.as_mut_ptr()),
            &mut size
        );

        let _ = CloseHandle(handle);

        if success.is_ok() {
            Ok(String::from_utf16_lossy(&name[..size as usize]))
        } else {
            Err("获取进程路径失败".into())
        }
    }
}

#[tauri::command]
fn start_drag(_window: tauri::Window) -> Result<(), String> {
    info!("Start drag");
    IS_DRAGGING.store(true, Ordering::SeqCst);
    Ok(())
}

#[tauri::command]
fn move_window(window: tauri::Window, delta_x: f64, delta_y: f64) -> Result<(), String> {
    if !IS_DRAGGING.load(Ordering::SeqCst) {
        return Ok(());
    }

    unsafe {
        #[link(name = "user32")]
        extern "system" {
            fn SetWindowPos(hwnd: HWND, hwnd_insert_after: isize, x: i32, y: i32, cx: i32, cy: i32, u_flags: u32) -> i32;
            fn GetWindowRect(hwnd: HWND, lpRect: *mut RECT) -> i32;
            fn GetDC(hwnd: HWND) -> isize;
            fn ReleaseDC(hwnd: HWND, hdc: isize) -> i32;
            fn GetDeviceCaps(hdc: isize, index: i32) -> i32;
        }

        let hwnd = window.hwnd().unwrap();

        let hdc = GetDC(HWND::default());
        let dpi = GetDeviceCaps(hdc, 88);
        let _ = ReleaseDC(HWND::default(), hdc);

        let scale_factor = if dpi > 96 { dpi as f64 / 96.0 } else { 1.0 };

        let mut rect = RECT::default();
        if GetWindowRect(hwnd, &mut rect) != 0 {
            let new_x = rect.left + (delta_x * scale_factor) as i32;
            let new_y = rect.top + (delta_y * scale_factor) as i32;
            let u_flags = 0x0001 | 0x0004;
            SetWindowPos(hwnd, 0, new_x, new_y, 0, 0, u_flags);
        }
    }

    Ok(())
}

#[tauri::command]
fn end_drag(_window: tauri::Window) -> Result<(), String> {
    info!("End drag");
    IS_DRAGGING.store(false, Ordering::SeqCst);
    Ok(())
}

#[tauri::command]
fn get_main_window_rect() -> Result<(i32, i32, i32, i32), String> {
    unsafe {
        #[link(name = "user32")]
        extern "system" {
            fn GetWindowRect(hwnd: HWND, lpRect: *mut RECT) -> i32;
        }

        let hwnd = GetForegroundWindow();
        let mut rect = RECT::default();
        if GetWindowRect(hwnd, &mut rect) != 0 {
            Ok((rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top))
        } else {
            Err("Failed to get window rect".into())
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
        .init();

    info!("BugPet starting...");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            info!("BugPet setup complete");
            let window = app.get_webview_window("main").unwrap();
            window.set_ignore_cursor_events(false).ok();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_foreground_app,
            get_activity_info,
            get_idle_time,
            get_process_path,
            start_drag,
            move_window,
            end_drag,
            get_main_window_rect
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}