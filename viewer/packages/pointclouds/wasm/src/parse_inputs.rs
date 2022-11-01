use nalgebra_glm::{vec3, DMat4};
use std::vec::Vec;

use crate::linalg::BoundingBox;
use crate::linalg::Vec3WithIndex;
use crate::shapes;

use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct InputCylinder {
    center_a: [f64; 3],
    center_b: [f64; 3],
    radius: f64,
}

#[derive(Debug, Deserialize)]
struct InputOrientedBox {
    inv_instance_matrix: [f64; 16],
}

#[derive(Debug, Deserialize)]
pub struct InputShape {
    object_id: u16,
    cylinder: Option<Box<InputCylinder>>,
    oriented_box: Option<Box<InputOrientedBox>>,
}

#[derive(Deserialize)]
pub struct InputBoundingBox {
    pub min: [f64; 3],
    pub max: [f64; 3],
}

impl Into<BoundingBox> for InputBoundingBox {
    fn into(self) -> BoundingBox {
        BoundingBox {
            min: vec3(self.min[0], self.min[1], self.min[2]),
            max: vec3(self.max[0], self.max[1], self.max[2]),
        }
    }
}

pub fn parse_points(
    input_array: &js_sys::Float32Array,
    input_point_offset: Vec<f64>,
) -> Vec<Vec3WithIndex> {
    let point_offset = vec3(
        input_point_offset[0],
        input_point_offset[1],
        input_point_offset[2],
    );

    let point_vec = input_array
        .to_vec()
        .chunks(3)
        .enumerate()
        .map(|(i, p)| Vec3WithIndex {
            vec: vec3(p[0] as f64, p[1] as f64, p[2] as f64) + point_offset,
            index: i,
        })
        .collect();

    point_vec
}

fn create_cylinder(input: InputCylinder, id: u16) -> Box<shapes::Cylinder> {
    Box::new(shapes::Cylinder::new(
        vec3(input.center_a[0], input.center_a[1], input.center_a[2]),
        vec3(input.center_b[0], input.center_b[1], input.center_b[2]),
        input.radius,
        id,
    ))
}

fn create_box(input: InputOrientedBox, id: u16) -> Box<shapes::OrientedBox> {
    Box::new(shapes::OrientedBox::new(
        DMat4::from_column_slice(&input.inv_instance_matrix),
        id,
    ))
}

fn create_shape(obj: InputShape) -> Result<Box<dyn shapes::Shape>, String> {
    if let Some(input_cylinder) = obj.cylinder {
        Ok(create_cylinder(*input_cylinder, obj.object_id))
    } else if let Some(input_box) = obj.oriented_box {
        Ok(create_box(*input_box, obj.object_id))
    } else {
        Err("Unrecognized geometry type found while parsing".to_string())
    }
}

pub fn try_parse_objects(
    input_objects: Vec<wasm_bindgen::prelude::JsValue>,
) -> Result<Vec<Box<dyn shapes::Shape>>, String> {
    let objects_result: Result<_, _> = input_objects
        .into_iter()
        .map(|input_object| {
            let input_shape =
                serde_wasm_bindgen::from_value::<InputShape>(input_object)
                .map_err(|serde_error| {
                    format!("Got error while deserializing shape: {}", serde_error)
                });

            create_shape(input_shape?)
        })
        .collect();

    objects_result
}
