/*!
 * Copyright 2022 Cognite AS
 */

use wasm_bindgen::prelude::*;
extern crate console_error_panic_hook;

#[cfg(test)]
mod test_setup {
    use wasm_bindgen_test::wasm_bindgen_test_configure;

    wasm_bindgen_test_configure!(run_in_browser);
}

#[cfg(test)]
mod test_utils;

mod linalg;
mod parse_inputs;
mod point_octree;
mod shapes;

use linalg::BoundingBox;
use parse_inputs::InputBoundingBox;

fn init() -> () {
    // This provides better error messages in debug mode.
    // It's disabled in release mode so it doesn't bloat up the file size.
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn assign_points(
    input_objects: Vec<JsValue>,
    input_points: js_sys::Float32Array,
    input_bounding_box: js_sys::Object,
    input_point_offset: Vec<f64>,
) -> Result<js_sys::Uint16Array, String> {
    init();

    let mut point_vec = parse_inputs::parse_points(&input_points, input_point_offset);
    let bounding_box: BoundingBox = input_bounding_box
        .into_serde::<InputBoundingBox>()
        .map_err(|serde_error| {
            format!(
                "Got error while deserializing bounding box: {}",
                serde_error
            )
        })?
        .into();

    let shape_vec = parse_inputs::try_parse_objects(input_objects)?;

    let object_ids = js_sys::Uint16Array::new_with_length(input_points.length() / 3).fill(
        0,
        0,
        input_points.length() / 3,
    );

    let octree = point_octree::PointOctree::new(bounding_box, &mut point_vec);

    shape_vec.iter().for_each(|shape| {
        octree.assign_object_ids(&shape.create_bounding_box(), shape, &object_ids);
    });

    Ok(object_ids)
}
