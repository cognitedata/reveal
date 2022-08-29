use crate::linalg::{boxes_overlap, vec3, BoundingBox, Vec3, Vec3WithIndex};

pub const MAX_POINTS_PER_NODE: usize = 1_000;
pub const MIN_OCTREE_NODE_SIZE: f64 = 0.0625;

use std::convert::TryInto;

use crate::shapes::shape::Shape;

#[derive(Debug)]
pub struct OctreeNode<'a> {
    children: Option<Box<[OctreeNode<'a>; 8]>>,
    points: Option<&'a [Vec3WithIndex]>,
    bounding_box: BoundingBox,
}

impl<'a> OctreeNode<'a> {
    pub fn new(bounding_box: BoundingBox, points: &'a mut [Vec3WithIndex]) -> OctreeNode {
        if points.len() <= MAX_POINTS_PER_NODE
            || bounding_box.max.x - bounding_box.min.x < MIN_OCTREE_NODE_SIZE
        {
            OctreeNode {
                children: Option::None,
                points: Option::Some(points),
                bounding_box: bounding_box,
            }
        } else {
            let children = split(points, bounding_box);
            OctreeNode {
                children: Option::Some(children),
                points: Option::None,
                bounding_box: bounding_box,
            }
        }
    }

    pub fn assign_object_ids(
        &self,
        bounding_box: &BoundingBox,
        shape: &Box<dyn Shape>,
        object_ids: &js_sys::Uint16Array,
    ) -> () {
        if self.children.is_some() {
            for child in self.children.as_ref().unwrap().iter() {
                if boxes_overlap(&child.bounding_box, bounding_box) {
                    child.assign_object_ids(bounding_box, shape, object_ids);
                }
            }
        } else {
            for point in self.points.as_ref().unwrap().iter() {
                if shape.contains_point(&point.vec) {
                    object_ids.set_index(point.index, shape.get_object_id() as u16);
                }
            }
        }
    }
}

fn split<'a>(
    points: &'a mut [Vec3WithIndex],
    bounding_box: BoundingBox,
) -> Box<[OctreeNode<'a>; 8]> {
    let middle = (bounding_box.min + bounding_box.max) / 2.0;
    let splits = find_splits(points, &middle);

    sort_points_into_sectors(points, splits, &middle);

    let boxes = get_child_bounding_boxes(&bounding_box);
    let mut box_iter = boxes.iter();

    let mut children = std::vec::Vec::<OctreeNode<'a>>::with_capacity(8);

    let split_maxes = get_split_ends(points, &splits);

    for i in 0..8 {
        let bb = box_iter.next().unwrap();

        unsafe {
            let ptr = points.as_mut_ptr().add(splits[i]);
            let slice = std::slice::from_raw_parts_mut(ptr, split_maxes[i] - splits[i]);

            children.push(OctreeNode::new(*bb, slice));
        }
    }

    Box::<[OctreeNode<'a>; 8]>::new(children.try_into().unwrap())
}

fn get_split_ends<'a>(points: &'a [Vec3WithIndex], splits: &[usize; 8]) -> [usize; 8] {
    let mut split_maxes = splits.clone();
    split_maxes.rotate_left(1);
    split_maxes[7] = points.len();

    split_maxes
}

fn find_splits(points: &mut [Vec3WithIndex], middle: &Vec3) -> [usize; 8] {
    let mut sector_counts = [0; 8];
    for point in points.iter() {
        let index = get_octree_child_index(&point.vec, &middle);
        sector_counts[index] += 1;
    }

    let mut accum_counts = [0; 8];

    for i in 1..8 {
        accum_counts[i] = accum_counts[i - 1] + sector_counts[i - 1];
    }

    accum_counts
}

fn get_octree_child_index(point: &Vec3, middle: &Vec3) -> usize {
    (if point[0] < middle.x { 0 } else { 1 })
        + (if point[1] < middle.y { 0 } else { 2 })
        + (if point[2] < middle.z { 0 } else { 4 })
}

/// Takes the points slice and a starting index for each of the eight octree node children slices, and groups
/// the points into their corresponding child's slice. It does not allocate a new vector.
/// In essence, it moves one point at a time and puts it in the next available spot in
/// the slice where it belongs. It then takes the point that was there before and repeats the process.
/// Whenever it comes back to the point where it started the current iteration, it breaks
/// and continues from the next slice that is not fully "sorted"
fn sort_points_into_sectors(points: &mut [Vec3WithIndex], splits: [usize; 8], middle: &Vec3) -> () {
    let mut offsets = splits.clone();
    let max_inds = get_split_ends(points, &splits);

    for current_partition in 0..8 {
        if offsets[current_partition] >= max_inds[current_partition] {
            // This slice is filled, don't iterate from this
            continue;
        }

        // Start from the end of the current partition, so that we know
        // it's full when we encounter this index again
        let initial_point_index = max_inds[current_partition] - 1;

        let mut current_point_index = initial_point_index;
        let mut current_point = points[current_point_index];

        loop {
            let octree_index = get_octree_child_index(&current_point.vec, middle);

            let next_point_index = offsets[octree_index];
            let next_point = points[next_point_index];

            points[next_point_index] = current_point;

            current_point_index = next_point_index;
            current_point = next_point;

            offsets[octree_index] += 1;

            if current_point_index == initial_point_index {
                // We have reached a cycle - break loop
                break;
            }
        }
    }
}

fn get_child_bounding_boxes(bounding_box: &BoundingBox) -> [BoundingBox; 8] {
    let vecc = BoundingBox {
        min: vec3(0., 0., 0.),
        max: vec3(0., 0., 0.),
    };
    let mut boxes: [BoundingBox; 8] = [vecc; 8];

    let middle = (bounding_box.min + bounding_box.max) / 2.0;

    for i in 0..8 {
        let mut min = vec3(0., 0., 0.);
        let mut max = vec3(0., 0., 0.);

        (min.x, max.x) = if (i & 1) == 0 {
            (bounding_box.min.x, middle.x)
        } else {
            (middle.x, bounding_box.max.x)
        };
        (min.y, max.y) = if (i & 2) == 0 {
            (bounding_box.min.y, middle.y)
        } else {
            (middle.y, bounding_box.max.y)
        };
        (min.z, max.z) = if (i & 4) == 0 {
            (bounding_box.min.z, middle.z)
        } else {
            (middle.z, bounding_box.max.z)
        };

        boxes[i] = BoundingBox { min: min, max: max };
    }

    boxes
}

#[cfg(test)]
mod tests {
    use wasm_bindgen_test::wasm_bindgen_test;

    use rand::prelude::*;
    use rand_chacha::ChaCha8Rng;

    use nalgebra_glm::comp_max;

    use crate::dev_utils::normalize_coordinate;

    use super::{
        find_splits, get_child_bounding_boxes, get_octree_child_index, get_split_ends,
        sort_points_into_sectors,
    };
    use super::{vec3, BoundingBox, Vec3WithIndex};

    const EPSILON: f64 = 1e-4;

    #[wasm_bindgen_test]
    fn test_point_in_first_octant_gets_index_0() {
        let point = vec3(-0.1, -0.4, -0.2);
        let middle = vec3(0.0, 0.0, 0.0);
        assert_eq!(get_octree_child_index(&point, &middle), 0);
    }

    #[wasm_bindgen_test]
    fn test_point_in_last_octant_gets_index_7() {
        let point = vec3(0.1, 0.4, 0.2);
        let middle = vec3(0.0, 0.0, 0.0);
        assert_eq!(get_octree_child_index(&point, &middle), 7);
    }

    #[wasm_bindgen_test]
    fn test_child_box_centers_average_to_parent_center() {
        let bounding_box = BoundingBox {
            min: vec3(-2.0, -1.0, 0.0),
            max: vec3(0.0, 1.0, 2.0),
        };

        let middle = (bounding_box.min + bounding_box.max) / 2.0;

        let child_boxes = get_child_bounding_boxes(&bounding_box);

        let mut accumulative_middle = vec3(0.0, 0.0, 0.0);
        for child in child_boxes.iter() {
            accumulative_middle = accumulative_middle + (child.min + child.max) / 2.0;
        }

        let average_middle = accumulative_middle / (child_boxes.len() as f64);

        assert!(comp_max(&(average_middle - middle).abs()) < EPSILON);
    }

    #[wasm_bindgen_test]
    fn test_sector_inplace_sorting() {
        const NUM_POINTS: usize = 300;

        let mut points: Vec<Vec3WithIndex> = Vec::with_capacity(NUM_POINTS);

        let original_points = points.clone();

        let mut rng = ChaCha8Rng::seed_from_u64(0xbaadf00d);

        for i in 0..NUM_POINTS {
            let p = vec3(
                normalize_coordinate(rng.next_u32()),
                normalize_coordinate(rng.next_u32()),
                normalize_coordinate(rng.next_u32()),
            );
            points.push(Vec3WithIndex {
                vec: p,
                index: i as u32,
            });
        }

        let middle = vec3(0.0, 0.0, 0.0);

        let splits = find_splits(&mut points[..], &middle);
        let split_ends = get_split_ends(&points[..], &splits);
        sort_points_into_sectors(&mut points[..], splits, &middle);

        let mut num_points_checked = 0;

        for sector_index in 0..8 {
            let max_ind = split_ends[sector_index];
            for point_index in splits[sector_index]..max_ind {
                assert_eq!(
                    get_octree_child_index(&points[point_index].vec, &middle),
                    sector_index
                );
                num_points_checked += 1;
            }
        }

        assert_eq!(num_points_checked, points.len());

        for og_point in original_points {
            let mut found = false;
            for new_point in points.iter() {
                if new_point == &og_point {
                    found = true;
                    break;
                }
            }

            assert!(found);
        }
    }
}
