
use crate::linalg::BoundingBox;

use wasm_bindgen::prelude::wasm_bindgen;
use nalgebra_glm::{inverse, max2, min2, abs, vec4_to_vec3};

use crate::linalg::{Mat4, Vec3, vec3, vec4};

use crate::shapes::shape;

#[wasm_bindgen]
pub struct OrientedBox {
    inv_instance_matrix: Mat4,
    object_id: u32
}

impl OrientedBox {
    pub fn new(inv_instance_matrix: Mat4, object_id: u32) -> OrientedBox {
        OrientedBox {
            inv_instance_matrix: inv_instance_matrix,
            object_id: object_id
        }
    }
}

impl shape::Shape for OrientedBox {
    fn contains_point(&self, point: &Vec3) -> bool {
        let maxv4 = max2(&abs(&(self.inv_instance_matrix * vec4(point.x, point.y, point.z, 1.0))), &vec4(0.5, 0.5, 0.5, 1.0));

        vec4_to_vec3(&maxv4) == vec3(0.5, 0.5, 0.5)
    }

    fn create_bounding_box(&self) -> BoundingBox {
        let mut min = vec4(f64::INFINITY, f64::INFINITY, f64::INFINITY, 0.0);
        let mut max = vec4(f64::NEG_INFINITY, f64::NEG_INFINITY, f64::NEG_INFINITY, 0.0);

        let instance_matrix = inverse(&self.inv_instance_matrix);

        for corner_index in 0..8 {
            let corner = vec4(if (corner_index & 1) == 0 { - 0.5 } else { 0.5 },
                              if (corner_index & 2) == 0 { - 0.5 } else { 0.5 },
                              if (corner_index & 4) == 0 { - 0.5 } else { 0.5 },
                              1.0);

            let transformed_corner = instance_matrix * corner;

            min = min2(&min, &transformed_corner);
            max = max2(&max, &transformed_corner);
        }

        BoundingBox { min: vec4_to_vec3(&min), max: vec4_to_vec3(&max) }
    }

    fn get_object_id(&self) -> u32 {
        self.object_id
    }
}
