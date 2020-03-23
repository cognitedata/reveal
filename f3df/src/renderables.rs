use nalgebra;
use serde_derive::Serialize;
use std::collections::HashMap;
use std::f32::consts::{FRAC_PI_2, PI};
use std::u8;

type Vector3 = nalgebra::Vector3<f32>;
type Matrix4 = nalgebra::Matrix4<f32>;
type Rotation3 = nalgebra::Rotation3<f32>;
type Translation3 = nalgebra::Translation3<f32>;

#[derive(Clone, Copy, Serialize)]
pub struct Face {
    color: [f32; 3],
    // Note! Only integral part of f32 used.
    tree_index: f32,
    normal: Vector3,
    matrix: Matrix4,
}

fn normalize_color(color: [u8; 3]) -> [f32; 3] {
    [
        f32::from(color[0]) / f32::from(std::u8::MAX),
        f32::from(color[1]) / f32::from(std::u8::MAX),
        f32::from(color[2]) / f32::from(std::u8::MAX),
    ]
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
    Matrix4::from(translation_matrix)
        * scale_matrix
        * Matrix4::from(offset_matrix)
        * Matrix4::from(*rotation_matrix)
}

pub struct Sector {
    pub faces: Vec<Face>,
    pub node_id_to_tree_index_map: HashMap<u64, u64>,
    pub tree_index_to_node_id_map: HashMap<u64, u64>,
}

pub fn convert_sector(sector: &crate::Sector) -> Sector {
    let mut faces = Vec::<Face>::new();
    let mut node_id_to_tree_index_map = HashMap::<u64, u64>::new();
    let mut tree_index_to_node_id_map = HashMap::<u64, u64>::new();
    let contents = match &sector.sector_contents {
        Some(x) => x,
        None => {
            return Sector {
                faces,
                node_id_to_tree_index_map,
                tree_index_to_node_id_map,
            }
        }
    };
    let origin = contents.grid_origin;
    let cell_size = [
        u64::from(contents.grid_size[0] - 1),
        u64::from(contents.grid_size[1] - 1),
        u64::from(contents.grid_size[2] - 1),
    ];
    let cell_size_i_j = cell_size[0] * cell_size[1];
    let increment = contents.grid_increment;
    let origin = Vector3::new(origin[0], origin[1], origin[2]);
    for node in &contents.nodes {
        let compress_type = node.compress_type;
        let tree_index = node.tree_index;
        let node_id = node.node_id;
        node_id_to_tree_index_map.insert(node_id, tree_index);
        tree_index_to_node_id_map.insert(tree_index, node_id);

        for face in &node.faces {
            let cell_index = face.index as u64;
            let cell_index_i_j = cell_index % cell_size_i_j;
            let i = cell_index_i_j % (cell_size[0]);
            let j = cell_index_i_j / (cell_size[0]);
            let k = cell_index / (cell_size_i_j);
            let x = i as f32 + 0.5;
            let y = j as f32 + 0.5;
            let z = k as f32 + 0.5;
            let color = match node.color {
                Some(x) => x,
                None => match face.color {
                    Some(y) => y,
                    None => [255, 0, 255],
                },
            };

            let center = Vector3::new(
                origin[0] + increment * x,
                origin[1] + increment * y,
                origin[2] + increment * z,
            );

            let count = (u32::from(face.repetitions) + 1) as f32;
            if face
                .face_flags
                .intersects(crate::FaceFlags::POSITIVE_X_VISIBLE)
            {
                let offset = Vector3::new(1.0, 0.5, 0.5);
                let normal = Vector3::new(1.0, 0.0, 0.0);
                let rotation = Rotation3::from_axis_angle(&Vector3::y_axis(), FRAC_PI_2);
                let scale = if compress_type.intersects(crate::CompressFlags::POSITIVE_X_REPEAT_Z) {
                    Vector3::new(increment, increment, count * increment)
                } else {
                    Vector3::new(increment, count * increment, increment)
                };
                faces.push(Face {
                    color: normalize_color(color),
                    tree_index: tree_index as f32,
                    normal,
                    matrix: compose_face_matrix(&center, &offset, &scale, &rotation),
                });
            }
            if face
                .face_flags
                .intersects(crate::FaceFlags::POSITIVE_Y_VISIBLE)
            {
                let offset = Vector3::new(0.5, 1.0, 0.5);
                let normal = Vector3::new(0.0, 1.0, 0.0);
                let rotation = Rotation3::from_axis_angle(&Vector3::x_axis(), -FRAC_PI_2);
                let scale = if compress_type.intersects(crate::CompressFlags::POSITIVE_Y_REPEAT_Z) {
                    Vector3::new(increment, increment, count * increment)
                } else {
                    Vector3::new(count * increment, increment, increment)
                };
                faces.push(Face {
                    color: normalize_color(color),
                    tree_index: tree_index as f32,
                    normal,
                    matrix: compose_face_matrix(&center, &offset, &scale, &rotation),
                });
            }
            if face
                .face_flags
                .intersects(crate::FaceFlags::POSITIVE_Z_VISIBLE)
            {
                let offset = Vector3::new(0.5, 0.5, 1.0);
                let normal = Vector3::new(0.0, 0.0, 1.0);
                let rotation = Rotation3::identity();
                let scale = if compress_type.intersects(crate::CompressFlags::POSITIVE_Z_REPEAT_Y) {
                    Vector3::new(increment, count * increment, increment)
                } else {
                    Vector3::new(count * increment, increment, increment)
                };
                faces.push(Face {
                    color: normalize_color(color),
                    tree_index: tree_index as f32,
                    normal,
                    matrix: compose_face_matrix(&center, &offset, &scale, &rotation),
                });
            }
            if face
                .face_flags
                .intersects(crate::FaceFlags::NEGATIVE_X_VISIBLE)
            {
                let offset = Vector3::new(0.0, 0.5, 0.5);
                let normal = Vector3::new(-1.0, 0.0, 0.0);
                let rotation = Rotation3::from_axis_angle(&Vector3::y_axis(), -FRAC_PI_2);
                let scale = if compress_type.intersects(crate::CompressFlags::NEGATIVE_X_REPEAT_Z) {
                    Vector3::new(increment, increment, count * increment)
                } else {
                    Vector3::new(increment, count * increment, increment)
                };
                faces.push(Face {
                    color: normalize_color(color),
                    tree_index: tree_index as f32,
                    normal,
                    matrix: compose_face_matrix(&center, &offset, &scale, &rotation),
                });
            }
            if face
                .face_flags
                .intersects(crate::FaceFlags::NEGATIVE_Y_VISIBLE)
            {
                let offset = Vector3::new(0.5, 0.0, 0.5);
                let normal = Vector3::new(0.0, -1.0, 0.0);
                let rotation = Rotation3::from_axis_angle(&Vector3::x_axis(), FRAC_PI_2);
                let scale = if compress_type.intersects(crate::CompressFlags::NEGATIVE_Y_REPEAT_Z) {
                    Vector3::new(increment, increment, count * increment)
                } else {
                    Vector3::new(increment * count, increment, increment)
                };
                faces.push(Face {
                    color: normalize_color(color),
                    tree_index: tree_index as f32,
                    normal,
                    matrix: compose_face_matrix(&center, &offset, &scale, &rotation),
                });
            }
            if face
                .face_flags
                .intersects(crate::FaceFlags::NEGATIVE_Z_VISIBLE)
            {
                let offset = Vector3::new(0.5, 0.5, 0.0);
                let normal = Vector3::new(0.0, 0.0, -1.0);
                let rotation = Rotation3::from_axis_angle(&Vector3::x_axis(), -PI);
                let scale = if compress_type.intersects(crate::CompressFlags::NEGATIVE_Z_REPEAT_Y) {
                    Vector3::new(increment, count * increment, increment)
                } else {
                    Vector3::new(increment * count, increment, increment)
                };
                faces.push(Face {
                    color: normalize_color(color),
                    tree_index: tree_index as f32,
                    normal,
                    matrix: compose_face_matrix(&center, &offset, &scale, &rotation),
                });
            }
        }
    }

    Sector {
        faces,
        node_id_to_tree_index_map,
        tree_index_to_node_id_map,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use approx::assert_abs_diff_eq;

    #[test]
    fn test_normalize_color() {
        {
            let result = normalize_color([128, 129, 130]);
            assert_abs_diff_eq!(result[0], 0.501_960_8); // 128/255
            assert_abs_diff_eq!(result[1], 0.505_882_4); // 129/255
            assert_abs_diff_eq!(result[2], 0.509_803_95); // 130/255
        }

        {
            let result = normalize_color([0, 128, 255]);
            assert_abs_diff_eq!(result[0], 0.0);
            assert_abs_diff_eq!(result[1], 0.501_960_8); // 128/255
            assert_abs_diff_eq!(result[2], 1.0);
        }
    }

    #[test]
    fn test_convert_sector() {
        let sector = crate::Sector {
            sector_contents: Some(crate::SectorContents {
                grid_increment: 3.0,
                grid_size: [11, 15, 17],
                grid_origin: [0.1, 0.2, 0.3],
                nodes: vec![crate::Node {
                    node_id: 0,
                    tree_index: 42,
                    color: Some([128, 129, 130]),
                    compress_type: crate::CompressFlags::POSITIVE_Y_REPEAT_Z,
                    faces: vec![crate::Face {
                        face_flags: crate::FaceFlags::POSITIVE_Y_VISIBLE,
                        index: 100,
                        repetitions: 4,
                        color: None,
                    }],
                }],
            }),
            // The following is not used and only necessary to create a valid sector
            bbox_min: [-2.0, -2.0, 3.0],
            bbox_max: [-1.0, 3.0, 6.0],
            format_version: 0,
            magic_bytes: 0x0000_1111,
            optimizer_version: 0,
            parent_sector_id: None,
            sector_id: 0,
        };
        let result = convert_sector(&sector);

        assert_abs_diff_eq!(result.faces[0].tree_index, 42.0, epsilon = 0.0);
        assert_abs_diff_eq!(result.faces[0].color[0], 0.501_960_8); // 128/255
        assert_abs_diff_eq!(result.faces[0].color[1], 0.505_882_4); // 129/255
        assert_abs_diff_eq!(result.faces[0].color[2], 0.509_803_95); // 130/255

        #[rustfmt::skip]
        let matrix = Matrix4::from_column_slice(&[
            3.0, 0.0, 0.0, 0.0,
            0.0, 0.0, -15.0, 0.0,
            0.0, 3.0, 0.0, 0.0,
            3.1, 34.7, 9.3, 1.0
        ]);
        assert_abs_diff_eq!(result.faces[0].matrix, matrix, epsilon = 0.00001);

        assert_abs_diff_eq!(result.faces[0].normal, Vector3::new(0.0, 1.0, 0.0));
    }
}
