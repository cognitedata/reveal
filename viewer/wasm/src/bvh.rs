
mod bvh_node;

use bvh_node::BvhNode;
use crate::linalg::{BoundingBox, Vec3};

use std::vec::Vec;
use crate::shapes::shape::Shape;

pub struct BoundingVolumeHierarchy {
    root: BvhNode
}

impl BoundingVolumeHierarchy {
    pub fn new(objects: Vec<(BoundingBox, Box<dyn Shape>)>) -> BoundingVolumeHierarchy {
        BoundingVolumeHierarchy {
            root: BvhNode::new(objects)
        }
    }

    pub fn get_object_id(&self, point: &Vec3) -> u32 {
        self.root.get_object_id(point)
    }
}
