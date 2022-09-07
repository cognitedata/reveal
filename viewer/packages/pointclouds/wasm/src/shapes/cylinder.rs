use nalgebra_glm::{dot, mat3_to_mat4, vec3, vec4, DMat3, DMat4, DVec3};

use crate::linalg::BoundingBox;
use crate::shapes::shape::Shape;

pub struct Cylinder {
    center_a: DVec3,
    center_b: DVec3,
    radius: f64,
    object_id: u16,
}

impl Cylinder {
    pub fn new(center_a: DVec3, center_b: DVec3, radius: f64, object_id: u16) -> Cylinder {
        Cylinder {
            center_a: center_a,
            center_b: center_b,
            radius: radius,
            object_id: object_id,
        }
    }

    fn get_center(&self) -> DVec3 {
        (self.center_a + self.center_b) / 2.0
    }

    fn get_scaled_orthogonal_basis(&self) -> DMat3 {
        let axis_vec = self.center_a - self.center_b;
        let axis_option_0 = vec3(1.0, 0.0, 0.0);
        let axis_option_1 = vec3(0.0, 1.0, 0.0);

        let chosen_axis =
            if dot(&axis_option_0, &axis_vec).abs() < dot(&axis_option_1, &axis_vec).abs() {
                axis_option_0
            } else {
                axis_option_1
            };

        let perp_vector_0: DVec3 = chosen_axis.cross(&axis_vec).normalize() * 2.0 * self.radius;
        let perp_vector_1: DVec3 = perp_vector_0.cross(&axis_vec).normalize() * 2.0 * self.radius;

        DMat3::from_columns(&[axis_vec, perp_vector_0, perp_vector_1])
    }
}

fn create_transform_from_axes(scaled_basis: &DMat3, cylinder_center: &DVec3) -> DMat4 {
    let mut matrix = mat3_to_mat4(scaled_basis);
    matrix.set_column(
        3,
        &vec4(cylinder_center.x, cylinder_center.y, cylinder_center.z, 1.0),
    );

    matrix
}

impl Shape for Cylinder {
    fn contains_point(&self, point: &DVec3) -> bool {
        let center = self.get_center();
        let axis = (self.center_a - self.center_b).normalize();
        let half_height = (self.center_a - self.center_b).magnitude() / 2.0;

        let dist_along_axis = dot(&(point - center), &axis);
        let dist_vector_along_axis = axis * dist_along_axis;
        let axis_relative_middle = point - dist_vector_along_axis;

        let dist_to_axis = (axis_relative_middle - center).magnitude();

        dist_along_axis.abs() < half_height && dist_to_axis < self.radius
    }

    fn create_bounding_box(&self) -> BoundingBox {
        let center = self.get_center();
        let scaled_basis = self.get_scaled_orthogonal_basis();
        let matrix = create_transform_from_axes(&scaled_basis, &center);

        BoundingBox::get_transformed_unit_cube(&matrix)
    }

    fn get_object_id(&self) -> u16 {
        self.object_id
    }
}

#[cfg(test)]
mod tests {
    use nalgebra_glm::vec3;
    use wasm_bindgen_test::wasm_bindgen_test;

    use super::Cylinder;
    use crate::shapes::Shape;

    #[wasm_bindgen_test]
    fn cylinder_at_origin_contains_middle_point() {
        let cylinder = Cylinder::new(vec3(0.0, -0.5, 0.0), vec3(0.0, 0.5, 0.0), 1.0, 0);

        assert!(cylinder.contains_point(&vec3(0.0, 0.0, 0.0)));
    }

    #[wasm_bindgen_test]
    fn thin_diagonal_cylinder_contains_point_in_middle() {
        let center_a = vec3(213.0, -33.0, 983.12);
        let center_b = vec3(-12.0, 234.0, -10.0);

        let middle = (center_a + center_b) / 2.0;
        let outside_middle = middle + vec3(0.1, 0.1, 0.1);

        let cylinder = Cylinder::new(center_a, center_b, 1e-2, 0);

        assert!(cylinder.contains_point(&middle));
        assert!(!cylinder.contains_point(&outside_middle));
    }

    #[wasm_bindgen_test]
    fn cylinder_bounding_box_contains_centers_but_not_more_along_axis() {
        let center_a = vec3(21.0, -33.0, 98.0);
        let center_b = vec3(-12.0, 23.0, -10.0);

        let axis = (center_a - center_b).normalize();

        let cylinder = Cylinder::new(center_a, center_b, 1e-2, 0);
        let bounding_box = cylinder.create_bounding_box();

        assert!(bounding_box.contains_point(&center_a));
        assert!(bounding_box.contains_point(&center_b));
        assert!(!bounding_box.contains_point(&(center_a + axis)));
    }
}
