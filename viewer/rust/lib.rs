use js_sys::{Float32Array, Map, Uint32Array};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::panic;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

#[macro_use]
pub mod error;

#[derive(Deserialize, Serialize)]
struct UvMap {
    //pub name: String,
    //pub filename: String,
    #[serde(with = "serde_bytes")]
    pub uv: Vec<u8>, // actually u32
}

#[derive(Deserialize, Serialize)]
struct Body {
    #[serde(with = "serde_bytes")]
    pub indices: Vec<u8>, // actually u32
    #[serde(with = "serde_bytes")]
    pub vertices: Vec<u8>, // actually f32
    pub normals: Vec<u8>, // actually f32
    pub uv_maps: Vec<UvMap>,
}

#[derive(Deserialize, Serialize)]
struct Ctm {
    pub body: Body,
}

#[wasm_bindgen]
#[derive(Deserialize, Serialize, Clone)]
pub struct CtmResult {
    file: openctm::File,
}

#[wasm_bindgen]
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ParsedSector {
    instance_meshes: InstancedMeshInput,
    triangle_meshes: TriangleMeshInput,
}

#[wasm_bindgen]
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TriangleMeshInput {
    file_ids: Vec<u64>,
    colors: Vec<u8>,
    tree_indices: Vec<f32>,
    triangle_counts: Vec<u64>,
}

#[wasm_bindgen]
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InstancedMeshInput {
    file_ids: Vec<u64>,
    colors: Vec<u8>,
    tree_indices: Vec<f32>,
    triangle_counts: Vec<f64>,
    triangle_offsets: Vec<f64>,
    instance_matrices: Vec<f32>,
}

#[wasm_bindgen]
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CtmInput {
    indices: Vec<u32>,
    vertices: Vec<f32>,
    normals: Option<Vec<f32>>,
}

#[wasm_bindgen]
#[derive(Default, Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TriangleMeshResult {
    file_id: u64,
    indices: Vec<u32>,
    tree_indices: Vec<f32>,
    vertices: Vec<f32>,
    normals: Option<Vec<f32>>,
    colors: Vec<u8>,
}

#[wasm_bindgen]
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InstanceMeshResult {
    triangle_count: f64,
    triangle_offset: u64,
    colors: Vec<u8>,
    instance_matrices: Vec<f32>,
    tree_indices: Vec<f32>,
}

#[wasm_bindgen]
#[derive(Default, Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InstanceMeshFileResult {
    file_id: u64,
    indices: Vec<u32>,
    vertices: Vec<f32>,
    normals: Option<Vec<f32>>,
    instances: Vec<InstanceMeshResult>,
}

#[wasm_bindgen]
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SectorGeometry {
    // Note: These fields may need to be added back when everything is moved to Rust
    // tree_index_to_node_id_map: HashMap<u64, u64>,
    // node_id_to_tree_index_map: HashMap<u64, u64>,
    // primatives: i3df::renderables::PrimitiveCollections,
    instance_meshes: Vec<InstanceMeshFileResult>,
    triangle_meshes: Vec<TriangleMeshResult>,
}

#[wasm_bindgen]
impl SectorGeometry {
    pub fn instance_meshes(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.instance_meshes).map_err(|e| e.into())
    }

    pub fn triangle_meshes(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.triangle_meshes).map_err(|e| e.into())
    }
}

#[wasm_bindgen]
impl CtmResult {
    pub fn indices(&self) -> Uint32Array {
        Uint32Array::from(self.file.indices.as_slice())
    }
    pub fn vertices(&self) -> Float32Array {
        let data_as_vector3 = &self.file.vertices;
        let vertices_as_f32 = unsafe {
            std::slice::from_raw_parts(
                data_as_vector3.as_ptr() as *const f32,
                data_as_vector3.len() * 3,
            )
        };
        Float32Array::from(vertices_as_f32)
    }
    pub fn normals(&self) -> Option<Float32Array> {
        let data_as_vector3 = match &self.file.normals {
            Some(x) => x,
            None => return None,
        };
        let data_as_f32 = unsafe {
            std::slice::from_raw_parts(
                data_as_vector3.as_ptr() as *const f32,
                data_as_vector3.len() * 3,
            )
        };
        Some(Float32Array::from(data_as_f32))
    }
    // TODO 2019-10-23 dragly: add UV maps
}

#[wasm_bindgen]
pub fn parse_ctm(input: &[u8]) -> Result<CtmResult, JsValue> {
    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let cursor = std::io::Cursor::new(input);
    let file = openctm::parse(cursor).unwrap();

    let result = CtmResult { file };

    Ok(result)
}

#[wasm_bindgen]
pub fn parse_and_convert_sector(input: &[u8]) -> Result<i3df::renderables::Sector, JsValue> {
    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let cursor = std::io::Cursor::new(input);

    // TODO see if it is possible to simplify this so we can use the ? operator instead
    match i3df::parse_sector(cursor) {
        Ok(x) => Ok(i3df::renderables::convert_sector(&x)),
        Err(e) => Err(JsValue::from(error::ParserError::from(e))),
    }
}

// TODO: Reduce use of clone in finalize functions
#[wasm_bindgen]
pub fn finalize_detailed(i3d_file: JsValue, ctm_files: JsValue) -> Result<SectorGeometry, JsValue> {
    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));
    let i3d_file: ParsedSector =
        serde_wasm_bindgen::from_value(i3d_file).map_err(|e| e.to_string())?;
    let ctm_map: HashMap<String, CtmInput> =
        serde_wasm_bindgen::from_value(ctm_files).map_err(|e| e.to_string())?;
    let triangle_meshes = i3d_file.triangle_meshes;
    let instance_meshes = i3d_file.instance_meshes;

    let final_triangle_meshes = finalize_triagle_meshes(triangle_meshes, ctm_map.clone())?;

    let final_instance_meshes = finalize_instance_meshes(instance_meshes, ctm_map)?;

    Ok(SectorGeometry {
        instance_meshes: final_instance_meshes,
        triangle_meshes: final_triangle_meshes,
    })
}

fn finalize_triagle_meshes(
    triangle_meshes: TriangleMeshInput,
    ctm_map: HashMap<String, CtmInput>,
) -> Result<Vec<TriangleMeshResult>, JsValue> {
    let file_ids = triangle_meshes.file_ids;
    let colors = triangle_meshes.colors;
    let tree_indices = triangle_meshes.tree_indices;
    let meshes_grouped_by_file = group_meshes_by_number(file_ids);
    let mut final_triangle_meshes = Vec::new();
    let triangle_counts = triangle_meshes.triangle_counts;

    for (file_id, mesh_indices) in meshes_grouped_by_file {
        let file_triangle_counts = mesh_indices
            .iter()
            .map(|i| triangle_counts[*i as usize])
            .collect();
        let offsets = create_offsets_array(&file_triangle_counts);
        let filename = format!("mesh_{}.ctm", file_id);

        if let Some(ctm_result) = ctm_map.get(&filename) {
            let indices = ctm_result.indices.clone();
            let vertices = ctm_result.vertices.clone();
            let normals = ctm_result.normals.clone();
            let mut shared_colors = vec![0; 3 * indices.len()];
            let mut shared_tree_indices = vec![0.; indices.len()];

            for i in 0..mesh_indices.len() {
                let mesh_idx = mesh_indices[i] as usize;
                let tree_index = tree_indices[mesh_idx];
                let tri_offset = offsets[i];
                let tri_count = file_triangle_counts[i];
                let (r, g, b) = (
                    colors[4 * mesh_idx + 0],
                    colors[4 * mesh_idx + 1],
                    colors[4 * mesh_idx + 2],
                );

                for tri_idx in tri_offset..(tri_offset + tri_count) {
                    for j in 0..3 {
                        let v_idx = indices[3 * tri_idx as usize + j] as usize;

                        shared_tree_indices[v_idx] = tree_index;

                        shared_colors[3 * v_idx + 0] = r;
                        shared_colors[3 * v_idx + 1] = g;
                        shared_colors[3 * v_idx + 2] = b;
                    }
                }
            }

            let mesh = TriangleMeshResult {
                colors: shared_colors,
                file_id,
                tree_indices: shared_tree_indices,
                indices,
                vertices,
                normals,
            };
            final_triangle_meshes.push(mesh);
        } else {
            return Err("CTM file not found".into());
        }
    }
    Ok(final_triangle_meshes)
}

fn finalize_instance_meshes(
    instance_meshes: InstancedMeshInput,
    ctm_map: HashMap<String, CtmInput>,
) -> Result<Vec<InstanceMeshFileResult>, JsValue> {
    let file_ids = instance_meshes.file_ids.clone();
    let triangle_offsets = instance_meshes.triangle_offsets.clone();
    let triangle_counts = instance_meshes.triangle_counts.clone();
    let tree_indices = instance_meshes.tree_indices.clone();
    let instance_matrices = instance_meshes.instance_matrices;
    let colors = instance_meshes.colors;
    let meshes_grouped_by_file = group_meshes_by_number(file_ids);
    let mut final_instance_meshes = Vec::new();

    for (file_id, mesh_indices) in meshes_grouped_by_file {
        let filename = format!("mesh_{}.ctm", file_id);
        if let Some(ctm_result) = ctm_map.get(&filename) {
            let indices = ctm_result.indices.clone();
            let vertices = ctm_result.vertices.clone();
            let normals = ctm_result.normals.clone();
            let mut instance_meshes = Vec::new();

            let file_triangle_offsets = mesh_indices
                .iter()
                .map(|i| triangle_offsets[*i as usize] as u64)
                .collect();
            let file_triangle_counts: Vec<f64> = mesh_indices
                .iter()
                .map(|i| triangle_counts[*i as usize])
                .collect();
            let file_meshes_grouped_by_offsets = group_meshes_by_number(file_triangle_offsets);

            for (triangle_offset, file_mesh_indices) in file_meshes_grouped_by_offsets {
                // NOTE the triangle counts should be the same for all meshes with the same offset,
                // hence we can look up only file_mesh_indices[0] instead of enumerating here
                let triangle_count = file_triangle_counts[file_mesh_indices[0] as usize];
                let mut instance_matrix_buffer = Vec::with_capacity(16 * file_mesh_indices.len());
                let mut tree_indices_buffer = Vec::with_capacity(file_mesh_indices.len());
                let mut color_buffer = Vec::with_capacity(file_mesh_indices.len());

                for i in 0..file_mesh_indices.len() {
                    let mesh_idx = mesh_indices[file_mesh_indices[i] as usize] as usize;
                    let tree_index = tree_indices[mesh_idx];
                    instance_matrix_buffer
                        .extend_from_slice(&instance_matrices[mesh_idx * 16..mesh_idx * 16 + 16]);
                    tree_indices_buffer.push(tree_index);
                    color_buffer.push(colors[mesh_idx]);
                }
                let mesh = InstanceMeshResult {
                    triangle_count,
                    triangle_offset,
                    instance_matrices: instance_matrices.clone(),
                    colors: colors.clone(),
                    tree_indices: tree_indices.clone(),
                };
                instance_meshes.push(mesh);
            }

            let mesh_file = InstanceMeshFileResult {
                file_id,
                indices,
                vertices,
                normals,
                instances: instance_meshes,
            };
            final_instance_meshes.push(mesh_file);
        } else {
            return Err("CTM file not found".into());
        }
    }

    Ok(final_instance_meshes)
}

fn create_offsets_array(array: &Vec<u64>) -> Vec<u64> {
    let mut offsets = Vec::with_capacity(array.len());
    offsets.push(0);
    for i in 1..array.len() {
        offsets.push(offsets[i - 1] + array[i - 1]);
    }
    offsets
}

fn group_meshes_by_number(file_ids: Vec<u64>) -> HashMap<u64, Vec<u64>> {
    let mut meshes_grouped_by_file: HashMap<u64, Vec<u64>> = HashMap::new();
    for (i, file_id) in file_ids.iter().enumerate() {
        let old_value = meshes_grouped_by_file.entry(*file_id).or_default();
        old_value.push(i as u64);
    }
    meshes_grouped_by_file
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct SimpleSectorData {
    faces: Float32Array,
    node_id_to_tree_index_map: Map,
    tree_index_to_node_id_map: Map,
}

#[wasm_bindgen]
impl SimpleSectorData {
    pub fn faces(&self) -> Float32Array {
        self.faces.clone()
    }
    pub fn node_id_to_tree_index_map(&self) -> Map {
        self.node_id_to_tree_index_map.clone()
    }
    pub fn tree_index_to_node_id_map(&self) -> Map {
        self.tree_index_to_node_id_map.clone()
    }
}

#[wasm_bindgen]
pub fn parse_and_convert_f3df(input: &[u8]) -> Result<SimpleSectorData, JsValue> {
    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let cursor = std::io::Cursor::new(input);

    let sector = match f3df::parse_sector(cursor) {
        Ok(x) => x,
        Err(e) => return Err(JsValue::from(error::ParserError::from(e))),
    };

    let renderable_sector = f3df::renderables::convert_sector(&sector);
    let faces_as_f32: &[f32] = unsafe {
        // At this point, we do not want to pass Vec<Face> to JS,
        // because it will turn into an inefficient array of objects.
        // Instead, we want to use the more performant Float32Array to hold the data and only make
        // sense of it in WebGL from now on.
        // This requires us to use an unsafe block here to get a view into the data as if it was
        // just &[f32].
        // However, this is safe because we are making a copy below.
        // Otherwise, we would not know when to free the memory on our end.
        let pointer = renderable_sector.faces.as_ptr() as *const f32;
        let length = renderable_sector.faces.len() * std::mem::size_of::<f3df::renderables::Face>()
            / std::mem::size_of::<f32>();
        std::slice::from_raw_parts(pointer, length)
    };

    // Returning a Vec<f32> here would lead to copying on the JS side instead.
    // Also note that using a Float32Array::view here instead would be _very_ unsafe.
    let faces_as_float_32_array = Float32Array::from(faces_as_f32);

    Ok(SimpleSectorData {
        faces: faces_as_float_32_array,
        node_id_to_tree_index_map: Map::from(
            serde_wasm_bindgen::to_value(&renderable_sector.node_id_to_tree_index_map).unwrap(),
        ),
        tree_index_to_node_id_map: Map::from(
            serde_wasm_bindgen::to_value(&renderable_sector.tree_index_to_node_id_map).unwrap(),
        ),
    })
}

#[wasm_bindgen]
pub fn test() -> String {
    "Hello from rust".into()
}
