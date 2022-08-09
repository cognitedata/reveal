use crate::Vec3WithIndex;

use std::vec::Vec;

mod octree_node;
use octree_node::*;

use crate::linalg::{Vec3, BoundingBox};

pub struct PointOctree {
    root: OctreeNode
}

impl PointOctree {
    pub fn new(points: Vec<Vec3WithIndex>, bounding_box: BoundingBox) -> PointOctree {
        PointOctree {
            root: OctreeNode::new(points, bounding_box)
        }
    }

    pub fn get_points_in_box(&self, bounding_box: &BoundingBox) -> Vec<Vec3WithIndex> {
        let mut v: Vec<Vec3WithIndex> = Vec::new();

        self.root.get_points_in_box(bounding_box, &mut v);

        v
    }
}
