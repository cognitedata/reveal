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
    pub fn overlaps(&self, other: &Self) -> bool {
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

    pub fn get_transformed_unit_cube(matrix: &DMat4) -> Self {
        let bounding_box = (0..8)
            .map(|i: u32| {
                let unit_corner = BoundingBox::get_centered_unit_cube_corner(i);
                let transformed_corner = matrix * unit_corner;
                vec4_to_vec3(&transformed_corner)
            })
            .collect();

        bounding_box
    }

    pub fn get_unit_bounding_box() -> Self {
        let points = (0..8).map(|i| vec4_to_vec3(&BoundingBox::get_centered_unit_cube_corner(i)));
        let min_point: DVec3 = points.clone().reduce(|v0, v1| min2(&v0, &v1)).unwrap();
        let max_point: DVec3 = points.reduce(|v0, v1| max2(&v0, &v1)).unwrap();
        BoundingBox {
            min: min_point,
            max: max_point,
        }
    }
}

impl Default for BoundingBox {
    fn default() -> Self {
        BoundingBox {
            min: vec3(f64::INFINITY, f64::INFINITY, f64::INFINITY),
            max: vec3(f64::NEG_INFINITY, f64::NEG_INFINITY, f64::NEG_INFINITY),
        }
    }
}

impl FromIterator<DVec3> for BoundingBox {
    fn from_iter<T>(point_iter: T) -> Self
    where
        T: IntoIterator<Item = DVec3>,
    {
        let mut bounding_box: BoundingBox = Default::default();

        point_iter
            .into_iter()
            .for_each(|p| bounding_box.add_point(&p));

        bounding_box
    }
}
