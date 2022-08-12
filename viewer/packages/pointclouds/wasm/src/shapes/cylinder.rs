use wasm_bindgen::prelude::wasm_bindgen;
use nalgebra_glm::{min2, max2, dot, vec3_to_vec4, vec4_to_vec3};

use crate::linalg::{Vec3, Mat4, vec3, vec4, BoundingBox};
use crate::shapes::shape::Shape;

#[derive(Clone)]
#[wasm_bindgen]
pub struct Cylinder {
    center_a: Vec3,
    center_b: Vec3,
    radius: f64,
    object_id: u32,
    _middle: Vec3,
}

impl Cylinder {
    pub fn new(center_a: Vec3, center_b: Vec3, radius: f64, object_id: u32) -> Cylinder {
        Cylinder {
            center_a: center_a,
            center_b: center_b,
            radius: radius,
            object_id: object_id,
            _middle: (center_a + center_b) / 2.0
        }
    }
}

impl Shape for Cylinder {
    fn contains_point(&self, point: &Vec3) -> bool {
        /* const { tempPoint0, tempPoint1, tempAxis } = cylinderContainsPointVars;

        tempPoint0.copy(point);
        tempPoint1.copy(point);
        tempAxis.copy(this._axis);

        const distAlongAxis = tempPoint0.sub(this._middle).dot(this._axis);
        const distVectorAlongAxis = tempAxis.multiplyScalar(distAlongAxis);
        const axisRelativeMiddle = tempPoint1.sub(distVectorAlongAxis);

        const distToAxis = axisRelativeMiddle.sub(this._middle).length();

        return Math.abs(distAlongAxis) < this._halfHeight && distToAxis < this._radius; */

        //

        let axis = (self.center_a - self.center_b).normalize();
        let half_height = (self.center_a - self.center_b).magnitude() / 2.0;

        let dist_along_axis = dot(&(point - self._middle), &axis);
        let dist_vector_along_axis = axis * dist_along_axis;
        let axis_relative_middle = point - dist_vector_along_axis;

        let dist_to_axis = (axis_relative_middle - self._middle).magnitude();

        dist_along_axis.abs() < half_height && dist_to_axis < self.radius
    }

    fn create_bounding_box(&self) -> BoundingBox {
        /* const axisVec = this._middle.clone().sub(this._centerB);

        const axisOption0 = new THREE.Vector3(1, 0, 0);
        const axisOption1 = new THREE.Vector3(0, 1, 0);

        const chosenAxis =
        Math.abs(axisOption0.dot(axisVec)) < Math.abs(axisOption1.dot(axisVec)) ? axisOption0 : axisOption1;

        const perpVector0 = chosenAxis.clone().cross(axisVec).normalize().multiplyScalar(this.radius);
        const perpVector1 = perpVector0.clone().cross(axisVec).normalize().multiplyScalar(this.radius);

        const matrix = new THREE.Matrix4().makeBasis(axisVec, perpVector0, perpVector1);
        matrix.setPosition(this._middle);

        const baseBox = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
        return baseBox.applyMatrix4(matrix); */

        //

        let axis_vec = (self.center_a - self.center_b) / 2.0;
        let axis_option_0 = vec3(1.0, 0.0, 0.0);
        let axis_option_1 = vec3(0.0, 1.0, 0.0);

        let chosen_axis =
            if dot(&axis_option_0, &axis_vec).abs() < dot(&axis_option_1, &axis_vec).abs() { axis_option_0 } else { axis_option_1 };

        let perp_vector_0: Vec3 = chosen_axis.cross(&axis_vec).normalize() * self.radius;
        let perp_vector_1: Vec3 = perp_vector_0.cross(&axis_vec).normalize() * self.radius;

        let mut matrix: Mat4 = Mat4::identity();
        matrix.set_column(0, &vec3_to_vec4(&axis_vec));
        matrix.set_column(1, &vec3_to_vec4(&perp_vector_0));
        matrix.set_column(2, &vec3_to_vec4(&perp_vector_1));
        matrix.set_column(3, &vec4(self._middle.x, self._middle.y, self._middle.z, 1.0));

        let mut min = vec4(f64::INFINITY, f64::INFINITY, f64::INFINITY, 0.0);
        let mut max = vec4(f64::NEG_INFINITY, f64::NEG_INFINITY, f64::NEG_INFINITY, 0.0);

        for corner_index in 0..8 {
            let corner = vec4(if (corner_index & 1) == 0 { - 1.0 } else { 1.0 },
                              if (corner_index & 2) == 0 { - 1.0 } else { 1.0 },
                              if (corner_index & 4) == 0 { - 1.0 } else { 1.0 },
                              1.0);

            let transformed_corner = matrix * corner;

            min = min2(&min, &transformed_corner);
            max = max2(&max, &transformed_corner);
        }

        BoundingBox { min: vec4_to_vec3(&min), max: vec4_to_vec3(&max) }
    }

    fn get_object_id(&self) -> u32 {
        self.object_id
    }
}
