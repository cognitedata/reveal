use crate::{Matrix4, Vector3, Vector4};
use serde_derive::{Deserialize, Serialize};
use js_sys::{Map, Uint8Array, Float64Array, Float32Array};
use inflector::cases::camelcase::to_camel_case;

use serde_wasm_bindgen;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

pub mod box3d;
pub mod circle;
pub mod common;
pub mod cone;
pub mod cylinder;
pub mod ellipsoid;
pub mod mesh;
pub mod nut;
pub mod ring;
pub mod sphere;
pub mod torus;

pub use box3d::*;
pub use circle::*;
pub use cone::*;
pub use cylinder::*;
pub use ellipsoid::*;
pub use mesh::*;
pub use nut::*;
pub use ring::*;
pub use sphere::*;
pub use torus::*;

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
    pub fn sector_id(&self, index: usize) -> usize {
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
            primitive_collections: PrimitiveCollections::with_capacity(0),
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
        };
        data_as_f32.to_vec()
    }};

    ($self:ident, $field_name:ident, Vector4, f32) => {{
        let data_as_vector4 = &$self.$field_name;
        let data_as_f32 = unsafe {
            std::slice::from_raw_parts(
                data_as_vector4.as_ptr() as *const f32,
                data_as_vector4.len() * 4,
            )
        };
        data_as_f32.to_vec()
    }};

    ($self:ident, $field_name:ident, Matrix4, f32) => {{
        let data_as_matrix4 = &$self.$field_name;
        let data_as_f32 = unsafe {
            std::slice::from_raw_parts(
                data_as_matrix4.as_ptr() as *const f32,
                data_as_matrix4.len() * 16,
            )
        };
        data_as_f32.to_vec()
    }};

    ($self:ident, $field_name:ident, Texture, Texture) => {{
        $self.$field_name.clone()
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

                pub fn attributes(&self) -> PrimitiveAttributes {
                    let attributes = PrimitiveAttributes {
                        f32_attributes: Map::new(),
                        f64_attributes: Map::new(),
                        u8_attributes: Map::new(),
                        vec3_attributes: Map::new(),
                        vec4_attributes: Map::new(),
                        mat4_attributes: Map::new(),
                    };
                    $( //fields
                    insert_attribute!(self, attributes, $field_name, $field_type, $wasm_vec_result );
                    )*
                    attributes
                }
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
                    // TODO they should all be the same
                    //let lengths = [$(self.$field_name.len(),)*];
                    //let max = lengths.iter().max().unwrap();
                    //*max
                    self.tree_index.len()
                }
            }
        )*

        #[derive(Clone, Debug, Deserialize, Serialize)]
        pub struct PrimitiveCollections {
            $(
                pub $collection_name: $vec_struct_name,
            )*
        }

        #[wasm_bindgen]
        #[derive(Clone, Debug)]
        pub struct PrimitiveAttributes {
            f64_attributes: Map,
            u8_attributes: Map,
            f32_attributes: Map,
            vec3_attributes: Map,
            vec4_attributes: Map,
            mat4_attributes: Map,
        }

        #[wasm_bindgen]
        impl PrimitiveAttributes {
            pub fn f64_attributes(&self) -> Map {
                self.f64_attributes.clone()
            }
            pub fn u8_attributes(&self) -> Map {
                self.u8_attributes.clone()
            }
            pub fn f32_attributes(&self) -> Map {
                self.f32_attributes.clone()
            }
            pub fn vec3_attributes(&self) -> Map {
                self.vec3_attributes.clone()
            }
            pub fn vec4_attributes(&self) -> Map {
                self.vec4_attributes.clone()
            }
            pub fn mat4_attributes(&self) -> Map {
                self.mat4_attributes.clone()
            }
        }

        impl PrimitiveCollections {
            pub fn with_capacity(capacity: usize) -> PrimitiveCollections {
                PrimitiveCollections {
                    $(
                        $collection_name: $vec_struct_name::with_capacity(capacity),
                    )*
                }
            }
        }

        #[wasm_bindgen]
        #[derive(Copy, Clone, Debug, Deserialize, Serialize)]
        pub struct CollectionStatistics {
            $(
            pub $collection_name: usize,
            )*
        }

        // TODO move statistics out of here - rather create a macro that can be used to create
        // other macros that iterate over all the different renderable types, so that for instance
        // a statistics class can be made in the dump program
        #[wasm_bindgen]
        #[derive(Copy, Clone, Debug, Deserialize, Serialize)]
        pub struct SectorStatistics {
            pub id: usize,
            pub collections: CollectionStatistics,
        }

        #[wasm_bindgen]
        #[derive(Copy, Clone, Debug, Deserialize, Serialize)]
        pub struct SceneStatistics {
            pub sectors: usize,
            pub collections: CollectionStatistics,
        }

        #[wasm_bindgen]
        impl Scene {
            pub fn statistics(&self) -> SceneStatistics {
                SceneStatistics {
                    sectors: self.sectors.len(),
                    collections: CollectionStatistics {
                    $(
                        $collection_name: self.sectors.iter().fold(0, |acc, sector| { acc + sector.primitive_collections.$collection_name.count() } ),
                    )*
                    },
                }
            }
        }

        #[wasm_bindgen]
        #[derive(Clone, Debug, Deserialize, Serialize)]
        pub struct Sector {
            pub id: usize,

            pub parent_id: Option<usize>,
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

            pub fn statistics(&self) -> SectorStatistics {
                SectorStatistics {
                    id: self.id,
                    collections: CollectionStatistics {
                    $(
                        $collection_name: self.primitive_collections.$collection_name.count(),
                    )*
                    },
                }
            }
        }
    };
}

macro_rules! insert_attribute {

    // TODO a lot of this code is duplicated from make_func_vec - deduplicate please

    ($self:ident, $attributes:ident, $field_name:ident, u64, f64) => {{
        let data: Vec<f64> = $self
            .$field_name
            .iter()
            .map(|value| *value as f64)
            .collect();
        $attributes.f64_attributes.set(&JsValue::from(to_camel_case(stringify!($field_name))), &Float64Array::from(&data[..]));
    }};

    ($self:ident, $attributes:ident, $field_name:ident, f32, f32) => {{
        $attributes.f32_attributes.set(&JsValue::from(to_camel_case(stringify!($field_name))), &Float32Array::from(&$self.$field_name[..]));
    }};

    ($self:ident, $attributes:ident, $field_name:ident, [u8; 4], u8) => {{
        let color_flat: Vec<u8> = $self
            .$field_name
            .iter()
            .flat_map(|a| vec![a[0], a[1], a[2], a[3]])
            .collect();
        $attributes.u8_attributes.set(&JsValue::from(to_camel_case(stringify!($field_name))), &Uint8Array::from(&color_flat[..]));
    }};

    ($self:ident, $attributes:ident, $field_name:ident, Vector3, f32) => {{
        let data_as_vector3 = &$self.$field_name;
        let data_as_f32 = unsafe {
            std::slice::from_raw_parts(
                data_as_vector3.as_ptr() as *const f32,
                data_as_vector3.len() * 3,
            )
        };
        let data = data_as_f32.to_vec();
        $attributes.vec3_attributes.set(&JsValue::from(to_camel_case(stringify!($field_name))), &Float32Array::from(&data[..]));
    }};

    ($self:ident, $attributes:ident, $field_name:ident, Vector4, f32) => {{
        let data_as_vector4 = &$self.$field_name;
        let data_as_f32 = unsafe {
            std::slice::from_raw_parts(
                data_as_vector4.as_ptr() as *const f32,
                data_as_vector4.len() * 4,
            )
        };
        let data = data_as_f32.to_vec();
        $attributes.vec4_attributes.set(&JsValue::from(to_camel_case(stringify!($field_name))), &Float32Array::from(&data[..]));
    }};

    ($self:ident, $attributes:ident, $field_name:ident, Matrix4, f32) => {{
        let data_as_matrix4 = &$self.$field_name;
        let data_as_f32 = unsafe {
            std::slice::from_raw_parts(
                data_as_matrix4.as_ptr() as *const f32,
                data_as_matrix4.len() * 16,
            )
        };
        let data = data_as_f32.to_vec();
        $attributes.mat4_attributes.set(&JsValue::from(to_camel_case(stringify!($field_name))), &Float32Array::from(&data[..]));
    }};
}

new_geometry_types! {
    {
        Box3D,
        Box3DVec,
        box_collection,
        [
            node_id: u64 => f64,
            tree_index: u64 => f64,
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
            tree_index: u64 => f64,
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
            tree_index: u64 => f64,
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
            tree_index: u64 => f64,
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
            tree_index: u64 => f64,
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
            tree_index: u64 => f64,
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
            instance_matrix: Matrix4 => f32,
        ]
    }

    {
        GeneralCylinder, GeneralCylinderVec, general_cylinder_collection,
        [
            node_id: u64 => f64,
            tree_index: u64 => f64,
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
            tree_index: u64 => f64,
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
            tree_index: u64 => f64,
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
            tree_index: u64 => f64,
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
            tree_index: u64 => f64,
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
            tree_index: u64 => f64,
            color: [u8; 4] => u8,
            size: f32 => f32,
            vertex_1: Vector3 => f32,
            vertex_2: Vector3 => f32,
            vertex_3: Vector3 => f32,
            vertex_4: Vector3 => f32,
        ]
    }

    // Meshes
    {
        TriangleMesh, TriangleMeshVec, triangle_mesh_collection,
        [
            node_id: u64 => f64,
            tree_index: u64 => f64,
            color: [u8; 4] => u8,
            size: f32 => f32,
            file_id: u64 => f64,
            triangle_count: u64 => f64,
            //triangle_offset: u64 => f64,
        ]
    }
    {
        InstancedMesh, InstancedMeshVec, instanced_mesh_collection,
        [
            node_id: u64 => f64,
            tree_index: u64 => f64,
            color: [u8; 4] => u8,
            size: f32 => f32,
            file_id: u64 => f64,
            triangle_count: u64 => f64,
            triangle_offset: u64 => f64,
            translation: Vector3 => f32,
            rotation: Vector3 => f32,
            scale: Vector3 => f32,
        ]
    }
}

pub trait ToRenderables {
    fn to_renderables(&self, collections: &mut PrimitiveCollections);
}

pub fn convert_scene(scene: &crate::Scene) -> Scene {
    let sectors = scene.sectors.iter().map(convert_sector).collect();

    Scene {
        root_sector_id: scene.root_sector_id,
        sectors,
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
