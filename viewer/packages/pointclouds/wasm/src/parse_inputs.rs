use nalgebra::Const;
use nalgebra_glm::{vec3, DMat4, DVec3};
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
            min: DVec3::new(self.min[0], self.min[1], self.min[2]),
            max: DVec3::new(self.max[0], self.max[1], self.max[2]),
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

fn create_cylinder(input: InputCylinder, id: u16) -> Box<shapes::cylinder::Cylinder> {
    Box::new(shapes::cylinder::Cylinder::new(
        vec3(input.center_a[0], input.center_a[1], input.center_a[2]),
        vec3(input.center_b[0], input.center_b[1], input.center_b[2]),
        input.radius,
        id,
    ))
}

fn create_box(input: InputOrientedBox, id: u16) -> Box<shapes::oriented_box::OrientedBox> {
    Box::new(shapes::oriented_box::OrientedBox::new(
        DMat4::from_column_slice_generic(Const, Const, &input.inv_instance_matrix),
        id,
    ))
}

fn create_shape(obj: InputShape) -> Box<dyn shapes::shape::Shape> {
    if obj.cylinder.is_some() {
        create_cylinder(*obj.cylinder.unwrap(), obj.object_id)
    } else if obj.oriented_box.is_some() {
        create_box(*obj.oriented_box.unwrap(), obj.object_id)
    } else {
        panic!("Unrecognized input shape");
    }
}

pub fn parse_objects(
    input_shapes: Vec<wasm_bindgen::prelude::JsValue>,
) -> Vec<Box<dyn shapes::shape::Shape>> {
    let mut shape_vec =
        Vec::<Box<dyn shapes::shape::Shape>>::with_capacity(input_shapes.len() as usize);

    for value in input_shapes.iter() {
        let input_shape = value.into_serde::<InputShape>().unwrap();
        shape_vec.push(create_shape(input_shape));
    }

    shape_vec
}
