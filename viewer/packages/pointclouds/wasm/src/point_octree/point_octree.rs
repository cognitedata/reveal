use crate::linalg::{BoundingBox, Vec3WithIndex};

use super::octree_node::OctreeNode;
use std::vec::Vec;

use crate::shapes::shape::Shape;

pub struct PointOctree<'a> {
    root: OctreeNode<'a>,
}

impl PointOctree<'_> {
    pub fn new(bounding_box: BoundingBox, points: &mut Vec<Vec3WithIndex>) -> PointOctree {
        PointOctree {
            root: OctreeNode::new(bounding_box, points),
        }
    }

    pub fn assign_object_ids(
        &self,
        bounding_box: &BoundingBox,
        shape: &Box<dyn Shape>,
        object_ids: &js_sys::Uint16Array,
    ) -> () {
        self.root.assign_object_ids(bounding_box, shape, object_ids);
    }
}

#[cfg(test)]
mod tests {

    use super::PointOctree;
    use crate::linalg::{vec3, BoundingBox, Mat4, Vec3WithIndex};
    use crate::shapes::oriented_box::OrientedBox;
    use crate::shapes::shape::Shape;

    use js_sys::Uint16Array;

    use nalgebra_glm::translate;

    use rand::prelude::*;
    use rand_chacha::ChaCha8Rng;

    use wasm_bindgen_test::wasm_bindgen_test;

    use crate::dev_utils::normalize_coordinate;

    fn create_random_points_in_unit_box(num_points: u32) -> Vec<Vec3WithIndex> {
        let mut rng = ChaCha8Rng::seed_from_u64(0xbaadf00d);

        let mut points = Vec::<Vec3WithIndex>::with_capacity(num_points as usize);

        for i in 0..num_points {
            points.push(Vec3WithIndex {
                vec: vec3(
                    normalize_coordinate(rng.next_u32()) / 2.0,
                    normalize_coordinate(rng.next_u32()) / 2.0,
                    normalize_coordinate(rng.next_u32()) / 2.0,
                ),
                index: i,
            });
        }

        points
    }

    #[wasm_bindgen_test]
    fn all_points_returned_for_all_enclosing_box_shape() {
        const NUM_POINTS: u32 = 1_000;
        const OBJECT_ID: u16 = 42;

        let mut points = create_random_points_in_unit_box(NUM_POINTS);

        let shape: Box<dyn Shape> =
            Box::<OrientedBox>::new(OrientedBox::new(Mat4::identity(), OBJECT_ID));
        let bounding_box = BoundingBox::get_transformed_unit_cube(&Mat4::identity());
        let array = Uint16Array::new_with_length(NUM_POINTS);

        let octree = PointOctree::new(bounding_box.clone(), &mut points);
        octree.assign_object_ids(&shape.create_bounding_box(), &shape, &array);

        for i in 0..NUM_POINTS {
            let set_object_id = array.get_index(i);
            assert_eq!(set_object_id, OBJECT_ID);
        }
    }

    #[wasm_bindgen_test]
    fn no_points_returned_for_non_overlapping_shape() {
        const NUM_POINTS: u32 = 1_000;
        const OBJECT_ID: u16 = 42;

        let mut points = create_random_points_in_unit_box(NUM_POINTS);

        let box_matrix = translate(&Mat4::identity(), &vec3(1.0, 0.0, 0.0));
        let bounding_box = BoundingBox::get_transformed_unit_cube(&box_matrix);
        let shape: Box<dyn Shape> =
            Box::<OrientedBox>::new(OrientedBox::new(box_matrix, OBJECT_ID));
        let array = Uint16Array::new_with_length(NUM_POINTS);

        let octree = PointOctree::new(bounding_box.clone(), &mut points);
        octree.assign_object_ids(&shape.create_bounding_box(), &shape, &array);

        for i in 0..NUM_POINTS {
            let set_object_id = array.get_index(i);
            assert_eq!(set_object_id, 0);
        }
    }
}
