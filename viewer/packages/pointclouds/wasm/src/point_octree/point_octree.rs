use crate::linalg::{BoundingBox, Vec3WithIndex};

use super::octree_node::OctreeNode;
use std::vec::Vec;

use crate::shapes::Shape;

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
    use crate::linalg::{BoundingBox, Vec3WithIndex};
    use crate::shapes::{OrientedBox, Shape};

    use js_sys::Uint16Array;

    use nalgebra_glm::{translate, vec3, DMat4};

    use rand::prelude::*;
    use rand_chacha::ChaCha8Rng;

    use wasm_bindgen_test::wasm_bindgen_test;

    fn create_random_points_in_base_box(num_points: u32) -> Vec<Vec3WithIndex> {
        let mut rng = ChaCha8Rng::seed_from_u64(0xbaadf00d);

        let mut points = Vec::<Vec3WithIndex>::with_capacity(num_points as usize);

        let base_box = BoundingBox::get_base_cube_bounding_box();

        for i in 0..num_points {
            points.push(Vec3WithIndex {
                vec: vec3(
                    rng.gen_range(base_box.min.x..base_box.max.x),
                    rng.gen_range(base_box.min.y..base_box.max.y),
                    rng.gen_range(base_box.min.z..base_box.max.z),
                ),
                index: i as usize,
            });
        }

        points
    }

    #[wasm_bindgen_test]
    fn all_points_returned_for_all_enclosing_box_shape() {
        const NUM_POINTS: u32 = 1_000;
        const OBJECT_ID: u16 = 42;

        let mut points = create_random_points_in_base_box(NUM_POINTS);

        let shape: Box<dyn Shape> =
            Box::<OrientedBox>::new(OrientedBox::new(DMat4::identity(), OBJECT_ID));
        let bounding_box = BoundingBox::get_transformed_base_cube(&DMat4::identity());
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

        let mut points = create_random_points_in_base_box(NUM_POINTS);

        let box_matrix = translate(&DMat4::identity(), &vec3(2.0, 0.0, 0.0));
        let bounding_box = BoundingBox::get_transformed_base_cube(&box_matrix);
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
