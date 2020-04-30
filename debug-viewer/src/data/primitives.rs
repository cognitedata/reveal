use crate::{create_buffer_from, create_vertices, Geometry, Instance, Instances};

pub fn create_primitives(
    device: &wgpu::Device,
    i3df_sector: &i3df::renderables::Sector,
) -> Option<Instances> {
    let (vertex_data, index_data) = create_vertices();
    let vertex_buf = create_buffer_from(&device, &vertex_data, wgpu::BufferUsage::VERTEX);
    let index_buf = create_buffer_from(&device, &index_data, wgpu::BufferUsage::INDEX);

    // TODO update I3DF to use interleaved and repplace the line below with
    let primitive_collections = &i3df_sector.primitive_collections;
    let mut instance_data = Vec::new();
    for box3d in &primitive_collections.box_collection {
        instance_data.push(Instance {
            _matrix: box3d.instance_matrix,
            _color: box3d.color,
        });
    }
    for cone in &primitive_collections.cone_collection {
        let position = 0.5 * (cone.center_a + cone.center_b);
        let translation_matrix = nalgebra::Translation3::<f32>::from(position);
        let rotation = nalgebra::Rotation3::rotation_between(
            &nalgebra::Vector3::<f32>::z_axis(),
            &(cone.center_b - cone.center_a).into(),
        )
        .unwrap_or(nalgebra::Rotation3::new(nalgebra::Vector3::<f32>::new(
            0.0, 0.0, 0.0,
        )));
        let height = (cone.center_a - cone.center_b).magnitude();
        let side = 2.0 * cone.radius_a.max(cone.radius_b);
        let scale_matrix =
            nalgebra::Matrix4::<f32>::new_nonuniform_scaling(&nalgebra::Vector3::<f32>::new(
                side, side, height,
            ));

        let instance_matrix = nalgebra::Matrix4::<f32>::from(translation_matrix)
            * nalgebra::Matrix4::<f32>::from(rotation)
            * scale_matrix;

        instance_data.push(Instance {
            _matrix: instance_matrix,
            _color: cone.color,
        });
    }
    for cylinder in &primitive_collections.general_cylinder_collection {
        let position = 0.5 * (cylinder.center_a + cylinder.center_b);
        let translation_matrix = nalgebra::Translation3::<f32>::from(position);
        let rotation = nalgebra::Rotation3::rotation_between(
            &nalgebra::Vector3::<f32>::z_axis(),
            &(cylinder.center_b - cylinder.center_a).into(),
        )
        .unwrap_or(nalgebra::Rotation3::new(nalgebra::Vector3::<f32>::new(
            0.0, 0.0, 0.0,
        )));
        let height = (cylinder.center_a - cylinder.center_b).magnitude();
        let scale_matrix =
            nalgebra::Matrix4::<f32>::new_nonuniform_scaling(&nalgebra::Vector3::<f32>::new(
                2.0 * cylinder.radius,
                2.0 * cylinder.radius,
                height,
            ));

        let instance_matrix = nalgebra::Matrix4::<f32>::from(translation_matrix)
            * nalgebra::Matrix4::<f32>::from(rotation)
            * scale_matrix;

        instance_data.push(Instance {
            _matrix: instance_matrix,
            _color: cylinder.color,
        });
    }

    // TODO all the other primitives

    println!("Instance count {}", instance_data.len());
    if instance_data.len() == 0 {
        None
    } else {
        let instance_buf = create_buffer_from(&device, &instance_data, wgpu::BufferUsage::VERTEX);

        Some(Instances {
            geometry: Geometry {
                vertex_buf,
                index_buf,
                index_count: index_data.len(),
            },
            instance_buf,
            instance_count: instance_data.len(),
        })
    }
}
