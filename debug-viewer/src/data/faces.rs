use crate::{create_buffer_from, create_face_vertices, Geometry, Instances};

pub fn create_faces(
    device: &wgpu::Device,
    f3df_sector: &f3df::renderables::Sector,
) -> Option<Instances> {
    let instance_data = &f3df_sector.faces;
    println!("Got {} faces", instance_data.len());
    if instance_data.len() == 0 {
        return None;
    }
    let instance_buf = create_buffer_from(&device, &instance_data, wgpu::BufferUsage::VERTEX);

    let geometry = {
        let (vertex_data, index_data) = create_face_vertices();
        let vertex_buf = create_buffer_from(&device, &vertex_data, wgpu::BufferUsage::VERTEX);
        let index_buf = create_buffer_from(&device, &index_data, wgpu::BufferUsage::INDEX);
        Geometry {
            index_count: index_data.len(),
            vertex_buf,
            index_buf,
        }
    };

    Some(Instances {
        geometry,
        instance_buf,
        instance_count: instance_data.len(),
    })
}
