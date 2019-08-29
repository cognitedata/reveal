use crate as i3df;
use i3df::Vector3;
use serde_derive::{Deserialize, Serialize};
use std::f64::consts::PI;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Scene {
    pub root_sector_id: usize,
    pub sectors: Vec<Sector>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Sector {
    pub id: u64,

    pub parent_id: Option<u64>,
    pub bbox_min: Vector3,
    pub bbox_max: Vector3,

    pub box_collection: Box3DVec,
    pub circle_collection: CircleVec,
    pub cone_collection: ConeVec,
}

pub trait Geometry {}

pub trait GeometryCollection<G: Geometry> {
    fn with_capacity(capacity: usize) -> Self;
    fn push(&mut self, geometry: G);
    fn count(&self) -> usize;
}

macro_rules! new_geometry_types {
    (
        $(
            $vis:vis struct $struct_name:ident, $vec_struct_name:ident {
                $( $field_vis:vis $field_name:ident : $field_type:ty ),* $(,)?
            }
        )*
    ) => {

        pub enum RenderablePrimitive {
            $(
                $struct_name($struct_name),
            )*
        }
        pub enum RenderablePrimitiveVec {
            $(
                $vec_struct_name($vec_struct_name),
            )*
        }
        $(
            #[derive(Clone, Debug, Deserialize, Serialize)]
            #[serde(rename_all="camelCase")]
            $vis struct $struct_name {
                $( $field_vis $field_name : $field_type ),*
            }

            #[derive(Clone, Debug, Deserialize, Serialize)]
            #[serde(rename_all="camelCase")]
            $vis struct $vec_struct_name {
                $( $field_vis $field_name : Vec<$field_type> ),*
            }

            impl Geometry for $struct_name { }

            impl GeometryCollection<$struct_name> for Vec<$struct_name> {
                fn with_capacity(capacity: usize) -> Vec<$struct_name> {
                    Vec::with_capacity(capacity)
                }

                fn push(&mut self, geometry: $struct_name) {
                    self.push(geometry);
                }

                fn count(&self) -> usize {
                    self.len()
                }
            }

            impl GeometryCollection<$struct_name> for $vec_struct_name {
                fn with_capacity(capacity: usize) -> $vec_struct_name {
                    $vec_struct_name {
                        $( $field_name : Vec::with_capacity(capacity) ),*
                    }
                }

                fn push(&mut self, geometry: $struct_name) {
                    $(
                        self.$field_name.push(geometry.$field_name);
                    )*
                }

                fn count(&self) -> usize {
                    let lengths = [$(self.$field_name.len(),)*];
                    let max = lengths.iter().max().unwrap();
                    *max
                }
            }
        )*
    };
}

new_geometry_types! {
    pub struct Box3D, Box3DVec {
        pub node_id: u64,
        pub tree_index: u64,
        pub color: [u8; 4],
        pub size: f32,
        pub center: Vector3,
        pub normal: Vector3,
        pub rotation_angle: f32,
        pub delta: Vector3,
    }

    pub struct Cone, ConeVec {
        pub node_id: u64,
        pub tree_index: u64,
        pub color: [u8; 4],
        pub size: f32,
        pub center_a: Vector3,
        pub center_b: Vector3,
        pub radius_a: f32,
        pub radius_b: f32,
        pub angle: f32,
        pub arc_angle: f32,
        pub local_x_axis: Vector3,
    }

    pub struct Circle, CircleVec {
        pub node_id: u64,
        pub tree_index: u64,
        pub color: [u8; 4],
        pub size: f32,
        pub center: Vector3,
        pub normal: Vector3,
        pub radius: f32,
    }
}

pub trait ToRenderables {
    fn to_renderables(&self) -> Vec<RenderablePrimitive>;
}

impl ToRenderables for i3df::Box3D {
    fn to_renderables(&self) -> Vec<RenderablePrimitive> {
        vec![RenderablePrimitive::Box3D(Box3D {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: self.center(),
            normal: self.normal.into(),
            rotation_angle: self.rotation_angle,
            delta: self.delta(),
        })]
    }
}

impl ToRenderables for i3df::ClosedCylinder {
    fn to_renderables(&self) -> Vec<RenderablePrimitive> {
        let center_axis: Vector3 = self.center_axis.into();
        let local_x_axis: Vector3 = Vector3 { x: 1.0, y: 0.0, z: 0.0 }; // TODO fix
        // Should be
        //
        //normal.subVectors(centerA, centerB).normalize();
        //rotation.setFromUnitVectors(zAxis, normal);
        //localXAxis.copy(xAxis).applyQuaternion(rotation);
        //
        let center_a = self.center() + &center_axis * self.height / 2.0;
        let center_b = self.center() - &center_axis * self.height / 2.0;
        vec![
            RenderablePrimitive::Cone(Cone {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                center_a: center_a.clone(),
                center_b: center_b.clone(),
                radius_a: self.radius,
                radius_b: self.radius,
                angle: 0.0,
                arc_angle: 2.0 * PI as f32,
                local_x_axis,
            }),
            RenderablePrimitive::Circle(Circle {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                center: center_a.clone(),
                normal: self.center_axis.into(),
                radius: self.radius,
            }),
            RenderablePrimitive::Circle(Circle {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                center: center_b.clone(),
                // TODO should this be negative, it is not in the JS version
                normal: -1.0 * center_axis,
                radius: self.radius,
            }),
        ]
    }
}
