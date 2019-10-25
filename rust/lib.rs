use console_error_panic_hook;
use std::panic;
use js_sys::{ArrayBuffer, Uint8Array};
use serde::{Deserialize, Serialize};
use wasm_bindgen::JsCast;
use wasm_bindgen::JsValue;
use wasm_bindgen::prelude::*;

// From reveal-rs
use i3df;
use openctm;
use serde_bytes;
use serde;

#[macro_use]
pub mod error;

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
pub fn parse_ctm(array_buffer_value: JsValue) -> Result<CtmResult, JsValue> {
    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    assert!(array_buffer_value.is_instance_of::<ArrayBuffer>());

    let uint8_array = Uint8Array::new(&array_buffer_value);
    let mut result = vec![0; uint8_array.byte_length() as usize];
    uint8_array.copy_to(&mut result);

    let file = openctm::parse(std::io::Cursor::new(result)).unwrap();

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
pub fn parse_root_sector(array_buffer_value: JsValue) -> Result<SectorHandle, JsValue> {
    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    assert!(array_buffer_value.is_instance_of::<ArrayBuffer>());

    let uint8_array = Uint8Array::new(&array_buffer_value);
    let mut result = vec![0; uint8_array.byte_length() as usize];
    uint8_array.copy_to(&mut result);
    let cursor = std::io::Cursor::new(result);

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
pub fn parse_sector(root_sector: &SectorHandle, array_buffer_value: JsValue) -> Result<SectorHandle, JsValue> {
    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    assert!(array_buffer_value.is_instance_of::<ArrayBuffer>());

    let uint8_array = Uint8Array::new(&array_buffer_value);
    let mut result = vec![0; uint8_array.byte_length() as usize];
    uint8_array.copy_to(&mut result);
    let cursor = std::io::Cursor::new(result);

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
