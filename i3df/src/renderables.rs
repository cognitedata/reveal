use crate::{Matrix4, Rotation3, Translation3, Vector3, Vector4};
use inflector::cases::camelcase::to_camel_case;
use js_sys::{Float32Array, Float64Array, Map, Uint8Array};
use serde_derive::{Deserialize, Serialize};
use std::collections::HashMap;
use std::f32::consts::PI;

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

impl<G: Geometry> GeometryCollection<G> for Vec<G> {
    fn with_capacity(capacity: usize) -> Vec<G> {
        Vec::with_capacity(capacity)
    }
    fn push(&mut self, geometry: G) {
        self.push(geometry);
    }
    fn count(&self) -> usize {
        self.len()
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
pub struct Attribute {
    pub size: usize,
    pub offset: usize,
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

macro_rules! triangle_mesh_types{
    (
        $(
            {
                $struct_name:ident,
                [
                    $( $field_name:ident : $field_type:ty => $wasm_output_type:ty) ,* $(,)?
                ]
            }
        )*
    ) =>
    {
        $(
            #[wasm_bindgen]
            #[derive(Default, Clone, Debug, Deserialize, Serialize)]
            #[serde(rename_all="camelCase")]
            pub struct $struct_name {
                $(
                #[wasm_bindgen(skip)]
                pub $field_name : $field_type,
                )*
            }

            #[wasm_bindgen]
            impl $struct_name {
                $(
                pub fn $field_name(&self) -> $wasm_output_type {
                    convert_to_js_type!(self, $field_name, $field_type, $wasm_output_type)
                }
                )*
            }
        )*
    }
}

macro_rules! convert_to_js_type {
    ($self:ident, $field_name:ident, Vec<f32>, Float32Array) => {{
        Float32Array::from(&$self.$field_name[..])
    }};

    ($self:ident, $field_name:ident, Vec<u64>, Float64Array) => {{
        let data: Vec<f64> = $self
            .$field_name
            .iter()
            .map(|value| *value as f64)
            .collect();

        Float64Array::from(&data[..])
    }};

    ($self:ident, $field_name:ident, Vec<f64>, Float64Array) => {{
        Float64Array::from(&$self.$field_name[..])
    }};

    ($self:ident, $field_name:ident, Vec<[u8; 4]>, Uint8Array) => {{
        let color_flat: Vec<u8> = $self
            .$field_name
            .iter()
            .flat_map(|a| vec![a[0], a[1], a[2], a[3]])
            .collect();

        Uint8Array::from(&color_flat[..])
    }};

    ($self:ident, $field_name:ident, Vec<Vector3>, Float32Array) => {{
        let data_as_vector3 = &$self.$field_name;
        let data_as_f32 = unsafe {
            std::slice::from_raw_parts(
                data_as_vector3.as_ptr() as *const f32,
                data_as_vector3.len() * 3,
            )
        };

        Float32Array::from(data_as_f32)
    }};

    ($self:ident, $field_name:ident, Vec<Matrix4>, Float32Array) => {{
        let data_as_matrix4 = &$self.$field_name;
        let data_as_f32 = unsafe {
            std::slice::from_raw_parts(
                data_as_matrix4.as_ptr() as *const f32,
                data_as_matrix4.len() * 16,
            )
        };

        Float32Array::from(data_as_f32)
    }};
}

macro_rules! new_geometry_types {
    (
        $(
            {
                $struct_name:ident,
                $collection_attributes:ident,
                $collection_name:ident,
                [
                    $( $field_name:ident : $field_type:ty),* $(,)?
                ]
            }
        )*
    ) => {

        $(
            #[wasm_bindgen]
            #[derive(Clone, Debug, Deserialize, Serialize)]
            #[serde(rename_all="camelCase")]
            #[repr(C)]
            pub struct $struct_name {
                $(
                #[wasm_bindgen(skip)]
                pub $field_name : $field_type,
                )*
            }

            impl Geometry for $struct_name { }
        )*

        #[derive(Clone, Debug, Deserialize, Serialize)]
        pub struct PrimitiveCollections {
            pub tree_index_to_node_id_map: HashMap<u64, u64>,
            pub node_id_to_tree_index_map: HashMap<u64, u64>,
            $(
                pub $collection_name: Vec<$struct_name>,
            )*
            pub triangle_mesh_collection: TriangleMesh,
            pub instanced_mesh_collection: InstancedMesh
        }

        impl PrimitiveCollections {
            pub fn with_capacity(capacity: usize) -> PrimitiveCollections {
                PrimitiveCollections {
                    tree_index_to_node_id_map: HashMap::with_capacity(capacity),
                    node_id_to_tree_index_map: HashMap::with_capacity(capacity),
                    $(
                        $collection_name: Vec::<$struct_name>::with_capacity(capacity),
                    )*
                    triangle_mesh_collection: Default::default(),
                    instanced_mesh_collection: Default::default()
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
        impl Sector {
            $(
            pub fn $collection_name(&self) -> Uint8Array {
                let data_as_u8: &[u8] = unsafe {
                    std::slice::from_raw_parts(
                        self.primitive_collections.$collection_name.as_ptr() as *const u8,
                        self.primitive_collections.$collection_name.len() * std::mem::size_of::<$struct_name>(),
                    )
                };
                Uint8Array::from(data_as_u8)
            }
            )*

            $(
            pub fn $collection_attributes(&self) -> Map {
                let mut offset = 0;
                let mut size = 0;
                let map = Map::new();
                $(
                    {
                        offset += size;
                        size = std::mem::size_of::<$field_type>();
                        map.set(&JsValue::from(to_camel_case(stringify!($field_name))), &JsValue::from(Attribute{size, offset}));
                    }
                )*
                map
            }
            )*

            pub fn triangle_mesh_collection(&self) -> TriangleMesh {
                self.primitive_collections.triangle_mesh_collection.clone()
            }

            pub fn instanced_mesh_collection(&self) -> InstancedMesh {
                self.primitive_collections.instanced_mesh_collection.clone()
            }

            pub fn tree_index_to_node_id_map(&self) -> Map {
                Map::from(serde_wasm_bindgen::to_value(&self.primitive_collections.tree_index_to_node_id_map).unwrap())
            }

            pub fn node_id_to_tree_index_map(&self) -> Map {
                Map::from(serde_wasm_bindgen::to_value(&self.primitive_collections.node_id_to_tree_index_map).unwrap())
            }

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

triangle_mesh_types! {
    {
        TriangleMesh,
        [
            tree_index: Vec<f32> => Float32Array,
            file_id: Vec<u64> => Float64Array,
            size: Vec<f32> => Float32Array,
            triangle_count: Vec<u64> => Float64Array,
            color: Vec<[u8; 4]> => Uint8Array
        ]
    }

    {
        InstancedMesh,
        [
            tree_index: Vec<f32> => Float32Array,
            size: Vec<f32> => Float32Array,
            file_id: Vec<u64> => Float64Array,
            triangle_count: Vec<f64> => Float64Array,
            triangle_offset: Vec<f64> => Float64Array,
            color: Vec<[u8; 4]> => Uint8Array,
            translation: Vec<Vector3> => Float32Array,
            rotation: Vec<Vector3> => Float32Array,
            scale: Vec<Vector3> => Float32Array,
            instance_matrix: Vec<Matrix4> => Float32Array
        ]
    }
}

new_geometry_types! {
    {
        Box3D,
        box_attributes,
        box_collection,
        [
            tree_index: f32,
            color: [u8; 4],
            instance_matrix: Matrix4,
        ]
    }

    {
        Cone,
        cone_attributes,
        cone_collection,
        [
            tree_index: f32,
            color: [u8; 4],
            center_a: Vector3,
            center_b: Vector3,
            radius_a: f32,
            radius_b: f32,
            angle: f32,
            arc_angle: f32,
            local_x_axis: Vector3,
        ]
    }

    {
        Circle,
        circle_attributes,
        circle_collection,
        [
            tree_index: f32,
            color: [u8; 4],
            normal: Vector3,
            instance_matrix: Matrix4,
        ]
    }

    {
        EccentricCone,
        eccentric_cone_attributes,
        eccentric_cone_collection,
        [
            tree_index: f32,
            color: [u8; 4],
            center_a: Vector3,
            center_b: Vector3,
            radius_a: f32,
            radius_b: f32,
            normal: Vector3,
        ]
    }

    {
        EllipsoidSegment,
        ellipsoid_segment_attributes,
        ellipsoid_segment_collection,
        [
            tree_index: f32,
            color: [u8; 4],
            center: Vector3,
            normal: Vector3,
            horizontal_radius: f32,
            vertical_radius: f32,
            height: f32,
        ]
    }

    {
        GeneralRing,
        general_ring_attributes,
        general_ring_collection,
        [
            tree_index: f32,
            color: [u8; 4],
            normal: Vector3,
            thickness: f32,
            angle: f32,
            arc_angle: f32,
            instance_matrix: Matrix4,
        ]
    }

    {
        GeneralCylinder,
        general_cylinder_attributes,
        general_cylinder_collection,
        [
            tree_index: f32,
            color: [u8; 4],
            center_a: Vector3,
            center_b: Vector3,
            radius: f32,
            angle: f32,
            plane_a: Vector4,
            plane_b: Vector4,
            arc_angle: f32,
            local_x_axis: Vector3,
        ]
    }
    {
        Nut,
        nut_attributes,
        nut_collection,
        [
            tree_index: f32,
            color: [u8; 4],
            instance_matrix: Matrix4,
        ]
    }

    {
        Quad,
        quad_attributes,
        quad_collection,
        [
            tree_index: f32,
            color: [u8; 4],
            instance_matrix: Matrix4,
        ]
    }

    {
        SphericalSegment,
        spherical_segment_attributes,
        spherical_segment_collection,
        [
            tree_index: f32,
            color: [u8; 4],
            center: Vector3,
            normal: Vector3,
            radius: f32,
            height: f32,
        ]
    }

    {
        TorusSegment,
        torus_segment_attributes,
        torus_segment_collection,
        [
            tree_index: f32,
            color: [u8; 4],
            size: f32,
            radius: f32,
            tube_radius: f32,
            arc_angle: f32,
            instance_matrix: Matrix4,
        ]
    }
    {
        Trapezium,
        trapezium_attributes,
        trapezium_collection,
        [
            tree_index: f32,
            color: [u8; 4],
            vertex_1: Vector3,
            vertex_2: Vector3,
            vertex_3: Vector3,
            vertex_4: Vector3,
        ]
    }
}

// TODO see if there exists a library for unnamed struct macros so we can avoid these '*Info' types
pub struct CircleInfo {
    tree_index: f32,
    color: [u8; 4],
    center: Vector3,
    normal: Vector3,
    radius: f32,
}

impl Circle {
    fn new(data: &CircleInfo) -> Circle {
        let translation_matrix = Translation3::from(data.center);
        let rotation_matrix = match Rotation3::rotation_between(&Vector3::z_axis(), &data.normal) {
            Some(x) => x,
            None => Rotation3::from_axis_angle(&Vector3::x_axis(), PI),
        };
        let scale_matrix = Matrix4::new_nonuniform_scaling(&Vector3::new(
            2.0 * data.radius,
            2.0 * data.radius,
            1.0,
        ));

        let instance_matrix =
            Matrix4::from(translation_matrix) * Matrix4::from(rotation_matrix) * scale_matrix;

        Circle {
            tree_index: data.tree_index as f32,
            color: data.color,
            normal: data.normal,
            instance_matrix,
        }
    }
}

pub struct QuadInfo {
    tree_index: f32,
    color: [u8; 4],
    vertex_1: Vector3,
    vertex_2: Vector3,
    vertex_3: Vector3,
}

impl Quad {
    fn new(data: &QuadInfo) -> Quad {
        let side_1 = data.vertex_3 - data.vertex_1;
        let side_2 = data.vertex_3 - data.vertex_2;
        let scale_matrix =
            Matrix4::new_nonuniform_scaling(&Vector3::new(side_2.norm(), side_1.norm(), 1.0));

        let normal = Vector3::cross(&side_2, &side_1).normalize();
        let side_1 = side_1.normalize();
        let side_2 = side_2.normalize();
        #[rustfmt::skip]
        let basis = Matrix4::new(
            side_2.x, side_1.x, normal.x, 0.0,
            side_2.y, side_1.y, normal.y, 0.0,
            side_2.z, side_1.z, normal.z, 0.0,
            0.0, 0.0, 0.0, 1.0,
        );

        let center = 0.5 * (data.vertex_1 + data.vertex_2);
        let translation_matrix = Translation3::from(center);

        let instance_matrix = Matrix4::from(translation_matrix) * basis * scale_matrix;

        Quad {
            tree_index: data.tree_index as f32,
            color: data.color,
            instance_matrix,
        }
    }
}

pub struct TorusSegmentInfo {
    tree_index: f32,
    color: [u8; 4],
    size: f32,
    center: Vector3,
    normal: Vector3,
    radius: f32,
    tube_radius: f32,
    rotation_angle: f32,
    arc_angle: f32,
}

impl TorusSegment {
    fn new(data: &TorusSegmentInfo) -> TorusSegment {
        let translation_matrix = Translation3::from(data.center);
        let first_rotation = Rotation3::from_axis_angle(&Vector3::z_axis(), data.rotation_angle);
        let second_rotation = match Rotation3::rotation_between(&Vector3::z_axis(), &data.normal) {
            Some(x) => x,
            None => Rotation3::from_axis_angle(&Vector3::x_axis(), PI),
        };

        let instance_matrix = Matrix4::from(translation_matrix)
            * Matrix4::from(second_rotation)
            * Matrix4::from(first_rotation);

        TorusSegment {
            tree_index: data.tree_index as f32,
            color: data.color,
            size: data.size,
            radius: data.radius,
            tube_radius: data.tube_radius,
            arc_angle: data.arc_angle,
            instance_matrix,
        }
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
