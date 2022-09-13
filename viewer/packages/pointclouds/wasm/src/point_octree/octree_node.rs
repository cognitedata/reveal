use crate::linalg::{BoundingBox, Vec3WithIndex};

pub const MAX_POINTS_PER_NODE: usize = 1_000;
pub const MIN_OCTREE_NODE_SIZE: f64 = 0.0625;

use nalgebra_glm::DVec3;

use crate::shapes::Shape;

#[derive(Debug)]
enum OctreeNodeContent<'a> {
    Children(Box<[OctreeNode<'a>; 8]>),
    Points(&'a [Vec3WithIndex]),
}

#[derive(Debug)]
pub struct OctreeNode<'a> {
    content: OctreeNodeContent<'a>,
    bounding_box: BoundingBox,
}

impl<'a> OctreeNode<'a> {
    pub fn new(bounding_box: BoundingBox, points: &'a mut [Vec3WithIndex]) -> OctreeNode {
        if points.len() <= MAX_POINTS_PER_NODE
            || bounding_box.max.x - bounding_box.min.x < MIN_OCTREE_NODE_SIZE
        {
            OctreeNode {
                content: OctreeNodeContent::Points(points),
                bounding_box: bounding_box,
            }
        } else {
            let children = split(points, bounding_box);
            OctreeNode {
                content: OctreeNodeContent::Children(children),
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
        match &self.content {
            OctreeNodeContent::Children(children) => children.iter().for_each(|child| {
                if child.bounding_box.overlaps(bounding_box) {
                    child.assign_object_ids(bounding_box, shape, object_ids);
                }
            }),
            OctreeNodeContent::Points(points) => points.iter().for_each(|point| {
                if shape.contains_point(&point.vec) {
                    object_ids.set_index(point.index as u32, shape.get_object_id() as u16);
                }
            }),
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

    let split_maxes = get_split_ends(points, &splits);

    let children: Box<[OctreeNode<'a>; 8]> =
        Box::<[OctreeNode<'a>; 8]>::new(std::array::from_fn(|child_index| unsafe {
            let ptr = points.as_mut_ptr().add(splits[child_index]);
            let slice =
                std::slice::from_raw_parts_mut(ptr, split_maxes[child_index] - splits[child_index]);

            OctreeNode::new(boxes[child_index], slice)
        }));

    children
}

fn get_split_ends<'a>(points: &'a [Vec3WithIndex], splits: &[usize; 8]) -> [usize; 8] {
    let mut split_maxes = splits.clone();
    split_maxes.rotate_left(1);
    split_maxes[7] = points.len();

    split_maxes
}

fn find_splits(points: &mut [Vec3WithIndex], middle: &DVec3) -> [usize; 8] {
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

fn get_octree_child_index(point: &DVec3, middle: &DVec3) -> usize {
    (if point[0] < middle.x { 0 } else { 1 })
        + (if point[1] < middle.y { 0 } else { 2 })
        + (if point[2] < middle.z { 0 } else { 4 })
}

/// Moves one point at a time to the element in `partition_first_unsorted_points` corresponding to
/// its target partition (octree node). It then swaps it with the point at that index, and continues
/// the process with this new point. Continues until the partition with index `index_of_partition_to_fill`
/// has been filled
fn sort_points_into_partitions_until_specific_partition_filled(
    points: &mut [Vec3WithIndex],
    partition_first_unsorted_points: &mut [usize; 8],
    partition_end_points: &[usize; 8],
    bounding_box_center: &DVec3,
    index_of_partition_to_fill: usize,
) {
    // Start moving the last point in the current partition
    // Iteration ends when we move something back to this index, i.e. this partition is full
    let initial_point_index = partition_end_points[index_of_partition_to_fill] - 1;

    let mut current_point_index = initial_point_index;
    let mut current_point = points[current_point_index];

    loop {
        let next_partition_index = get_octree_child_index(&current_point.vec, bounding_box_center);

        let next_point_index = partition_first_unsorted_points[next_partition_index];
        let next_point = points[next_point_index];

        points[next_point_index] = current_point;

        current_point_index = next_point_index;
        current_point = next_point;

        partition_first_unsorted_points[next_partition_index] += 1;

        if current_point_index == initial_point_index {
            // We have reached a cycle - break loop
            break;
        }
    }
}

/// Takes the points slice and a starting index for each of the eight octree node children slices, and groups
/// the points into their corresponding child's slice. It does not allocate a new vector
fn sort_points_into_sectors(
    points: &mut [Vec3WithIndex],
    splits: [usize; 8],
    middle: &DVec3,
) -> () {
    let mut offsets = splits.clone();
    let partition_end_points = get_split_ends(points, &splits);

    for current_partition in 0..8 {
        if offsets[current_partition] >= partition_end_points[current_partition] {
            // This partition is filled, don't start iterating here
            continue;
        }

        sort_points_into_partitions_until_specific_partition_filled(
            points,
            &mut offsets,
            &partition_end_points,
            middle,
            current_partition,
        );
    }
}

fn get_child_bounding_boxes(bounding_box: &BoundingBox) -> [BoundingBox; 8] {
    let mut boxes: [BoundingBox; 8] = [Default::default(); 8];

    let middle = (bounding_box.min + bounding_box.max) / 2.0;

    for i in 0..8 {
        let mut min: DVec3 = Default::default();
        let mut max: DVec3 = Default::default();

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

    use nalgebra_glm::{comp_max, epsilon, vec3, DVec3};

    use super::{
        find_splits, get_child_bounding_boxes, get_octree_child_index, get_split_ends,
        sort_points_into_sectors,
    };
    use super::{BoundingBox, Vec3WithIndex};

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

        let mut accumulative_middle: DVec3 = Default::default();
        for child in child_boxes.iter() {
            accumulative_middle = accumulative_middle + (child.min + child.max) / 2.0;
        }

        let average_middle = accumulative_middle / (child_boxes.len() as f64);

        assert!(comp_max(&(average_middle - middle).abs()) < epsilon());
    }

    #[wasm_bindgen_test]
    fn test_sector_inplace_sorting() {
        const NUM_POINTS: usize = 300;

        let mut points: Vec<Vec3WithIndex> = Vec::with_capacity(NUM_POINTS);

        let original_points = points.clone();

        let mut rng = ChaCha8Rng::seed_from_u64(0xbaadf00d);

        for i in 0..NUM_POINTS {
            let p = vec3(
                rng.gen_range(-1.0..1.0),
                rng.gen_range(-1.0..1.0),
                rng.gen_range(-1.0..1.0),
            );
            points.push(Vec3WithIndex { vec: p, index: i });
        }

        let middle: DVec3 = Default::default();

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
