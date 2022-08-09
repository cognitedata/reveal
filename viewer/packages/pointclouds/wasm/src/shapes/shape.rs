use crate::linalg::{Vec3, BoundingBox};

pub trait Shape {
    fn create_bounding_box(&self) -> BoundingBox;
    fn contains_point(&self, point: &Vec3) -> bool;
    fn get_object_id(&self) -> u32;
}
