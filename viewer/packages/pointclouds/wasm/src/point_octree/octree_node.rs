use crate::Vec3WithIndex;

use std::vec::Vec;
use std::convert::TryInto;

use crate::linalg::{Vec3, vec3,BoundingBox,boxes_overlap};

pub const MAX_POINTS_PER_NODE: usize = 1_000;
pub const MIN_OCTREE_SIZE: f64 = 0.0625;

#[derive(Debug)]
pub struct OctreeNode {
    // Exactly one of these are present
    points: Option<Vec<Vec3WithIndex>>,
    children: Option<[Box<OctreeNode>; 8]>,

    bounding_box: BoundingBox
}

impl OctreeNode {
    pub fn new(points: Vec<Vec3WithIndex>, bounding_box: BoundingBox) -> OctreeNode {

        if points.len() <= MAX_POINTS_PER_NODE || bounding_box.max.x - bounding_box.min.x < MIN_OCTREE_SIZE {
            OctreeNode {
                points: Option::Some(points),
                children: Option::None,
                bounding_box
            }
        } else {
            let children = split(&points, &bounding_box);
            OctreeNode {
                points: Option::None,
                children: Option::Some(children),
                bounding_box
            }
        }
    }

    pub fn get_points_in_box(&self, bounding_box: &BoundingBox, v: &mut Vec<Vec3WithIndex> ) -> () {
        if self.points.is_some() {
            for point in self.points.as_ref().unwrap().iter() {
                v.push(point.clone());
            }
        } else {
            for child in self.children.as_ref().unwrap().iter() {
                if boxes_overlap(bounding_box, &child.bounding_box) {
                    child.get_points_in_box(bounding_box, v);
                }
            }
        }
    }
}


fn split(points: &Vec<Vec3WithIndex>, bounding_box: &BoundingBox) -> [Box<OctreeNode>; 8] {
    const EMPTY_VEC: Vec<Vec3WithIndex> = Vec::<Vec3WithIndex>::new();
    let mut point_partition: [Vec<Vec3WithIndex>; 8] = [EMPTY_VEC; 8];

    let middle = (bounding_box.min + bounding_box.max) / 2.0;

    for point in points.iter() {
        let index = get_index(point, &middle);
        point_partition[index].push(*point);
    }

    let child_bounding_boxes = get_child_bounding_boxes(bounding_box);

    let mut children_vec: Vec<Box<OctreeNode>> = Vec::new();

    for (i, part) in point_partition.iter().enumerate() {
        children_vec.push(Box::new(OctreeNode::new(part.clone(), child_bounding_boxes[i])));
    }

    children_vec.try_into().unwrap()
}

fn get_index(point: &Vec3WithIndex, middle: &Vec3) -> usize {
    (if point.vec[0] < middle.x { 0 } else { 1 }) +
        (if point.vec[1] < middle.y { 0 } else { 2 } ) +
        (if point.vec[2] < middle.z { 0 } else { 4 } )
}

fn get_child_bounding_boxes(bounding_box: &BoundingBox) -> [BoundingBox; 8] {
    // let boxes: [(Vec3, Vec3); 8] = Default::default();
    let vecc = BoundingBox { min: vec3(0., 0., 0.), max: vec3(0., 0., 0.) };
    let mut boxes: [BoundingBox; 8] = [vecc; 8];

    let middle = (bounding_box.min + bounding_box.max) / 2.0;

    for i in 0..8 {
        let mut min = vec3(0., 0., 0.);
        let mut max = vec3(0., 0., 0.);

        (min.x, max.x) = if (i & 1) == 0 { (bounding_box.min.x, middle.x) } else { (middle.x, bounding_box.max.x) };
        (min.y, max.y) = if (i & 2) == 0 { (bounding_box.min.y, middle.y) } else { (middle.y, bounding_box.max.y) };
        (min.z, max.z) = if (i & 4) == 0 { (bounding_box.min.z, middle.z) } else { (middle.z, bounding_box.max.z) };

        boxes[i] = BoundingBox { min: min, max: max };
    }

    boxes
}
