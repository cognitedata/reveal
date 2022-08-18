/*!
 * Copyright 2022 Cognite AS
 */

use wasm_bindgen::prelude::*;
extern crate console_error_panic_hook;

 #[cfg(test)]
mod test_setup {
    use wasm_bindgen_test;

    wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);
}

use serde::Deserialize;

mod shapes;
mod linalg;
mod parse_inputs;
mod point_octree;

use linalg::to_bounding_box;

#[derive(Deserialize)]
pub struct InputBoundingBox {
    min: [f64; 3],
    max: [f64; 3]
}

#[derive(Debug,Deserialize)]
struct InputCylinder {
    center_a: [f64; 3],
    center_b: [f64; 3],
    radius: f64
}

#[derive(Debug,Deserialize)]
struct InputOrientedBox {
    inv_instance_matrix: [f64; 16]
}

#[wasm_bindgen]
#[derive(Debug,Deserialize)]
pub struct InputShape {
    object_id: u32,
    cylinder: Option<Box<InputCylinder>>,
    oriented_box: Option<Box<InputOrientedBox>>
}

fn init() -> () {
    // This provides better error messages in debug mode.
    // It's disabled in release mode so it doesn't bloat up the file size.
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn assign_points(input_shapes: js_sys::Array,
                     input_points: js_sys::Float32Array,
                     input_bounding_box: js_sys::Object,
                     input_point_offset: js_sys::Array) -> js_sys::Uint16Array {
    init();

    let mut point_vec = parse_inputs::parse_points(&input_points, input_point_offset);
    let bounding_box = to_bounding_box(&input_bounding_box.into_serde::<InputBoundingBox>().unwrap());
    let shape_vec = parse_inputs::parse_objects(input_shapes);

    let object_ids = js_sys::Uint16Array::new_with_length(input_points.length() / 3)
        .fill(0, 0, input_points.length() / 3);

    let octree = point_octree::PointOctree::new(bounding_box, &mut point_vec);
    for shape in shape_vec.iter() {
        octree.assign_object_ids(&shape.create_bounding_box(), shape, &object_ids);
    }

    object_ids
}
