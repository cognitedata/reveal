
use crate::linalg::{BoundingBox,Vec3WithIndex};

use super::octree_node2::OctreeNode2;
use std::vec::Vec;

use crate::shapes::shape::Shape;

pub struct PointOctree2<'a> {
    root: OctreeNode2<'a>
}

impl PointOctree2<'_> {
    pub fn new(bounding_box: BoundingBox, points: &mut Vec<Vec3WithIndex>) -> PointOctree2 {
        PointOctree2 {
            root: OctreeNode2::new(bounding_box, points)
        }
    }

    pub fn traverse_points_in_box<F: FnMut(&[Vec3WithIndex]) -> ()>(&self, bounding_box: &BoundingBox, callback: &mut F) -> () {
        self.root.traverse_points_in_box(bounding_box, callback);
    }

    pub fn assign_object_ids(&self, bounding_box: &BoundingBox, shape: &Box<dyn Shape>, object_ids: &js_sys::Uint16Array) -> () {
        self.root.assign_object_ids(bounding_box, shape, object_ids);
    }

    pub fn get_points_in_box(&self, bounding_box: &BoundingBox) -> Vec<Vec3WithIndex> {
        let mut vec = Vec::<Vec3WithIndex>::new();
        self.root.get_points_in_box(bounding_box, &mut vec);

        vec
    }
}
