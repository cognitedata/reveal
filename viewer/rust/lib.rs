use js_sys::{Float32Array, Map, Uint32Array};
use std::panic;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

#[macro_use]
pub mod error;

#[wasm_bindgen]
pub struct CtmResult {
    file: openctm::File,
}

#[wasm_bindgen]
impl CtmResult {
    pub fn indices(&self) -> Uint32Array {
        Uint32Array::from(self.file.indices.as_slice())
    }
    pub fn vertices(&self) -> Float32Array {
        let data_as_vector3 = &self.file.vertices;
        let vertices_as_f32 = unsafe {
            std::slice::from_raw_parts(
                data_as_vector3.as_ptr() as *const f32,
                data_as_vector3.len() * 3,
            )
        };
        Float32Array::from(vertices_as_f32)
    }
    pub fn normals(&self) -> Option<Float32Array> {
        let data_as_vector3 = match &self.file.normals {
            Some(x) => x,
            None => return None,
        };
        let data_as_f32 = unsafe {
            std::slice::from_raw_parts(
                data_as_vector3.as_ptr() as *const f32,
                data_as_vector3.len() * 3,
            )
        };
        Some(Float32Array::from(data_as_f32))
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

    let result = CtmResult { file };

    Ok(result)
}

#[wasm_bindgen]
pub fn parse_and_convert_sector(input: &[u8]) -> Result<i3df::renderables::Sector, JsValue> {
    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let cursor = std::io::Cursor::new(input);

    // TODO see if it is possible to simplify this so we can use the ? operator instead
    match i3df::parse_sector(cursor) {
        Ok(x) => Ok(i3df::renderables::convert_sector(&x)),
        Err(e) => Err(JsValue::from(error::ParserError::from(e))),
    }
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct SimpleSectorData {
    faces: Float32Array,
    node_id_to_tree_index_map: Map,
    tree_index_to_node_id_map: Map,
}

#[wasm_bindgen]
impl SimpleSectorData {
    pub fn faces(&self) -> Float32Array {
        self.faces.clone()
    }
    pub fn node_id_to_tree_index_map(&self) -> Map {
        self.node_id_to_tree_index_map.clone()
    }
    pub fn tree_index_to_node_id_map(&self) -> Map {
        self.tree_index_to_node_id_map.clone()
    }
}

#[wasm_bindgen]
pub fn parse_and_convert_f3df(input: &[u8]) -> Result<SimpleSectorData, JsValue> {
    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let cursor = std::io::Cursor::new(input);

    let sector = match f3df::parse_sector(cursor) {
        Ok(x) => x,
        Err(e) => return Err(JsValue::from(error::ParserError::from(e))),
    };

    let renderable_sector = f3df::renderables::convert_sector(&sector);
    let faces_as_f32: &[f32] = unsafe {
        // At this point, we do not want to pass Vec<Face> to JS,
        // because it will turn into an inefficient array of objects.
        // Instead, we want to use the more performant Float32Array to hold the data and only make
        // sense of it in WebGL from now on.
        // This requires us to use an unsafe block here to get a view into the data as if it was
        // just &[f32].
        // However, this is safe because we are making a copy below.
        // Otherwise, we would not know when to free the memory on our end.
        let pointer = renderable_sector.faces.as_ptr() as *const f32;
        let length = renderable_sector.faces.len() * std::mem::size_of::<f3df::renderables::Face>()
            / std::mem::size_of::<f32>();
        std::slice::from_raw_parts(pointer, length)
    };

    // Returning a Vec<f32> here would lead to copying on the JS side instead.
    // Also note that using a Float32Array::view here instead would be _very_ unsafe.
    let faces_as_float_32_array = Float32Array::from(faces_as_f32);

    Ok(SimpleSectorData {
        faces: faces_as_float_32_array,
        node_id_to_tree_index_map: Map::from(
            serde_wasm_bindgen::to_value(&renderable_sector.node_id_to_tree_index_map).unwrap(),
        ),
        tree_index_to_node_id_map: Map::from(
            serde_wasm_bindgen::to_value(&renderable_sector.tree_index_to_node_id_map).unwrap(),
        ),
    })
}

#[wasm_bindgen]
pub fn test() -> String {
    "Hello from rust".into()
}
