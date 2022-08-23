use crate::linalg::BoundingBox;

use nalgebra_glm::{inverse, max2, min2, vec4_to_vec3};

use crate::linalg::{vec3, vec4, Mat4, Vec3};

use crate::shapes::shape;

pub struct OrientedBox {
    inv_instance_matrix: Mat4,
    object_id: u32,
}

impl OrientedBox {
    pub fn new(inv_instance_matrix: Mat4, object_id: u32) -> OrientedBox {
        OrientedBox {
            inv_instance_matrix: inv_instance_matrix,
            object_id: object_id,
        }
    }
}

impl shape::Shape for OrientedBox {
    fn contains_point(&self, point: &Vec3) -> bool {
        let transformed_point = vec4_to_vec3(&(self.inv_instance_matrix * vec4(point.x, point.y, point.z, 1.0)));
        BoundingBox {
            min: vec3(-0.5, -0.5, -0.5),
            max: vec3(0.5, 0.5, 0.5)
        }.contains_point(&transformed_point)
    }

    fn create_bounding_box(&self) -> BoundingBox {
        let mut min = vec4(f64::INFINITY, f64::INFINITY, f64::INFINITY, 0.0);
        let mut max = vec4(f64::NEG_INFINITY, f64::NEG_INFINITY, f64::NEG_INFINITY, 0.0);

        let instance_matrix = inverse(&self.inv_instance_matrix);

        for corner_index in 0..8 {
            let corner = vec4(
                if (corner_index & 1) == 0 { -0.5 } else { 0.5 },
                if (corner_index & 2) == 0 { -0.5 } else { 0.5 },
                if (corner_index & 4) == 0 { -0.5 } else { 0.5 },
                1.0,
            );

            let transformed_corner = instance_matrix * corner;

            min = min2(&min, &transformed_corner);
            max = max2(&max, &transformed_corner);
        }

        BoundingBox {
            min: vec4_to_vec3(&min),
            max: vec4_to_vec3(&max),
        }
    }

    fn get_object_id(&self) -> u32 {
        self.object_id
    }
}

#[cfg(test)]
mod tests {
    use wasm_bindgen_test::wasm_bindgen_test;

    use super::OrientedBox;
    use super::{vec3, vec4};
    use crate::linalg::Mat4;
    use crate::shapes::shape::Shape;

    use nalgebra_glm::{abs, comp_max, half_pi, inverse, rotate_x, scale, translate, vec4_to_vec3};

    #[wasm_bindgen_test]
    fn identity_oriented_box_contains_origin() {
        let ob = OrientedBox::new(Mat4::identity(), 0);
        assert!(ob.contains_point(&vec3(0.0, 0.0, 0.0)));
    }

    #[wasm_bindgen_test]
    fn identity_oriented_box_does_not_contain_cardinal_unit_vectors() {
        let ob = OrientedBox::new(Mat4::identity(), 0);
        assert!(!ob.contains_point(&vec3(1.0, 0.0, 0.0)));
        assert!(!ob.contains_point(&vec3(0.0, 1.0, 0.0)));
        assert!(!ob.contains_point(&vec3(0.0, 0.0, 1.0)));
    }

    #[wasm_bindgen_test]
    fn translated_oriented_box_contains_only_translated_origin() {
        let ob = OrientedBox::new(
            nalgebra_glm::inverse(&translate(&Mat4::identity(), &vec3(1.0, 1.0, 1.0))),
            0,
        );
        assert!(!ob.contains_point(&vec3(0.0, 0.0, 0.0)));
        assert!(ob.contains_point(&vec3(1.0, 1.0, 1.0)));
    }

    #[wasm_bindgen_test]
    fn scaled_oriented_box_contains_only_points_in_scaled_direction() {
        let ob = OrientedBox::new(inverse(&scale(&Mat4::identity(), &vec3(3.0, 1.0, 1.0))), 0);
        assert!(ob.contains_point(&vec3(1.0, 0.0, 0.0)));
        assert!(!ob.contains_point(&vec3(0.0, 1.0, 0.0)));
        assert!(!ob.contains_point(&vec3(0.0, 0.0, 1.0)));
    }

    #[wasm_bindgen_test]
    fn scaled_and_rotated_oriented_box_contains_the_right_points() {
        let matrix = inverse(&scale(
            &rotate_x(&Mat4::identity(), half_pi()),
            &vec3(1.0, 3.0, 1.0),
        ));

        let ob = OrientedBox::new(matrix, 0);
        assert!(!ob.contains_point(&vec3(1.0, 0.0, 0.0)));
        assert!(!ob.contains_point(&vec3(0.0, 1.0, 0.0)));
        assert!(ob.contains_point(&vec3(0.0, 0.0, 1.0)));
    }

    #[wasm_bindgen_test]
    fn identitys_bounding_box_is_identity() {
        let original_box = OrientedBox::new(Mat4::identity(), 0);
        let bounding_box = original_box.create_bounding_box();

        assert!(comp_max(&abs(&(bounding_box.min - vec3(-0.5, -0.5, -0.5)))) < 1e-2);
        assert!(comp_max(&abs(&(bounding_box.max - vec3(0.5, 0.5, 0.5)))) < 1e-2);
    }

    #[wasm_bindgen_test]
    fn bounding_box_contains_transformed_origin() {
        let matrix = translate(
            &scale(&rotate_x(&Mat4::identity(), 1.0), &vec3(2.0, 1.0, 0.5)),
            &vec3(10.0, 93.0, 0.2),
        );

        let original_box = OrientedBox::new(inverse(&matrix), 0);
        let bounding_box = original_box.create_bounding_box();

        let transformed_origin = vec4_to_vec3(&(matrix * vec4(0.0, 0.0, 0.0, 1.0)));
        bounding_box.contains_point(&transformed_origin);
    }
}
