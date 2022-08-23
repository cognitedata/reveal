
use crate::linalg::{BoundingBox,Vec3WithIndex};

use super::octree_node::OctreeNode;
use std::vec::Vec;

use crate::shapes::shape::Shape;

pub struct PointOctree<'a> {
    root: OctreeNode<'a>
}

impl PointOctree<'_> {
    pub fn new(bounding_box: BoundingBox, points: &mut Vec<Vec3WithIndex>) -> PointOctree {
        PointOctree {
            root: OctreeNode::new(bounding_box, points)
        }
    }

    pub fn assign_object_ids(&self, bounding_box: &BoundingBox, shape: &Box<dyn Shape>, object_ids: &js_sys::Uint16Array) -> () {
        self.root.assign_object_ids(bounding_box, shape, object_ids);
    }
}
