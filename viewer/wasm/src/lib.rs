/*!
 * Copyright 2022 Cognite AS
 */

use wasm_bindgen::prelude::*;
extern crate console_error_panic_hook;

mod add_three;

fn init() -> () {
    // This provides better error messages in debug mode.
    // It's disabled in release mode so it doesn't bloat up the file size.
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn add_three(input: u32) -> u32 {
    init();

    use web_sys::console;
    console::log_1(&JsValue::from_str(&format!("[add_three.rs] Retrieved the input number {}", input)));

    add_three::add_three(input)
}
