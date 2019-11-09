use crate as f3df;
use nalgebra;
use serde_derive::Serialize;
use std::f32::consts::{PI, FRAC_PI_2};

type Vector3 = nalgebra::Vector3::<f32>;
type Matrix4 = nalgebra::Matrix4::<f32>;
type Rotation3 = nalgebra::Rotation3::<f32>;
type Translation3 = nalgebra::Translation3::<f32>;

#[derive(Clone, Copy, Serialize)]
pub struct Face {
    color: [f32; 3],
    normal: Vector3,
    matrix: Matrix4,
}

fn compose_face_matrix(
    center: &Vector3,
    offset: &Vector3,
    scale: &Vector3,
    rotation_matrix: &Rotation3,
) -> Matrix4 {
    let translation_matrix = Translation3::from(*center);
    let offset_matrix = Translation3::from(*offset);
    let scale_matrix = Matrix4::new_nonuniform_scaling(scale);
    // NOTE rotation purposefully happens first to make the face point in the correct direction
    // TODO remove Matrix4::from if possible
    Matrix4::from(translation_matrix) * scale_matrix * Matrix4::from(offset_matrix) * Matrix4::from(*rotation_matrix)
}

pub fn convert_sector(sector: &f3df::Sector) -> Vec<Face> {
    let mut instance_data = Vec::new();
    let contents = match &sector.sector_contents {
        Some(x) => x,
        None => return Vec::new(),
    };
    let origin = contents.grid_origin;
    let cell_size = [
        (contents.grid_size[0] - 1) as u64,
        (contents.grid_size[1] - 1) as u64,
        (contents.grid_size[2] - 1) as u64,
    ];
    let cell_size_i_j = cell_size[0] * cell_size[1];
    let increment = contents.grid_increment;
    let origin = Vector3::new(origin[0], origin[1], origin[2]);
    for node in &contents.nodes {
        let color = node.color;
        let compress_type = node.compress_type;
        for face in &node.faces {
            let cell_index = face.index as u64;
            let cell_index_i_j = cell_index % cell_size_i_j;
            let i = cell_index_i_j % (cell_size[0]);
            let j = cell_index_i_j / (cell_size[0]);
            let k = cell_index / (cell_size_i_j);
            let x = i as f32 + 0.5;
            let y = j as f32 + 0.5;
            let z = k as f32 + 0.5;

            let center = Vector3::new(
                origin[0] + increment * x,
                origin[1] + increment * y,
                origin[2] + increment * z,
            );

            let count = (face.repetitions as u32 + 1) as f32;
            if face
                .face_flags
                .intersects(f3df::FaceFlags::POSITIVE_X_VISIBLE)
            {
                let offset = Vector3::new(1.0, 0.5, 0.5);
                let normal = Vector3::new(1.0, 0.0, 0.0);
                let rotation = Rotation3::from_axis_angle(&Vector3::y_axis(), FRAC_PI_2);
                let scale = if compress_type.intersects(f3df::CompressFlags::POSITIVE_X_REPEAT_Y) {
                    Vector3::new(increment, increment, count * increment)
                } else {
                    Vector3::new(increment, count * increment, increment)
                };
                instance_data.push(Face {
                    color: [
                        color[0] as f32 / 255.0,
                        color[1] as f32 / 255.0,
                        color[2] as f32 / 255.0,
                    ],
                    normal: normal,
                    matrix: compose_face_matrix(&center, &offset, &scale, &rotation),
                });
            }
            if face
                .face_flags
                .intersects(f3df::FaceFlags::POSITIVE_Y_VISIBLE)
            {
                let offset = Vector3::new(0.5, 1.0, 0.5);
                let normal = Vector3::new(0.0, 1.0, 0.0);
                let rotation = Rotation3::from_axis_angle(&Vector3::x_axis(), -FRAC_PI_2);
                let scale = if compress_type.intersects(f3df::CompressFlags::POSITIVE_Y_REPEAT_X) {
                    Vector3::new(increment, increment, count * increment)
                } else {
                    Vector3::new(count * increment, increment, increment)
                };
                instance_data.push(Face {
                    color: [
                        color[0] as f32 / 255.0,
                        color[1] as f32 / 255.0,
                        color[2] as f32 / 255.0,
                    ],
                    normal: normal,
                    matrix: compose_face_matrix(&center, &offset, &scale, &rotation),
                });
            }
            if face
                .face_flags
                .intersects(f3df::FaceFlags::POSITIVE_Z_VISIBLE)
            {
                let offset = Vector3::new(0.5, 0.5, 1.0);
                let normal = Vector3::new(0.0, 0.0, 1.0);
                let rotation = Rotation3::identity();
                let scale = if compress_type.intersects(f3df::CompressFlags::POSITIVE_Z_REPEAT_X) {
                    Vector3::new(increment, count * increment, increment)
                } else {
                    Vector3::new(count * increment, increment, increment)
                };
                instance_data.push(Face {
                    color: [
                        color[0] as f32 / 255.0,
                        color[1] as f32 / 255.0,
                        color[2] as f32 / 255.0,
                    ],
                    normal: normal,
                    matrix: compose_face_matrix(&center, &offset, &scale, &rotation),
                });
            }
            if face
                .face_flags
                .intersects(f3df::FaceFlags::NEGATIVE_X_VISIBLE)
            {
                let offset = Vector3::new(0.0, 0.5, 0.5);
                let normal = Vector3::new(-1.0, 0.0, 0.0);
                let rotation = Rotation3::from_axis_angle(&Vector3::y_axis(), -FRAC_PI_2);
                let scale = if compress_type.intersects(f3df::CompressFlags::NEGATIVE_X_REPEAT_Y) {
                    Vector3::new(increment, increment, count * increment)
                } else {
                    Vector3::new(increment, count * increment, increment)
                };
                instance_data.push(Face {
                    color: [
                        color[0] as f32 / 255.0,
                        color[1] as f32 / 255.0,
                        color[2] as f32 / 255.0,
                    ],
                    normal: normal,
                    matrix: compose_face_matrix(&center, &offset, &scale, &rotation),
                });
            }
            if face
                .face_flags
                .intersects(f3df::FaceFlags::NEGATIVE_Y_VISIBLE)
            {
                let offset = Vector3::new(0.5, 0.0, 0.5);
                let normal = Vector3::new(0.0, -1.0, 0.0);
                let rotation = Rotation3::from_axis_angle(&Vector3::x_axis(), FRAC_PI_2);
                let scale = if compress_type.intersects(f3df::CompressFlags::NEGATIVE_Y_REPEAT_X) {
                    Vector3::new(increment, increment, count * increment)
                } else {
                    Vector3::new(increment * count, increment, increment)
                };
                instance_data.push(Face {
                    color: [
                        color[0] as f32 / 255.0,
                        color[1] as f32 / 255.0,
                        color[2] as f32 / 255.0,
                    ],
                    normal: normal,
                    matrix: compose_face_matrix(&center, &offset, &scale, &rotation),
                });
            }
            if face
                .face_flags
                .intersects(f3df::FaceFlags::NEGATIVE_Z_VISIBLE)
            {
                let offset = Vector3::new(0.5, 0.5, 0.0);
                let normal = Vector3::new(0.0, 0.0, -1.0);
                let rotation = Rotation3::from_axis_angle(&Vector3::x_axis(), -PI);
                let scale = if compress_type.intersects(f3df::CompressFlags::NEGATIVE_Z_REPEAT_X) {
                    Vector3::new(increment, count * increment, increment)
                } else {
                    Vector3::new(increment * count, increment, increment)
                };
                instance_data.push(Face {
                    color: [
                        color[0] as f32 / 255.0,
                        color[1] as f32 / 255.0,
                        color[2] as f32 / 255.0,
                    ],
                    normal: normal,
                    matrix: compose_face_matrix(&center, &offset, &scale, &rotation),
                });
            }
        }
    }

    instance_data
}
