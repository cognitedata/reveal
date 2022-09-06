use nalgebra_glm::{max2, min2, vec3, vec4, vec4_to_vec3, DMat4, DVec3, DVec4};

#[derive(Clone, Copy, Debug)]
pub struct BoundingBox {
    pub min: DVec3,
    pub max: DVec3,
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Vec3WithIndex {
    pub vec: DVec3,
    pub index: usize,
}

impl BoundingBox {
    pub fn empty() -> BoundingBox {
        BoundingBox {
            min: vec3(f64::INFINITY, f64::INFINITY, f64::INFINITY),
            max: vec3(f64::NEG_INFINITY, f64::NEG_INFINITY, f64::NEG_INFINITY),
        }
    }

    pub fn overlaps(&self, other: &BoundingBox) -> bool {
        self.min.x < other.max.x
            && self.max.x > other.min.x
            && self.min.y < other.max.y
            && self.max.y > other.min.y
            && self.min.z < other.max.z
            && self.max.z > other.min.z
    }

    pub fn add_point(&mut self, point: &DVec3) {
        self.min = min2(&self.min, &point);
        self.max = max2(&self.max, &point);
    }

    pub fn contains_point(&self, point: &DVec3) -> bool {
        min2(&self.min, &point) == self.min && max2(&self.max, &point) == self.max
    }

    pub fn get_centered_unit_cube_corner(corner_index: u32) -> DVec4 {
        vec4(
            if (corner_index & 1) == 0 { -0.5 } else { 0.5 },
            if (corner_index & 2) == 0 { -0.5 } else { 0.5 },
            if (corner_index & 4) == 0 { -0.5 } else { 0.5 },
            1.0,
        )
    }

    pub fn get_transformed_unit_cube(matrix: &DMat4) -> BoundingBox {
        let mut bounding_box = BoundingBox::empty();

        for corner_index in 0..8 {
            let corner = BoundingBox::get_centered_unit_cube_corner(corner_index);

            let transformed_corner = matrix * corner;
            bounding_box.add_point(&vec4_to_vec3(&transformed_corner));
        }

        bounding_box
    }
}
