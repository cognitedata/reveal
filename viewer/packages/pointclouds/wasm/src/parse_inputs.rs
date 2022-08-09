use nalgebra::Const;
use crate::linalg::{Vec3WithIndex, vec3, Vec3, Mat4};

use std::vec::Vec;

use crate::shapes;

use crate::{InputShape,InputCylinder,InputOrientedBox};

pub fn parse_points(array: &js_sys::Float32Array,
                    point_offset: Vec3) -> Vec<Vec3WithIndex> {

    let num_points = array.length() / 3;
    let mut vec = Vec::<Vec3WithIndex>::with_capacity(num_points as usize);

    for i in 0..num_points {
        vec.push(Vec3WithIndex {
            vec: vec3(array.get_index(3 * i + 0) as f64,
                      array.get_index(3 * i + 1) as f64,
                      array.get_index(3 * i + 2) as f64) + point_offset,
            index: i
        });
    }

    vec
}

fn create_cylinder(input: InputCylinder, id: u32) -> Box<shapes::cylinder::Cylinder> {
    Box::<shapes::cylinder::Cylinder>::new(shapes::cylinder::Cylinder::new(vec3(input.center_a[0],
                                         input.center_a[1],
                                         input.center_a[2]),
                                    vec3(input.center_b[0],
                                         input.center_b[1],
                                         input.center_b[2]),
                                    input.radius,
                                    id))
}

fn create_box(input: InputOrientedBox, id: u32) -> Box<shapes::oriented_box::OrientedBox> {
    Box::<shapes::oriented_box::OrientedBox>::new(
        shapes::oriented_box::OrientedBox::new(
            Mat4::from_column_slice_generic(Const, Const, &input.inv_instance_matrix), id))
}

fn create_shape(obj: InputShape) -> Box<dyn shapes::shape::Shape> {
    if obj.cylinder.is_some() {
        create_cylinder(
            *obj.cylinder.unwrap(), obj.object_id)
    } else if obj.oriented_box.is_some() {
        create_box(
            *obj.oriented_box.unwrap(), obj.object_id)
    } else {
        panic!("Unrecognized input shape");
    }
}

pub fn parse_objects(shapes: Vec<InputShape>) -> Vec<Box<dyn shapes::shape::Shape>> {
    let mut new_vec = Vec::<Box<dyn shapes::shape::Shape>>::with_capacity(shapes.len());

    for obj in shapes.into_iter() {
        new_vec.push(create_shape(obj));
    }

    new_vec
}
