use crate::linalg::{BoundingBox, Vec3};

pub trait Shape {
    fn create_bounding_box(&self) -> BoundingBox;
    fn contains_point(&self, point: &Vec3) -> bool;
    fn get_object_id(&self) -> u16;
}
