use crate::{Matrix, Rotation3, Vector3, Vector4};
use serde_derive::{Deserialize, Serialize};
use std::f64::consts::PI;

use serde_wasm_bindgen;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

// TODO remember to normalize arc_angles

#[wasm_bindgen]
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Scene {
    pub root_sector_id: usize,
    #[wasm_bindgen(skip)]
    pub sectors: Vec<Sector>,
}

use crate::generated_renderables::*;

#[wasm_bindgen]
impl Scene {
    pub fn sector_count(&self) -> usize {
        self.sectors.len()
    }
    pub fn sector_id(&self, index: usize) -> u64 {
        self.sectors[index].id
    }
    pub fn sector_parent_id(&self, index: usize) -> JsValue {
        serde_wasm_bindgen::to_value(&self.sectors[index].parent_id).unwrap()
    }
    pub fn sector_bbox_min(&self, index: usize) -> JsValue {
        serde_wasm_bindgen::to_value(&self.sectors[index].bbox_min).unwrap()
    }
    pub fn sector_bbox_max(&self, index: usize) -> JsValue {
        serde_wasm_bindgen::to_value(&self.sectors[index].bbox_max).unwrap()
    }
    pub fn sector(&mut self, index: usize) -> Sector {
        // NOTE the user can only get the sector once
        let dummy_sector = Sector {
            id: 0,
            parent_id: None,
            bbox_min: Vector3::new(0.0, 0.0, 0.0),
            bbox_max: Vector3::new(0.0, 0.0, 0.0),
            primitive_collections: PrimitiveCollections::new(),
        };
        std::mem::replace(&mut self.sectors[index], dummy_sector)
    }
}

pub trait Geometry {}

pub trait GeometryCollection<G: Geometry> {
    fn with_capacity(capacity: usize) -> Self;
    fn push(&mut self, geometry: G);
    fn count(&self) -> usize;
}

macro_rules! make_func_vec {
    // TODO remove and use f64 for tree_index
    ($self:ident, $field_name:ident, u64, f32) => {{
        let data: Vec<f32> = $self
            .$field_name
            .iter()
            .map(|value| *value as f32)
            .collect();
        data
    }};

    ($self:ident, $field_name:ident, u64, f64) => {{
        let data: Vec<f64> = $self
            .$field_name
            .iter()
            .map(|value| *value as f64)
            .collect();
        data
    }};

    ($self:ident, $field_name:ident, [u8; 4], u8) => {{
        let color_flat: Vec<u8> = $self
            .$field_name
            .iter()
            .flat_map(|a| vec![a[0], a[1], a[2], a[3]])
            .collect();
        color_flat
    }};

    ($self:ident, $field_name:ident, f32, f32) => {{
        $self.$field_name.clone()
    }};

    // TODO re-evaluate safety of this
    ($self:ident, $field_name:ident, Vector3, f32) => {{
        let data_as_vector3 = &$self.$field_name;
        let data_as_f32 = unsafe {
            std::slice::from_raw_parts(
                data_as_vector3.as_ptr() as *const f32,
                data_as_vector3.len() * 3,
            )
            .to_vec()
        };
        data_as_f32
    }};

    ($self:ident, $field_name:ident, Vector4, f32) => {{
        let data_as_vector4 = &$self.$field_name;
        let data_as_f32 = unsafe {
            std::slice::from_raw_parts(
                data_as_vector4.as_ptr() as *const f32,
                data_as_vector4.len() * 4,
            )
            .to_vec()
        };
        data_as_f32
    }};
}

macro_rules! new_geometry_types {
    (
        $(
            {
                $struct_name:ident,
                $vec_struct_name:ident,
                $collection_name:ident,
                [
                    $( $field_name:ident : $field_type:ty => $wasm_vec_result:ident ),* $(,)?
                ]
            }
        )*
    ) => {

        $(
            #[wasm_bindgen]
            #[derive(Clone, Debug, Deserialize, Serialize)]
            #[serde(rename_all="camelCase")]
            pub struct $struct_name {
                $(
                    #[wasm_bindgen(skip)]
                    pub $field_name : $field_type,
                )*
            }

            #[wasm_bindgen]
            #[derive(Clone, Debug, Default, Deserialize, Serialize)]
            #[serde(rename_all="camelCase")]
            pub struct $vec_struct_name {
                $(
                    #[wasm_bindgen(skip)]
                    pub $field_name : Vec<$field_type>,
                )*
            }

            #[wasm_bindgen]
            impl $vec_struct_name {
                $(
                    pub fn $field_name(&self) -> Vec<$wasm_vec_result> {
                        make_func_vec!(self, $field_name, $field_type, $wasm_vec_result)
                    }
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

        #[derive(Clone, Debug, Deserialize, Serialize)]
        pub struct PrimitiveCollections {
            $(
                pub $collection_name: $vec_struct_name,
            )*
        }

        impl PrimitiveCollections {
            pub fn new() -> PrimitiveCollections {
                PrimitiveCollections {
                    $(
                        $collection_name: $vec_struct_name::with_capacity(0),
                    )*
                }
            }
        }

        #[wasm_bindgen]
        #[derive(Clone, Debug, Deserialize, Serialize)]
        pub struct Sector {
            pub id: u64,

            pub parent_id: Option<u64>,
            #[wasm_bindgen(skip)]
            pub bbox_min: Vector3,
            #[wasm_bindgen(skip)]
            pub bbox_max: Vector3,

            #[wasm_bindgen(skip)]
            pub primitive_collections: PrimitiveCollections,
        }

        #[wasm_bindgen]
        impl Sector {
            $(
                pub fn $collection_name(&self) -> $vec_struct_name {
                    std::mem::replace(&mut self.primitive_collections.$collection_name.clone(), $vec_struct_name::default())
                }
            )*
        }
    };
}

new_geometry_types! {
    {
        Box3D,
        Box3DVec,
        box_collection,
        [
            node_id: u64 => f64,
            tree_index: u64 => f32,
            color: [u8; 4] => u8,
            size: f32 => f32,
            center: Vector3 => f32,
            normal: Vector3 => f32,
            rotation_angle: f32 => f32,
            delta: Vector3 => f32,
        ]
    }

    {
        Cone,
        ConeVec,
        cone_collection,
        [
            node_id: u64 => f64,
            tree_index: u64 => f32,
            color: [u8; 4] => u8,
            size: f32 => f32,
            center_a: Vector3 => f32,
            center_b: Vector3 => f32,
            radius_a: f32 => f32,
            radius_b: f32 => f32,
            angle: f32 => f32,
            arc_angle: f32 => f32,
            local_x_axis: Vector3 => f32,
        ]
    }

    {
        Circle,
        CircleVec,
        circle_collection,
        [
            node_id: u64 => f64,
            tree_index: u64 => f32,
            color: [u8; 4] => u8,
            size: f32 => f32,
            center: Vector3 => f32,
            normal: Vector3 => f32,
            radius: f32 => f32,
        ]
    }

    {
        EccentricCone,
        EccentricConeVec,
        eccentric_cone_collection,
        [
            node_id: u64 => f64,
            tree_index: u64 => f32,
            color: [u8; 4] => u8,
            size: f32 => f32,
            center_a: Vector3 => f32,
            center_b: Vector3 => f32,
            radius_a: f32 => f32,
            radius_b: f32 => f32,
            normal: Vector3 => f32,
        ]
    }

    {
        EllipsoidSegment, EllipsoidSegmentVec, ellipsoid_segment_collection,
        [
            node_id: u64 => f64,
            tree_index: u64 => f32,
            color: [u8; 4] => u8,
            size: f32 => f32,
            center: Vector3 => f32,
            normal: Vector3 => f32,
            horizontal_radius: f32 => f32,
            vertical_radius: f32 => f32,
            height: f32 => f32,
        ]
    }

    {
        GeneralRing, GeneralRingVec, general_ring_collection,
        [
            node_id: u64 => f64,
            tree_index: u64 => f32,
            color: [u8; 4] => u8,
            size: f32 => f32,
            center: Vector3 => f32,
            normal: Vector3 => f32,
            local_x_axis: Vector3 => f32,
            radius_x: f32 => f32,
            radius_y: f32 => f32,
            thickness: f32 => f32,
            angle: f32 => f32,
            arc_angle: f32 => f32,
        ]
    }

    {
        GeneralCylinder, GeneralCylinderVec, general_cylinder_collection,
        [
            node_id: u64 => f64,
            tree_index: u64 => f32,
            color: [u8; 4] => u8,
            size: f32 => f32,
            center_a: Vector3 => f32,
            center_b: Vector3 => f32,
            radius: f32 => f32,
            height_a: f32 => f32,
            height_b: f32 => f32,
            slope_a: f32 => f32,
            slope_b: f32 => f32,
            z_angle_a: f32 => f32,
            z_angle_b: f32 => f32,
            angle: f32 => f32,
            plane_a: Vector4 => f32,
            plane_b: Vector4 => f32,
            arc_angle: f32 => f32,
            cap_normal_a: Vector3 => f32,
            cap_normal_b: Vector3 => f32,
            local_x_axis: Vector3 => f32,
        ]
    }
    {
        Nut, NutVec, nut_collection,
        [
            node_id: u64 => f64,
            tree_index: u64 => f32,
            color: [u8; 4] => u8,
            size: f32 => f32,
            center_a: Vector3 => f32,
            center_b: Vector3 => f32,
            radius: f32 => f32,
            rotation_angle: f32 => f32,
        ]
    }

    {
        Quad, QuadVec, quad_collection,
        [
            node_id: u64 => f64,
            tree_index: u64 => f32,
            color: [u8; 4] => u8,
            size: f32 => f32,
            vertex_1: Vector3 => f32,
            vertex_2: Vector3 => f32,
            vertex_3: Vector3 => f32,
        ]
    }

    {
        SphericalSegment, SphericalSegmentVec, spherical_segment_collection,
        [
            node_id: u64 => f64,
            tree_index: u64 => f32,
            color: [u8; 4] => u8,
            size: f32 => f32,
            center: Vector3 => f32,
            normal: Vector3 => f32,
            radius: f32 => f32,
            height: f32 => f32,
        ]
    }

    {
        TorusSegment, TorusSegmentVec, torus_segment_collection,
        [
            node_id: u64 => f64,
            tree_index: u64 => f32,
            color: [u8; 4] => u8,
            size: f32 => f32,
            center: Vector3 => f32,
            normal: Vector3 => f32,
            radius: f32 => f32,
            tube_radius: f32 => f32,
            rotation_angle: f32 => f32,
            arc_angle: f32 => f32,
        ]
    }
    {
        Trapezium, TrapeziumVec, trapezium_collection,
        [
            node_id: u64 => f64,
            tree_index: u64 => f32,
            color: [u8; 4] => u8,
            size: f32 => f32,
            vertex_1: Vector3 => f32,
            vertex_2: Vector3 => f32,
            vertex_3: Vector3 => f32,
            vertex_4: Vector3 => f32,
        ]
    }
}

fn normalize_radians(mut angle: f32) -> f32 {
    while angle < -PI as f32 {
        angle += 2.0 * PI as f32;
    }
    while angle > PI as f32 {
        angle -= 2.0 * PI as f32;
    }
    angle
}

pub trait ToRenderables {
    fn to_renderables(&self, collections: PrimitiveCollections) -> PrimitiveCollections;
}

impl ToRenderables for crate::Box3D {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        collections.box_collection.push(Box3D {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: self.center(),
            normal: self.normal.into(),
            rotation_angle: self.rotation_angle,
            delta: self.delta(),
        });

        collections
    }
}

impl ToRenderables for crate::ClosedCone {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center().into();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let normal = (center_a - center_b).normalize();
        let rotation = Rotation3::rotation_between(&z_axis, &normal).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a: center_a.clone(),
            center_b: center_b.clone(),
            radius_a: self.radius_a,
            radius_b: self.radius_b,
            angle: 0.0,
            arc_angle: 2.0 * PI as f32,
            local_x_axis,
        });
        collections.circle_collection.push(Circle {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a.clone(),
            normal: self.center_axis.into(),
            radius: self.radius_a,
        });
        collections.circle_collection.push(Circle {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_b.clone(),
            // TODO should this be negative, it is not in the JS version
            normal: -1.0 * center_axis,
            radius: self.radius_b,
        });
        collections
    }
}

impl ToRenderables for crate::ClosedCylinder {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center().into();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let normal = (center_a - center_b).normalize();
        let rotation = Rotation3::rotation_between(&z_axis, &normal).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);
        collections.cone_collection.push(Cone {
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
        });
        collections.circle_collection.push(Circle {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a.clone(),
            normal: self.center_axis.into(),
            radius: self.radius,
        });
        collections.circle_collection.push(Circle {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_b.clone(),
            // TODO should this be negative, it is not in the JS version
            normal: -1.0 * center_axis,
            radius: self.radius,
        });

        collections
    }
}

impl ToRenderables for crate::Circle {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        collections.circle_collection.push(Circle {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: self.center(),
            normal: self.normal.into(),
            radius: self.radius,
        });

        collections
    }
}
impl ToRenderables for crate::ClosedEccentricCone {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let center_axis: Vector3 = self.center_axis.into();
        let center: Vector3 = self.center().into();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;

        let mut normal: Vector3 = self.cap_normal.into();
        let dot_product = Matrix::dot(&normal, &(&center_a - &center_b));
        if dot_product < 0.0 {
            normal = -normal;
        }

        collections.eccentric_cone_collection.push(EccentricCone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a: center_a.clone(),
            center_b: center_b.clone(),
            radius_a: self.radius_a,
            radius_b: self.radius_b,
            normal: normal.clone(),
        });
        collections.circle_collection.push(Circle {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a.clone(),
            normal: normal.clone(),
            radius: self.radius_a,
        });
        collections.circle_collection.push(Circle {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_b.clone(),
            // TODO should this be negative?
            normal: normal.clone(),
            radius: self.radius_b,
        });
        collections
    }
}
impl ToRenderables for crate::ClosedEllipsoidSegment {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        collections
            .ellipsoid_segment_collection
            .push(EllipsoidSegment {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                center: self.center(),
                normal: self.normal.into(),
                horizontal_radius: self.horizontal_radius,
                vertical_radius: self.vertical_radius,
                height: self.height,
            });

        let length = self.vertical_radius - self.height;
        let circle_radius = f32::sqrt(self.vertical_radius.powi(2) - length.powi(2))
            * self.horizontal_radius
            / self.vertical_radius;
        let center = self.center() + length * Vector3::from(self.normal).normalize();

        collections.circle_collection.push(Circle {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center,
            normal: self.normal.into(),
            radius: circle_radius,
        });

        collections
    }
}
impl ToRenderables for crate::ClosedExtrudedRingSegment {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center().into();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let rotation = Rotation3::rotation_between(&z_axis, &center_axis).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);

        let thickness = (self.outer_radius - self.inner_radius) / self.outer_radius;

        // rings
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a.clone(),
            normal: self.center_axis.into(),
            local_x_axis: local_x_axis.clone(),
            radius_x: self.outer_radius,
            radius_y: self.outer_radius,
            thickness,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
        });
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_b.clone(),
            normal: self.center_axis.into(),
            local_x_axis: local_x_axis.clone(),
            radius_x: self.outer_radius,
            radius_y: self.outer_radius,
            thickness,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
        });

        // outer cone
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a: center_a.clone(),
            center_b: center_b.clone(),
            radius_a: self.outer_radius,
            radius_b: self.outer_radius,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis: local_x_axis.clone(),
        });

        // inner cone
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a: center_a.clone(),
            center_b: center_b.clone(),
            radius_a: self.inner_radius,
            radius_b: self.inner_radius,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis: local_x_axis.clone(),
        });

        {
            let c = f32::cos(self.rotation_angle);
            let s = f32::sin(self.rotation_angle);
            let vertex = Vector3::new(c, s, 0.0);
            let vertex_0 = rotation.transform_vector(&vertex);
            let vertex_1 = vertex_0 * self.inner_radius + center_b;
            let vertex_2 = vertex_0 * self.outer_radius + center_a;
            let vertex_3 = vertex_0 * self.outer_radius + center_b;
            collections.quad_collection.push(Quad {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                vertex_1,
                vertex_2,
                vertex_3,
            });
        }
        {
            let c = f32::cos(self.rotation_angle + self.arc_angle);
            let s = f32::sin(self.rotation_angle + self.arc_angle);
            let vertex = Vector3::new(c, s, 0.0);
            let vertex_0 = rotation.transform_vector(&vertex);
            let vertex_1 = vertex_0 * self.outer_radius + center_a;
            let vertex_2 = vertex_0 * self.inner_radius + center_b;
            let vertex_3 = vertex_0 * self.outer_radius + center_b;
            collections.quad_collection.push(Quad {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                vertex_1,
                vertex_2,
                vertex_3,
            });
        }

        collections
    }
}
impl ToRenderables for crate::ClosedSphericalSegment {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        collections
            .spherical_segment_collection
            .push(SphericalSegment {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                center: self.center(),
                normal: self.normal.into(),
                radius: self.radius,
                height: self.height,
            });

        let length = self.radius - self.height;
        let circle_radius = f32::sqrt(self.radius.powi(2) - length.powi(2));
        let center = self.center() + length * Vector3::from(self.normal).normalize();

        collections.circle_collection.push(Circle {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center,
            normal: self.normal.into(),
            radius: circle_radius,
        });

        collections
    }
}
impl ToRenderables for crate::ClosedTorusSegment {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        collections.torus_segment_collection.push(TorusSegment {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: self.center(),
            normal: self.normal.into(),
            radius: self.radius,
            tube_radius: self.tube_radius,
            rotation_angle: self.rotation_angle,
            arc_angle: self.arc_angle,
        });

        // TODO add circles in correct positions (also missing from TypeScript parser)

        collections
    }
}
impl ToRenderables for crate::Ellipsoid {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        collections
            .ellipsoid_segment_collection
            .push(EllipsoidSegment {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                center: self.center(),
                normal: self.normal.into(),
                horizontal_radius: self.horizontal_radius,
                vertical_radius: self.vertical_radius,
                height: self.vertical_radius * 2.0,
            });
        collections
    }
}
impl ToRenderables for crate::ExtrudedRing {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        // TODO duplicate of OpenExtrudedRing

        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center().into();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let rotation = Rotation3::rotation_between(&z_axis, &center_axis).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);

        let thickness = (self.outer_radius - self.inner_radius) / self.outer_radius;

        let rotation_angle = 0.0;
        let arc_angle = 2.0 * PI as f32;

        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a.clone(),
            normal: self.center_axis.into(),
            local_x_axis: local_x_axis.clone(),
            radius_x: self.outer_radius,
            radius_y: self.outer_radius,
            thickness,
            angle: rotation_angle,
            arc_angle: arc_angle,
        });
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_b.clone(),
            normal: self.center_axis.into(),
            local_x_axis: local_x_axis.clone(),
            radius_x: self.outer_radius,
            radius_y: self.outer_radius,
            thickness,
            angle: rotation_angle,
            arc_angle: arc_angle,
        });
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a: center_a.clone(),
            center_b: center_b.clone(),
            radius_a: self.outer_radius,
            radius_b: self.outer_radius,
            angle: rotation_angle,
            arc_angle: arc_angle,
            local_x_axis: local_x_axis.clone(),
        });
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a: center_a.clone(),
            center_b: center_b.clone(),
            radius_a: self.inner_radius,
            radius_b: self.inner_radius,
            angle: rotation_angle,
            arc_angle: arc_angle,
            local_x_axis: local_x_axis.clone(),
        });
        collections
    }
}
impl ToRenderables for crate::Nut {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let normal: Vector3 = self.center_axis.into();
        let center_a = self.center() + 0.5 * self.height * normal;
        let center_b = self.center() - 0.5 * self.height * normal;

        collections.nut_collection.push(Nut {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius: self.radius,
            rotation_angle: self.rotation_angle,
        });

        collections
    }
}
impl ToRenderables for crate::OpenCone {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center().into();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let normal = (center_a - center_b).normalize();
        let rotation = Rotation3::rotation_between(&z_axis, &normal).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a: center_a.clone(),
            center_b: center_b.clone(),
            radius_a: self.radius_a,
            radius_b: self.radius_b,
            angle: 0.0,
            arc_angle: 2.0 * PI as f32,
            local_x_axis,
        });
        collections
    }
}
impl ToRenderables for crate::OpenCylinder {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center().into();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let normal = (center_a - center_b).normalize();
        let rotation = Rotation3::rotation_between(&z_axis, &normal).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);
        collections.cone_collection.push(Cone {
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
        });

        collections
    }
}
impl ToRenderables for crate::OpenEccentricCone {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let center_axis: Vector3 = self.center_axis.into();
        let center: Vector3 = self.center().into();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;

        let mut normal: Vector3 = self.cap_normal.into();
        let dot_product = Matrix::dot(&normal, &(&center_a - &center_b));
        if dot_product < 0.0 {
            normal = -normal;
        }

        collections.eccentric_cone_collection.push(EccentricCone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a: center_a.clone(),
            center_b: center_b.clone(),
            radius_a: self.radius_a,
            radius_b: self.radius_b,
            normal,
        });
        collections
    }
}
impl ToRenderables for crate::OpenEllipsoidSegment {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        collections
            .ellipsoid_segment_collection
            .push(EllipsoidSegment {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                center: self.center(),
                normal: self.normal.into(),
                horizontal_radius: self.horizontal_radius,
                vertical_radius: self.vertical_radius,
                height: self.height,
            });
        collections
    }
}
impl ToRenderables for crate::OpenExtrudedRingSegment {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center().into();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let rotation = Rotation3::rotation_between(&z_axis, &center_axis).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);

        let thickness = (self.outer_radius - self.inner_radius) / self.outer_radius;

        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a.clone(),
            normal: self.center_axis.into(),
            local_x_axis: local_x_axis.clone(),
            radius_x: self.outer_radius,
            radius_y: self.outer_radius,
            thickness,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
        });
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_b.clone(),
            normal: self.center_axis.into(),
            local_x_axis: local_x_axis.clone(),
            radius_x: self.outer_radius,
            radius_y: self.outer_radius,
            thickness,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
        });
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a: center_a.clone(),
            center_b: center_b.clone(),
            radius_a: self.outer_radius,
            radius_b: self.outer_radius,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis: local_x_axis.clone(),
        });
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a: center_a.clone(),
            center_b: center_b.clone(),
            radius_a: self.inner_radius,
            radius_b: self.inner_radius,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis: local_x_axis.clone(),
        });
        collections
    }
}
impl ToRenderables for crate::OpenSphericalSegment {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        collections
            .spherical_segment_collection
            .push(SphericalSegment {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                center: self.center(),
                normal: self.normal.into(),
                radius: self.radius,
                height: self.height,
            });

        collections
    }
}
impl ToRenderables for crate::OpenTorusSegment {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        collections.torus_segment_collection.push(TorusSegment {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: self.center(),
            normal: self.normal.into(),
            radius: self.radius,
            tube_radius: self.tube_radius,
            rotation_angle: self.rotation_angle,
            arc_angle: self.arc_angle,
        });

        collections
    }
}
impl ToRenderables for crate::Ring {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let rotation = Rotation3::rotation_between(&z_axis, &self.normal.into()).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);
        let thickness = (self.outer_radius - self.inner_radius) / self.outer_radius;
        let angle = 0.0;
        let arc_angle = 2.0 * PI as f32;
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: self.center(),
            normal: self.normal.into(),
            local_x_axis: x_axis,
            radius_x: self.outer_radius,
            radius_y: self.outer_radius,
            thickness,
            angle,
            arc_angle,
        });

        collections
    }
}
impl ToRenderables for crate::Sphere {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let z_axis = Vector3::new(0.0, 0.0, 1.0);

        collections
            .spherical_segment_collection
            .push(SphericalSegment {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                center: self.center(),
                normal: z_axis,
                radius: self.radius,
                height: 2.0 * self.radius,
            });

        collections
    }
}
impl ToRenderables for crate::Torus {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        collections.torus_segment_collection.push(TorusSegment {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: self.center(),
            normal: self.normal.into(),
            radius: self.radius,
            tube_radius: self.tube_radius,
            rotation_angle: 0.0,
            arc_angle: 2.0 * PI as f32,
        });

        collections
    }
}

struct Cap {
    ring: GeneralRing,
    normal: Vector3,
    center: Vector3,
    plane: Vector4,
}

fn intersect(
    ray_vector: &Vector3,
    ray_point: &Vector3,
    plane_normal: &Vector3,
    plane_point: &Vector3,
) -> Vector3 {
    let diff = ray_point - plane_point;
    let prod1 = diff.dot(&plane_normal);
    let prod2 = ray_vector.dot(&plane_normal);
    let prod3 = prod1 / prod2;
    ray_point - ray_vector.scale(prod3)
}

// TODO use f64 for the calculations - there is a slight offset between the trapeziums and top caps

fn create_cap(
    cylinder: &crate::SolidOpenGeneralCylinder,
    cylinder_rotation: &Rotation3,
    ext_a: &Vector3,
    ext_b: &Vector3,
    center: &Vector3,
    slope: f32,
    z_angle: f32,
    height: f32,
    invert_normal: bool,
) -> Cap {
    let slope_rotation = Rotation3::from_axis_angle(&Vector3::y_axis(), slope);
    let z_angle_rotation = Rotation3::from_axis_angle(&Vector3::z_axis(), z_angle);
    let rotation = z_angle_rotation * slope_rotation;
    let local_x_axis = rotation.transform_vector(&Vector3::x_axis());
    let local_z_axis = rotation.transform_vector(&Vector3::z_axis());
    let normal = if invert_normal { -1.0 } else { 1.0 } * local_z_axis;

    let center_axis_rotation =
        Rotation3::rotation_between(&Vector3::z_axis(), &Vector3::from(cylinder.center_axis))
            .unwrap();
    let plane = Vector4::new(normal.x, normal.y, normal.z, height);
    let cap_x_axis_a = center_axis_rotation
        .transform_vector(&local_x_axis)
        .normalize();
    let cap_z_axis_a = cylinder_rotation
        .transform_vector(&local_z_axis)
        .normalize();

    let cap_radius_x_a = cylinder.radius / f32::abs(f32::cos(slope));
    let cap_radius_y = cylinder.radius;

    let line_point = Vector3::new(
        f32::cos(cylinder.rotation_angle),
        f32::sin(cylinder.rotation_angle),
        0.0,
    );
    let line_point = cylinder.radius * cylinder_rotation.transform_vector(&line_point).normalize();
    let line_start_a = ext_b - Vector3::from(cylinder.center_axis) + line_point;
    let line_end_a = ext_a + Vector3::from(cylinder.center_axis) + line_point;
    let line_vector = line_end_a - line_start_a;

    let intersection_point = intersect(&line_vector, &line_start_a, &cap_z_axis_a, &center);
    let cap_angle_axis_a = (intersection_point - center).normalize();
    let cap_angle_a = angle_between_vectors(&cap_angle_axis_a, &cap_x_axis_a, &cap_z_axis_a);

    Cap {
        ring: GeneralRing {
            node_id: cylinder.node_id,
            tree_index: cylinder.tree_index,
            color: cylinder.color,
            size: cylinder.diagonal,
            center: center.clone(),
            normal: cap_z_axis_a,
            local_x_axis: cap_x_axis_a,
            radius_x: cap_radius_x_a,
            radius_y: cap_radius_y,
            thickness: cylinder.thickness / cylinder.radius,
            angle: normalize_radians(cap_angle_a),
            arc_angle: cylinder.arc_angle,
        },
        normal,
        center: center.clone(),
        plane,
    }
}

struct GeneralCylinderWithCaps {
    cylinder: GeneralCylinder,
    cap_a: Cap,
    cap_b: Cap,
    ext_a: Vector3,
    ext_b: Vector3,
}

fn angle_between_vectors(v1: &Vector3, v2: &Vector3, up: &Vector3) -> f32 {
    let angle = nalgebra::angle(v1, v2);
    let right = Vector3::cross(v1, up);
    let more_than_pi = Vector3::dot(&right, &v2) < 0.0;
    if more_than_pi {
        2.0 * PI as f32 - angle
    } else {
        angle
    } // TODO normalize radians
}

fn create_general_cylinder(cylinder: &crate::SolidOpenGeneralCylinder) -> GeneralCylinderWithCaps {
    let center_axis: Vector3 = cylinder.center_axis.into();
    let center: Vector3 = cylinder.center().into();
    let center_a = center + center_axis * cylinder.height / 2.0;
    let center_b = center - center_axis * cylinder.height / 2.0;

    // TODO request storing this in file format instead of doing conversion on client
    let dist_from_a_to_ext_a = cylinder.radius + f32::tan(cylinder.slope_a);
    let dist_from_b_to_ext_b = cylinder.radius + f32::tan(cylinder.slope_b); // TODO verify radius_a is correct
    let height_a = dist_from_b_to_ext_b + cylinder.height;
    let height_b = dist_from_b_to_ext_b;

    let ext_a = dist_from_a_to_ext_a * center_axis + center_a;
    let ext_b = -dist_from_b_to_ext_b * center_axis + center_b;

    let normal = (ext_a - ext_b).normalize();
    let rotation = Rotation3::rotation_between(&Vector3::z_axis(), &normal).unwrap();
    let local_x_axis: Vector3 = rotation.transform_vector(&Vector3::x_axis());

    let cap_a = create_cap(
        &cylinder,
        &rotation,
        &ext_a,
        &ext_b,
        &center_a,
        cylinder.slope_a,
        cylinder.zangle_a,
        height_a,
        false,
    );
    let cap_b = create_cap(
        &cylinder,
        &rotation,
        &ext_a,
        &ext_b,
        &center_b,
        cylinder.slope_b,
        cylinder.zangle_b,
        height_b,
        true,
    );

    GeneralCylinderWithCaps {
        cylinder: GeneralCylinder {
            node_id: cylinder.node_id,
            tree_index: cylinder.tree_index,
            color: cylinder.color,
            size: cylinder.diagonal,
            center_a: ext_a,
            center_b: ext_b,
            radius: cylinder.radius,
            height_a,
            height_b,
            slope_a: cylinder.slope_a,
            slope_b: cylinder.slope_b,
            z_angle_a: cylinder.zangle_a, // TODO request rename to z_angle_a
            z_angle_b: cylinder.zangle_b,
            angle: normalize_radians(cylinder.rotation_angle), // TODO normalize
            plane_a: cap_a.plane,
            plane_b: cap_b.plane,
            arc_angle: cylinder.arc_angle, // TODO normalize
            cap_normal_a: cap_a.normal,
            cap_normal_b: cap_b.normal,
            local_x_axis,
        },
        cap_a,
        cap_b,
        ext_a,
        ext_b,
    }
}

impl ToRenderables for crate::OpenGeneralCylinder {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let cylinder_with_caps = create_general_cylinder(&crate::SolidOpenGeneralCylinder {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            diagonal: self.diagonal,
            center_x: self.center_x,
            center_y: self.center_y,
            center_z: self.center_z,
            center_axis: self.center_axis,
            height: self.height,
            radius: self.radius,
            thickness: self.radius,
            rotation_angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            slope_a: self.slope_a,
            slope_b: self.slope_b,
            zangle_a: self.zangle_a,
            zangle_b: self.zangle_b,
        });

        collections
            .general_cylinder_collection
            .push(cylinder_with_caps.cylinder);

        collections
    }
}
impl ToRenderables for crate::ClosedGeneralCylinder {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let cylinder_with_caps = create_general_cylinder(&crate::SolidOpenGeneralCylinder {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            diagonal: self.diagonal,
            center_x: self.center_x,
            center_y: self.center_y,
            center_z: self.center_z,
            center_axis: self.center_axis,
            height: self.height,
            radius: self.radius,
            thickness: self.radius,
            rotation_angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            slope_a: self.slope_a,
            slope_b: self.slope_b,
            zangle_a: self.zangle_a,
            zangle_b: self.zangle_b,
        });

        collections
            .general_cylinder_collection
            .push(cylinder_with_caps.cylinder);
        collections
            .general_ring_collection
            .push(cylinder_with_caps.cap_a.ring);
        collections
            .general_ring_collection
            .push(cylinder_with_caps.cap_b.ring);

        collections
    }
}
impl ToRenderables for crate::SolidOpenGeneralCylinder {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let cylinder_with_caps = create_general_cylinder(&self);
        let outer_cylinder = cylinder_with_caps.cylinder;
        let inner_cylinder = {
            let mut c = outer_cylinder.clone();
            c.radius = c.radius - self.thickness;
            c
        };

        collections.general_cylinder_collection.push(outer_cylinder);
        collections.general_cylinder_collection.push(inner_cylinder);
        collections
            .general_ring_collection
            .push(cylinder_with_caps.cap_a.ring);
        collections
            .general_ring_collection
            .push(cylinder_with_caps.cap_b.ring);

        collections
    }
}
impl ToRenderables for crate::SolidClosedGeneralCylinder {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let cylinder_with_caps = create_general_cylinder(&crate::SolidOpenGeneralCylinder {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            diagonal: self.diagonal,
            center_x: self.center_x,
            center_y: self.center_y,
            center_z: self.center_z,
            center_axis: self.center_axis,
            height: self.height,
            radius: self.radius,
            thickness: self.thickness,
            rotation_angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            slope_a: self.slope_a,
            slope_b: self.slope_b,
            zangle_a: self.zangle_a,
            zangle_b: self.zangle_b,
        });

        let outer_cylinder = cylinder_with_caps.cylinder;
        let inner_cylinder = {
            let mut c = outer_cylinder.clone();
            c.radius = c.radius - self.thickness;
            c
        };

        let cap_a = cylinder_with_caps.cap_a;
        let cap_b = cylinder_with_caps.cap_b;
        let ext_a = cylinder_with_caps.ext_a;
        let ext_b = cylinder_with_caps.ext_b;

        collections.general_cylinder_collection.push(outer_cylinder);
        collections.general_cylinder_collection.push(inner_cylinder);
        collections.general_ring_collection.push(cap_a.ring.clone());
        collections.general_ring_collection.push(cap_b.ring.clone());

        let normal: Vector3 = self.center_axis.into();

        for is_second in &[false, true] {
            let mut vertex_index = 0;
            let final_angle = self.rotation_angle + if *is_second { self.arc_angle } else { 0.0 };
            let radii = if *is_second {
                [self.radius - self.thickness, self.radius]
            } else {
                [self.radius, self.radius - self.thickness]
            };

            let rotation = Rotation3::rotation_between(&Vector3::z_axis(), &normal).unwrap();
            let point = Vector3::new(f32::cos(final_angle), f32::sin(final_angle), 0.0);
            let point = rotation.transform_vector(&point).normalize();
            let mut vertices = [Vector3::new(0.0, 0.0, 0.0); 4];
            for radius in &radii {
                let line_start = point * *radius + ext_b - normal;
                let line_end = point * *radius + ext_a + normal;
                let line_vector = line_end - line_start;
                vertices[vertex_index + 0] = intersect(
                    &line_vector,
                    &line_start,
                    &cap_b.ring.normal,
                    &cap_b.ring.center,
                );
                vertices[vertex_index + 1] = intersect(
                    &line_vector,
                    &line_start,
                    &cap_a.ring.normal,
                    &cap_a.ring.center,
                );
                vertex_index += 2;
            }

            collections.trapezium_collection.push(Trapezium {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                vertex_1: vertices[0],
                vertex_2: vertices[1],
                vertex_3: vertices[2],
                vertex_4: vertices[3],
            });
        }

        collections
    }
}
impl ToRenderables for crate::OpenGeneralCone {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center().into();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let normal = (center_a - center_b).normalize();
        let rotation = Rotation3::rotation_between(&z_axis, &normal).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.radius_a,
            radius_b: self.radius_b,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis,
        });
        collections
    }
}

// TODO why ar enot slope and z_angle used for general cones?
//
impl ToRenderables for crate::ClosedGeneralCone {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center().into();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let normal = (center_a - center_b).normalize();
        let rotation = Rotation3::rotation_between(&z_axis, &normal).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.radius_a,
            radius_b: self.radius_b,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis,
        });
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a.clone(),
            normal: self.center_axis.into(),
            local_x_axis: local_x_axis.clone(),
            radius_x: self.radius_a,
            radius_y: self.radius_a,
            // TODO is thickness in JS, but no thickness property exists on ClosedGeneralCone
            thickness: 1.0,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
        });
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a.clone(),
            normal: self.center_axis.into(),
            local_x_axis: local_x_axis.clone(),
            radius_x: self.radius_b,
            radius_y: self.radius_b,
            thickness: 1.0,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
        });
        collections
    }
}
impl ToRenderables for crate::SolidOpenGeneralCone {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center().into();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let normal = (center_a - center_b).normalize();
        let rotation = Rotation3::rotation_between(&z_axis, &normal).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.radius_a,
            radius_b: self.radius_b,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis,
        });
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.radius_a - self.thickness,
            radius_b: self.radius_b - self.thickness,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis,
        });
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a.clone(),
            normal: self.center_axis.into(),
            local_x_axis: local_x_axis.clone(),
            radius_x: self.radius_a,
            radius_y: self.radius_a,
            thickness: self.thickness / self.radius_a,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
        });
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_b.clone(),
            normal: self.center_axis.into(),
            local_x_axis: local_x_axis.clone(),
            radius_x: self.radius_b,
            radius_y: self.radius_b,
            thickness: self.thickness / self.radius_b,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
        });
        collections
    }
}
impl ToRenderables for crate::SolidClosedGeneralCone {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center().into();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let normal = (center_a - center_b).normalize();
        let rotation = Rotation3::rotation_between(&z_axis, &normal).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);

        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.radius_a,
            radius_b: self.radius_b,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis,
        });
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.radius_a - self.thickness,
            radius_b: self.radius_b - self.thickness,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis,
        });
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a.clone(),
            normal: self.center_axis.into(),
            local_x_axis: local_x_axis.clone(),
            radius_x: self.radius_a,
            radius_y: self.radius_a,
            thickness: self.thickness / self.radius_a,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
        });
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_b.clone(),
            normal: self.center_axis.into(),
            local_x_axis: local_x_axis.clone(),
            radius_x: self.radius_b,
            radius_y: self.radius_b,
            thickness: self.thickness / self.radius_b,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
        });

        // TODO de-duplicate this code from other primitives
        for is_second in [false, true].iter() {
            let final_angle = self.rotation_angle + if *is_second { self.arc_angle } else { 0.0 };

            let rotation = Rotation3::rotation_between(&Vector3::z_axis(), &normal).unwrap();
            let point = Vector3::new(f32::cos(final_angle), f32::sin(final_angle), 0.0);
            let point = rotation.transform_vector(&point).normalize();
            let mut vertices = [Vector3::new(0.0, 0.0, 0.0); 4];
            let mut vertex_index = 0;
            for is_a in [false, true].iter() {
                let is_really_a = if *is_second { *is_a } else { !*is_a };
                let radius = if is_really_a {
                    self.radius_a
                } else {
                    self.radius_b
                };
                let center = if is_really_a { center_a } else { center_b };
                for offset in [0.0, -self.thickness].iter() {
                    vertices[vertex_index] = (radius + offset) * point + center;
                    vertex_index += 1;
                }
            }

            collections.trapezium_collection.push(Trapezium {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                vertex_1: vertices[0],
                vertex_2: vertices[1],
                vertex_3: vertices[2],
                vertex_4: vertices[3],
            });
        }

        collections
    }
}
impl ToRenderables for crate::TriangleMesh {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        collections
    }
}
impl ToRenderables for crate::InstancedMesh {
    fn to_renderables(&self, mut collections: PrimitiveCollections) -> PrimitiveCollections {
        collections
    }
}

pub fn convert_sector(sector: &crate::Sector) -> Sector {
    // TODO calculate capacity based on number of objects of each type

    let collections = convert_primitives(&sector.primitive_collections);
    Sector {
        id: sector.header.sector_id,
        parent_id: sector.header.parent_sector_id,
        bbox_min: sector.header.bbox_min.into(),
        bbox_max: sector.header.bbox_max.into(),
        primitive_collections: collections,
    }
}

pub fn convert_scene(scene: &crate::Scene) -> Scene {
    let sectors = scene.sectors.iter().map(convert_sector).collect();

    Scene {
        root_sector_id: scene.root_sector_id,
        sectors,
    }
}
