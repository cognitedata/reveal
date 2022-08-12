use crate::linalg::{Vec3, BoundingBox};
use dyn_clone::DynClone;

pub trait Shape: DynClone {
    fn create_bounding_box(&self) -> BoundingBox;
    fn contains_point(&self, point: &Vec3) -> bool;
    fn get_object_id(&self) -> u32;
}

dyn_clone::clone_trait_object!(Shape);
