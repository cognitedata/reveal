
mod bvh_node;

use bvh_node::BvhNode;
use crate::linalg::{BoundingBox, Vec3};

use std::vec::Vec;
use crate::shapes::shape::Shape;

pub struct BoundingVolumeHierarchy<'a>{
    root: Option<BvhNode<'a>>
}

impl BoundingVolumeHierarchy<'_> {
    pub fn new(objects: &mut [(BoundingBox, Box<dyn Shape>)]) -> BoundingVolumeHierarchy {
        if objects.len() == 0 {
            BoundingVolumeHierarchy {
                root: Option::None
            }
        } else {
            BoundingVolumeHierarchy {
                root: Option::Some(BvhNode::new(objects))
            }
        }
    }

    pub fn get_object_id(&self, point: &Vec3) -> u32 {
        if self.root.is_some() {
            self.root.as_ref().unwrap().get_object_id(point)
        } else {
            0
        }
    }
}
