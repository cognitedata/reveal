
use crate::shapes::shape::Shape;
use crate::linalg::{BoundingBox, vec3, Vec3};

use std::cmp::Ordering;
use std::vec::Vec;

type BvhElement = (BoundingBox, Box<dyn Shape>);

pub struct BvhNode {
    children: Option<Box<(BvhNode, BvhNode)>>,
    element: Option<Box<dyn Shape>>,
    bounding_box: BoundingBox
}

impl BvhNode {
    pub fn new(mut elements: Vec<BvhElement>) -> BvhNode {
        if elements.len() == 1 {
            BvhNode {
                element: Option::Some(elements[0].1.clone()),
                children: Option::None,
                bounding_box: elements[0].0
            }
        } else {
            let split = find_best_split(&mut elements);

            let mut bounds = split.0.0;
            bounds.union(&split.1.0);

            BvhNode {
                element: Option::None,
                children: Option::Some(Box::new((
                    BvhNode::new(split.0.1),
                    BvhNode::new(split.1.1)))),
                bounding_box: bounds
            }
        }
    }

    pub fn get_object_id(&self, point: &Vec3) -> u32 {
        if self.element.is_some() {
            if self.element.as_ref().unwrap().contains_point(point) {
                self.element.as_ref().unwrap().get_object_id()
            } else {
                0
            }
        } else {
            let mut id = 0;
            if self.children.as_ref().unwrap().0.bounding_box.contains_point(point) {
                id = id.max(self.children.as_ref().unwrap().0.get_object_id(point));
            }

            if self.children.as_ref().unwrap().1.bounding_box.contains_point(point) {
                id = id.max(self.children.as_ref().unwrap().1.get_object_id(point));
            }

            id
        }
    }
}

fn find_best_split(shapes: &mut Vec<BvhElement>) -> ((BoundingBox, Vec<BvhElement>), (BoundingBox, Vec<BvhElement>)) {
    let mut best_score = f64::NEG_INFINITY;
    let mut best_separation = (Vec::<BvhElement>::new(), Vec::<BvhElement>::new());
    let mut best_boxes = (BoundingBox { min: vec3(0.0, 0.0, 0.0),
                                        max: vec3(0.0, 0.0, 0.0) },
                          BoundingBox { min: vec3(0.0, 0.0, 0.0),
                                        max: vec3(0.0, 0.0, 0.0) });

    for axis in 0..3 {
        sort_on_axis(axis, shapes);

        let mut first_split = shapes.clone();
        let second_split = first_split.split_off(first_split.len() / 2);

        let split = (first_split, second_split);
        let boxes = (union_boxes(&split.0), union_boxes(&split.1));
        let score = evaluate_separatism(&boxes.0, &boxes.1);

        if score > best_score {
            best_separation = split;
            best_score = score;
            best_boxes = boxes
        }
    }

    ((best_boxes.0, best_separation.0), (best_boxes.1, best_separation.1))
}

fn sort_on_axis(axis: usize, objects: &mut Vec<BvhElement>) -> () {
    objects.sort_by(|a, b| cmp_f64(&a.0.min[axis], &b.0.min[axis]))
}

fn union_boxes(elements: &Vec<BvhElement>) -> BoundingBox {
    let mut b: BoundingBox = BoundingBox {
        min: vec3(f64::INFINITY, f64::INFINITY, f64::INFINITY),
        max: vec3(f64::NEG_INFINITY, f64::NEG_INFINITY, f64::NEG_INFINITY)
    };

    for el in elements.iter() {
        b.union(&el.0);
    }

    b
}

fn evaluate_separatism(box0: &BoundingBox, box1: &BoundingBox) -> f64 {
    vector_separatism(&box0.min, &box1.max).max(
        vector_separatism(&box1.min, &box0.max))
}

fn vector_separatism(v0: &Vec3, v1: &Vec3) -> f64 {
    let diff = v0 - v1;
    diff.x.max(diff.y.max(diff.z))
}


fn cmp_f64(a: &f64, b: &f64) -> Ordering {
    if a < b {
        return Ordering::Less;
    } else if a > b {
        return Ordering::Greater;
    }
    return Ordering::Equal;
}
