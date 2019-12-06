use console_error_panic_hook;
use std::panic;
use js_sys::{Float32Array};
use serde::{Deserialize, Serialize};
use wasm_bindgen::JsValue;
use wasm_bindgen::prelude::*;

// From reveal-rs
use i3df;
use f3df;
use openctm;
use serde_bytes;
use serde;

#[macro_use]
pub mod error;

// NOTE this is a workaround because alloc_zeroed takes a lot of time
// TODO figure out why lzma-rs spends so much time calling alloc_zeroed
use std::alloc::{GlobalAlloc, Layout, System};

struct Allocator;

unsafe impl GlobalAlloc for Allocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        System.alloc(layout)
    }
    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        System.dealloc(ptr, layout)
    }
    unsafe fn alloc_zeroed(&self, layout: Layout) -> *mut u8 {
        System.alloc(layout)
    }
}

#[global_allocator]
static GLOBAL: Allocator = Allocator;

#[derive(Deserialize, Serialize)]
struct UvMap {
    //pub name: String,
    //pub filename: String,
    #[serde(with = "serde_bytes")]
    pub uv: Vec<u8>, // actually u32
}

#[derive(Deserialize, Serialize)]
struct Body {
    #[serde(with = "serde_bytes")]
    pub indices: Vec<u8>, // actually u32
    #[serde(with = "serde_bytes")]
    pub vertices: Vec<u8>, // actually f32
    pub normals: Vec<u8>, // actually f32
    pub uv_maps: Vec<UvMap>,
}

#[derive(Deserialize, Serialize)]
struct Ctm {
    pub body: Body,
}

#[wasm_bindgen]
pub struct CtmResult {
    file: openctm::File,
}

#[wasm_bindgen]
impl CtmResult {
    // TODO 20191023 dragly can we go directly to Vec<u32>?
    pub fn indices(&self) -> Vec<u32> {
        self.file.indices.clone()
    }
    pub fn vertices(&self) -> Vec<f32> {
        let data_as_vector3 = &self.file.vertices;
        unsafe {
            std::slice::from_raw_parts(
                data_as_vector3.as_ptr() as *const f32,
                data_as_vector3.len() * 3,
            )
            .to_vec()
        }
    }
    pub fn normals(&self) -> Option<Vec<f32>> {
        let data_as_vector3 = match &self.file.normals {
            Some(x) => x,
            None => return None,
        };
        let data_as_f32 = unsafe {
            std::slice::from_raw_parts(
                data_as_vector3.as_ptr() as *const f32,
                data_as_vector3.len() * 3,
            )
            .to_vec()
        };
        Some(data_as_f32)
    }
    // TODO 2019-10-23 dragly: add UV maps
}

#[wasm_bindgen]
pub fn parse_ctm(input: &[u8]) -> Result<CtmResult, JsValue> {
    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let cursor = std::io::Cursor::new(input);
    let file = openctm::parse(cursor).unwrap();

    let result = CtmResult {
        file,
    };

    Ok(result)
}

#[wasm_bindgen]
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct SectorHandle {
    sector: i3df::Sector,
}

#[wasm_bindgen]
pub fn parse_root_sector(input: &[u8]) -> Result<SectorHandle, JsValue> {
    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let cursor = std::io::Cursor::new(input);

    // TODO see if it is possible to simplify this so we can use the ? operator instead
    let sector = match i3df::parse_root_sector(cursor) {
        Ok(x) => x,
        Err(e) => return Err(JsValue::from(error::ParserError::from(e)))
    };
    Ok(SectorHandle {
        sector
    })
}

#[wasm_bindgen]
pub fn parse_sector(root_sector: &SectorHandle, input: &[u8]) -> Result<SectorHandle, JsValue> {

    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let cursor = std::io::Cursor::new(input);

    let attributes = match &root_sector.sector.header.attributes {
        Some(x) => x,
        None => return Err(error!("Attributes missing on root sector")),
    };

    let sector = match i3df::parse_sector(attributes, cursor) {
        Ok(x) => x,
        Err(e) => return Err(JsValue::from(error::ParserError::from(e)))
    };
    Ok(SectorHandle {
        sector
    })
}

#[wasm_bindgen]
pub fn convert_sector(sector: &SectorHandle) -> i3df::renderables::Sector {
    i3df::renderables::convert_sector(&sector.sector)
}

#[wasm_bindgen]
pub fn parse_and_convert_f3df(input: &[u8]) -> Result<Float32Array, JsValue> {
    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let cursor = std::io::Cursor::new(input);

    let sector = match f3df::parse_sector(cursor) {
        Ok(x) => x,
        Err(e) => return Err(JsValue::from(error::ParserError::from(e)))
    };

    let faces = f3df::renderables::convert_sector(&sector);
    let faces_as_f32 = unsafe {
        // At this point, we do not want to pass Vec<Face> to JS,
        // because it will turn into an inefficient array of objects.
        // Instead, we want to use the more performant Float32Array to hold the data and only make
        // sense of it in WebGL from now on.
        // This requires us to use an unsafe block here to get a view into the data as if it was
        // just &[f32].
        // However, this is safe because we are making a copy below.
        // Otherwise, we would not know when to free the memory on our end.
        let pointer = faces.as_ptr() as *const f32;
        let length = faces.len() * std::mem::size_of::<f3df::renderables::Face>() / std::mem::size_of::<f32>();
        std::slice::from_raw_parts(
            pointer,
            length
        )
    };

    // Returning a Vec<f32> here would lead to copying on the JS side instead.
    // Also note that using a Float32Array::view here instead would be _very_ unsafe.
    let result = Float32Array::from(faces_as_f32);

    Ok(result)
}

#[wasm_bindgen]
pub fn test() -> String {
    "Hello from rust".into()
}
