use i3df::renderables::{InstancedMesh, PrimitiveCollections, Sector, TriangleMesh};
use js_sys::{Float32Array, Map, Promise, Uint32Array, Uint8Array};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::panic;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;
use wasm_bindgen_futures::JsFuture;

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
    sector: Sector,
    instance_meshes: Vec<InstanceMeshFileResult>,
    triangle_meshes: Vec<TriangleMeshResult>,
}

#[wasm_bindgen]
impl SectorGeometry {
    #[wasm_bindgen(getter)]
    pub fn instance_meshes(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.instance_meshes).map_err(|e| e.into())
    }
    #[wasm_bindgen(getter)]
    pub fn triangle_meshes(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.triangle_meshes).map_err(|e| e.into())
    }
    #[wasm_bindgen(getter)]
    pub fn sector(&mut self) -> Sector {
        // Note: User can only get sector once
        // Done to avoid cloning or moving `self`
        let dummy_sector = Sector {
            id: self.sector.id,
            parent_id: self.sector.parent_id,
            bbox_min: self.sector.bbox_min,
            bbox_max: self.sector.bbox_max,
            primitive_collections: PrimitiveCollections::with_capacity(0),
        };
        std::mem::replace(&mut self.sector, dummy_sector)
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

fn parse_ctm(input: &[u8]) -> Result<CtmResult, JsValue> {
    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let cursor = std::io::Cursor::new(input);
    let file = openctm::parse(cursor).map_err(|e| e.to_string())?;

    let result = CtmResult { file };

    Ok(result)
}

fn parse_and_convert_sector(input: &[u8]) -> Result<Sector, JsValue> {
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

async fn load_file(
    blob_url: &String,
    file_name: &String,
    headers: JsValue,
) -> Result<Uint8Array, JsValue> {
    let value = JsFuture::from(getCadSectorFile(&blob_url, &file_name, headers)).await?;
    Ok(Uint8Array::new(&value))
}

#[wasm_bindgen(module = "/src/utilities/networking/utilities.ts")]
extern "C" {
    fn getCadSectorFile(blob_url: &str, file_name: &str, headers: JsValue) -> Promise;
}

#[wasm_bindgen]
pub async fn load_parse_finalize_detailed(
    file_name: String,
    blob_url: String,
    headers: JsValue,
) -> Result<SectorGeometry, JsValue> {
    let i3d_file = parse_and_convert_sector(
        &load_file(&blob_url, &file_name, headers.clone())
            .await?
            .to_vec(),
    )?;
    let triangle_meshes = &i3d_file.primitive_collections.triangle_mesh_collection;
    let instanced_meshes = &i3d_file.primitive_collections.instanced_mesh_collection;
    let mut ctm_map = HashMap::new();
    for file_id in triangle_meshes
        .file_id
        .iter()
        .chain(instanced_meshes.file_id.iter())
    {
        let file = format!("mesh_{}.ctm", file_id);
        if !ctm_map.contains_key(&file) {
            let ctm_input: Uint8Array = load_file(&blob_url, &file, headers.clone()).await?;
            let data = parse_ctm(&ctm_input.to_vec())?;
            ctm_map.insert(file, data);
        }
    }
    finalize_detailed(i3d_file, ctm_map)
}

fn finalize_detailed(
    i3d_file: Sector,
    ctm_map: HashMap<String, CtmResult>,
) -> Result<SectorGeometry, JsValue> {
    let instance_meshes = &i3d_file.primitive_collections.instanced_mesh_collection;
    let triangle_meshes = &i3d_file.primitive_collections.triangle_mesh_collection;

    let final_triangle_meshes = finalize_triagle_meshes(triangle_meshes, &ctm_map)?;

    let final_instance_meshes = finalize_instance_meshes(instance_meshes, &ctm_map)?;

    Ok(SectorGeometry {
        sector: i3d_file,
        instance_meshes: final_instance_meshes,
        triangle_meshes: final_triangle_meshes,
    })
}

fn finalize_triagle_meshes(
    triangle_meshes: &TriangleMesh,
    ctm_map: &HashMap<String, CtmResult>,
) -> Result<Vec<TriangleMeshResult>, JsValue> {
    let file_ids = &triangle_meshes.file_id;
    let colors = &triangle_meshes.color;
    let tree_indices = &triangle_meshes.tree_index;
    let triangle_counts = &triangle_meshes.triangle_count;
    let meshes_grouped_by_file = group_meshes_by_number(&file_ids);
    let mut final_triangle_meshes = Vec::new();

    for (file_id, mesh_indices) in meshes_grouped_by_file {
        let file_triangle_counts = mesh_indices.iter().map(|i| triangle_counts[*i]).collect();
        let offsets = create_offsets_array(&file_triangle_counts);
        let filename = format!("mesh_{}.ctm", file_id);

        if let Some(ctm_result) = ctm_map.get(&filename) {
            let indices = ctm_result.file.indices.clone();
            let vertices = ctm_result.vertices().to_vec();
            let normals = ctm_result.normals().map(|x| x.to_vec());
            let mut shared_colors = vec![0; 3 * indices.len()];
            let mut shared_tree_indices = vec![0.; indices.len()];

            for i in 0..mesh_indices.len() {
                let mesh_idx = mesh_indices[i];
                let tree_index = tree_indices[mesh_idx];
                let tri_offset = offsets[i];
                let tri_count = file_triangle_counts[i];
                let (r, g, b) = (
                    colors[mesh_idx][0],
                    colors[mesh_idx][1],
                    colors[mesh_idx][2],
                );

                for tri_idx in tri_offset as usize..(tri_offset + tri_count) as usize {
                    for j in 0..3 {
                        let v_idx = indices[3 * tri_idx + j] as usize;

                        shared_tree_indices[v_idx] = tree_index;

                        shared_colors[3 * v_idx + 0] = r;
                        shared_colors[3 * v_idx + 1] = g;
                        shared_colors[3 * v_idx + 2] = b;
                    }
                }
            }

            let mesh = TriangleMeshResult {
                colors: shared_colors,
                file_id: file_id,
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
    instance_meshes: &InstancedMesh,
    ctm_map: &HashMap<String, CtmResult>,
) -> Result<Vec<InstanceMeshFileResult>, JsValue> {
    let file_ids = &instance_meshes.file_id;
    let triangle_offsets = &instance_meshes.triangle_offset;
    let triangle_counts = &instance_meshes.triangle_count;
    let tree_indices = &instance_meshes.tree_index;
    let instance_matrices = &instance_meshes.instance_matrix().to_vec();
    let colors = &instance_meshes.color;
    let meshes_grouped_by_file = group_meshes_by_number(&file_ids);
    let mut final_instance_meshes = Vec::new();

    for (file_id, mesh_indices) in meshes_grouped_by_file {
        let filename = format!("mesh_{}.ctm", file_id);
        if let Some(ctm_result) = ctm_map.get(&filename) {
            let indices = ctm_result.file.indices.clone();
            let vertices = ctm_result.vertices().to_vec();
            let normals = ctm_result.normals().map(|x| x.to_vec());
            let mut instance_meshes = Vec::new();

            let file_triangle_offsets = mesh_indices
                .iter()
                .map(|i| triangle_offsets[*i] as u64)
                .collect();
            let file_triangle_counts: Vec<f64> =
                mesh_indices.iter().map(|i| triangle_counts[*i]).collect();
            let file_meshes_grouped_by_offsets = group_meshes_by_number(&file_triangle_offsets);

            for (triangle_offset, file_mesh_indices) in file_meshes_grouped_by_offsets {
                // NOTE the triangle counts should be the same for all meshes with the same offset,
                // hence we can look up only file_mesh_indices[0] instead of enumerating here
                let triangle_count = file_triangle_counts[file_mesh_indices[0]];
                let mut instance_matrix_buffer = Vec::with_capacity(16 * file_mesh_indices.len());
                let mut tree_indices_buffer = Vec::with_capacity(file_mesh_indices.len());
                let mut color_buffer = Vec::with_capacity(file_mesh_indices.len());

                for i in 0..file_mesh_indices.len() {
                    let mesh_idx = mesh_indices[file_mesh_indices[i]];
                    let tree_index = tree_indices[mesh_idx];
                    instance_matrix_buffer
                        .extend_from_slice(&instance_matrices[mesh_idx * 16..mesh_idx * 16 + 16]);
                    tree_indices_buffer.push(tree_index);
                    color_buffer.extend_from_slice(&colors[mesh_idx]);
                }
                let mesh = InstanceMeshResult {
                    triangle_count,
                    triangle_offset: triangle_offset,
                    instance_matrices: instance_matrix_buffer,
                    colors: color_buffer,
                    tree_indices: tree_indices_buffer,
                };
                instance_meshes.push(mesh);
            }

            let mesh_file = InstanceMeshFileResult {
                file_id: file_id,
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

fn group_meshes_by_number(file_ids: &Vec<u64>) -> HashMap<u64, Vec<usize>> {
    let mut meshes_grouped_by_file: HashMap<u64, Vec<usize>> = HashMap::new();
    for (i, file_id) in file_ids.iter().enumerate() {
        let old_value = meshes_grouped_by_file.entry(*file_id).or_default();
        old_value.push(i);
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
