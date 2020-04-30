use crate::create_buffer_from;
use std::collections::HashMap;

pub struct Mesh {
    pub file_id: u64,
    pub index_range: core::ops::Range<u32>,
}

pub struct Meshes {
    pub meshes: Vec<Mesh>,
    pub triangle_mesh_colors: HashMap<u64, Vec<[f32; 3]>>,
    pub triangle_mesh_offsets: HashMap<u64, u64>,
    pub triangle_mesh_color_bufs: HashMap<u64, wgpu::Buffer>,
}

pub fn create_meshes(device: &wgpu::Device, i3df_sector: &i3df::renderables::Sector) -> Meshes {
    let mut meshes = Vec::new();
    let mut triangle_mesh_colors = HashMap::<u64, Vec<[f32; 3]>>::new();
    let mut triangle_mesh_offsets = HashMap::<u64, u64>::new();
    for item in &i3df_sector.primitive_collections.triangle_mesh_collection {
        let file_id = item.file_id;

        let triangle_count = item.triangle_count;
        let triangle_offset = triangle_mesh_offsets.entry(file_id).or_default();
        let index_offset = (*triangle_offset * 3) as u32;
        let index_count = (triangle_count * 3) as u32;
        let index_range = index_offset..(index_offset + index_count);

        let color = [
            item.color[0] as f32 / 255.0,
            item.color[1] as f32 / 255.0,
            item.color[2] as f32 / 255.0,
        ];

        let mut colors = vec![color; index_count as usize];
        let colors_for_file = triangle_mesh_colors.entry(file_id).or_default();
        colors_for_file.append(&mut colors);

        *triangle_offset += triangle_count;

        meshes.push(Mesh {
            file_id,
            index_range,
        });
    }

    let triangle_mesh_color_bufs: HashMap<u64, wgpu::Buffer> = triangle_mesh_colors
        .iter()
        .map(|(file_id, colors)| {
            let color_buf = create_buffer_from(&device, colors, wgpu::BufferUsage::VERTEX);
            (*file_id, color_buf)
        })
        .collect();

    Meshes {
        meshes,
        triangle_mesh_colors,
        triangle_mesh_offsets,
        triangle_mesh_color_bufs,
    }
}
