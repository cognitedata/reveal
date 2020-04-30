use crate::create_buffer_from;
use std::collections::HashMap;

// TODO rename, please
#[derive(Clone, Copy)]
pub struct InstancedMeshInstance {
    matrix: nalgebra::Matrix4<f32>,
}

pub struct InstancedMesh {
    pub indices: Vec<u32>,
    pub vertices: Vec<openctm::Vertex>,
    pub colors: Vec<[f32; 3]>,
    pub instances: Vec<InstancedMeshInstance>,
}

pub struct LoadedInstancedMesh {
    pub vertex_buf: wgpu::Buffer,
    pub color_buf: wgpu::Buffer,
    pub index_buf: wgpu::Buffer,
    pub index_count: usize,
    pub instance_buf: wgpu::Buffer,
    pub instance_count: usize,
}

pub fn create_instanced_meshes(
    device: &wgpu::Device,
    i3df_sector: &i3df::renderables::Sector,
    ctm_cache: &HashMap<String, crate::CtmData>,
    instanced_meshes: &mut HashMap<String, InstancedMesh>,
) -> Vec<LoadedInstancedMesh> {
    for item in &i3df_sector.primitive_collections.instanced_mesh_collection {
        let triangle_count = item.triangle_count;

        // TODO why is this even possible?
        if triangle_count == 0 {
            continue;
        }

        let file_id = item.file_id;
        let triangle_offset = item.triangle_offset;

        let matrix = item.instance_matrix;

        let reader = match ctm_cache.get(&format!("mesh_{}.ctm", file_id)) {
            Some(x) => x,
            None => continue,
        };

        let key = format!("{}_{}_{}", file_id, triangle_offset, triangle_count);
        let index_offset = (triangle_offset * 3) as u32;
        let index_count = (triangle_count * 3) as u32;
        let instanced_mesh = match instanced_meshes.contains_key(&key) {
            true => instanced_meshes.get_mut(&key).unwrap(),
            false => {
                let indices =
                    &reader.indices[index_offset as usize..(index_offset + index_count) as usize];
                //println!("Indexes {} {}", index_offset, index_count);
                let lowest_index = *indices.iter().min().unwrap() as usize;
                let highest_index = *indices.iter().max().unwrap() as usize;
                let indices = indices
                    .iter()
                    .map(|index| index - lowest_index as u32)
                    .collect();

                ////println!("Instance {} {} {}", key, lowest_index, highest_index);

                let vertices = reader.vertices[lowest_index..highest_index].to_vec();
                let color = [
                    item.color[0] as f32 / 255.0,
                    item.color[1] as f32 / 255.0,
                    item.color[2] as f32 / 255.0,
                ];

                // TODO it is inefficient to have this as an attribute array - rather make one of
                // tree index and look up the color in a buffer
                let colors = vec![color; index_count as usize];
                let instanced_mesh = InstancedMesh {
                    indices,
                    vertices,
                    colors,
                    instances: Vec::new(),
                };
                instanced_meshes.insert(key.clone(), instanced_mesh);
                instanced_meshes.get_mut(&key).unwrap()
            }
        };

        instanced_mesh
            .instances
            .push(InstancedMeshInstance { matrix });
    }

    let mut loaded_instanced_meshes: Vec<LoadedInstancedMesh> = Vec::new();

    for instanced_mesh in instanced_meshes.values() {
        let vertex_data = &instanced_mesh.vertices;
        let index_data = &instanced_mesh.indices;
        let color_data = &instanced_mesh.colors;
        let instance_data = &instanced_mesh.instances;

        let index_buf = create_buffer_from(&device, &index_data, wgpu::BufferUsage::INDEX);
        let vertex_buf = create_buffer_from(&device, &vertex_data, wgpu::BufferUsage::VERTEX);
        let instance_buf = create_buffer_from(&device, &instance_data, wgpu::BufferUsage::VERTEX);
        let color_buf = create_buffer_from(&device, color_data, wgpu::BufferUsage::VERTEX);

        // TODO should be no need for this, we can reference directly into the original
        // buffers
        loaded_instanced_meshes.push(LoadedInstancedMesh {
            vertex_buf,
            color_buf,
            index_buf,
            index_count: index_data.len(),
            instance_buf,
            instance_count: instance_data.len(),
        });
    }

    loaded_instanced_meshes
}
