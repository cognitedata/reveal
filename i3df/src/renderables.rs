use crate as i3df;
use i3df::Vector3;
use serde_derive::{Deserialize, Serialize};
use std::f64::consts::PI;

use wasm_bindgen::prelude::*;
use serde_wasm_bindgen;
use js_sys::{Uint8Array, Float32Array};
use wasm_bindgen::JsValue;

#[wasm_bindgen]
#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct Scene {
    pub root_sector_id: usize,
    #[wasm_bindgen(skip)]
    pub sectors: Vec<Sector>,
}

#[wasm_bindgen]
impl Scene {
    pub fn sector_count(&self) -> usize {
        self.sectors.len()
    }
    pub fn sector_id(&self, index: usize) -> usize {
        self.sectors[index].id
    }
    pub fn sector_parent_id(&self, index: usize) -> Option<usize> {
        self.sectors[index].parent_id
    }
    pub fn sector_bbox_min(&self, index: usize) -> JsValue {
        serde_wasm_bindgen::to_value(&self.sectors[index].bbox_min).unwrap()
    }
    pub fn sector_bbox_max(&self, index: usize) -> JsValue {
        serde_wasm_bindgen::to_value(&self.sectors[index].bbox_max).unwrap()
    }
    pub fn sector(&mut self, index: usize) -> Sector {
        // NOTE the user can only get the sector once
        std::mem::replace(&mut self.sectors[index], Sector::default())
    }
}

pub trait Geometry {}

pub trait GeometryCollection<G: Geometry> {
    fn with_capacity(capacity: usize) -> Self;
    fn push(&mut self, geometry: G);
    fn count(&self) -> usize;
}

fn vec_vector_to_array(data: &[i3df::Vector3]) -> Float32Array {
    let data = unsafe {
        std::slice::from_raw_parts(
            data.as_ptr() as *const f32,
            data.len() * 3,
        ).to_vec()
    };
    Float32Array::from(&data[..])
}

macro_rules! make_func {
    // node ids
    ($self:ident, $field_name:ident, u64, JsValue) => {
        serde_wasm_bindgen::to_value(&$self.$field_name).unwrap()
    };

    // tree index
    ($self:ident, $field_name:ident, u64, Float32Array) => {
        {
            let data: Vec<f32> = $self.$field_name.iter().map(|value| {
                *value as f32
            }).collect();
            Float32Array::from(&data[..])
        }
    };

    // colors
    ($self:ident, $field_name:ident, [u8; 4], Uint8Array) => {
        {
            let color_flat: Vec<u8> = $self.$field_name.iter().flat_map(|a| vec![a[0], a[1], a[2], a[3]]).collect();
            Uint8Array::from(&color_flat[..])
        }
    };

    ($self:ident, $field_name:ident, f32, Float32Array) => {
        {
            Float32Array::from(&$self.$field_name[..])
        }
    };

    ($self:ident, $field_name:ident, Vector3, Float32Array) => {
        {
            vec_vector_to_array(&$self.$field_name)
        }
    };
}

macro_rules! new_geometry_types {
    (
        $(
            $vis:vis struct $struct_name:ident, $vec_struct_name:ident, $collection_name:ident {
                $( $field_vis:vis $field_name:ident : $field_type:ty $(=> $wasm_result:ident)? ),* $(,)?
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
            #[wasm_bindgen]
            #[derive(Clone, Debug, Default, Deserialize, Serialize)]
            #[serde(rename_all="camelCase")]
            $vis struct $struct_name {
                $(
                    #[wasm_bindgen(skip)]
                    $field_vis $field_name : $field_type,
                )*
            }

            #[wasm_bindgen]
            #[derive(Clone, Debug, Default, Deserialize, Serialize)]
            #[serde(rename_all="camelCase")]
            $vis struct $vec_struct_name {
                $(
                    #[wasm_bindgen(skip)]
                    $field_vis $field_name : Vec<$field_type>,
                )*
            }

            #[wasm_bindgen]
            impl $vec_struct_name {
                $(
                    $(
                        $field_vis fn $field_name(&self) -> $wasm_result {
                            make_func!(self, $field_name, $field_type, $wasm_result)
                        }
                    )?
                )*
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

        #[wasm_bindgen]
        #[derive(Clone, Debug, Default, Deserialize, Serialize)]
        pub struct Sector {
            pub id: usize,

            pub parent_id: Option<usize>,
            #[wasm_bindgen(skip)]
            pub bbox_min: Vector3,
            #[wasm_bindgen(skip)]
            pub bbox_max: Vector3,

            $(
                #[wasm_bindgen(skip)]
                pub $collection_name: $vec_struct_name,
            )*
        }

        #[wasm_bindgen]
        impl Sector {
            $(
                pub fn $collection_name(&self) -> $vec_struct_name {
                    std::mem::replace(&mut self.$collection_name.clone(), $vec_struct_name::default())
                }
            )*
        }
    };
}

new_geometry_types! {
    pub struct Box3D, Box3DVec, box_collection {
        pub node_id: u64 => JsValue,
        pub tree_index: u64 => Float32Array,
        pub color: [u8; 4] => Uint8Array,
        pub size: f32 => Float32Array,
        pub center: Vector3 => Float32Array,
        pub normal: Vector3 => Float32Array,
        pub rotation_angle: f32 => Float32Array,
        pub delta: Vector3 => Float32Array,
    }

    pub struct Cone, ConeVec, cone_collection {
        pub node_id: u64 => JsValue,
        pub tree_index: u64 => Float32Array,
        pub color: [u8; 4] => Uint8Array,
        pub size: f32 => Float32Array,
        pub center_a: Vector3 => Float32Array,
        pub center_b: Vector3 => Float32Array,
        pub radius_a: f32 => Float32Array,
        pub radius_b: f32 => Float32Array,
        pub angle: f32 => Float32Array,
        pub arc_angle: f32 => Float32Array,
        pub local_x_axis: Vector3 => Float32Array,
    }

    pub struct Circle, CircleVec, circle_collection {
        pub node_id: u64 => JsValue,
        pub tree_index: u64 => Float32Array,
        pub color: [u8; 4] => Uint8Array,
        pub size: f32 => Float32Array,
        pub center: Vector3 => Float32Array,
        pub normal: Vector3 => Float32Array,
        pub radius: f32 => Float32Array,
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
