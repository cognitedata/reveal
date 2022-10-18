use nalgebra_glm::DVec3;

use crate::linalg::BoundingBox;

pub trait Shape {
    fn create_bounding_box(&self) -> BoundingBox;
    fn contains_point(&self, point: &DVec3) -> bool;
    fn get_object_id(&self) -> u16;
}
