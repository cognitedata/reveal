use crate::{Matrix4, Translation3, Vector3};

pub struct GeneralRingInstanceMatrixInfo {
    pub center: Vector3,
    pub normal: Vector3,
    pub local_x_axis: Vector3,
    pub radius_a: f32,
    pub radius_b: f32,
}

// NOTE do not flip the normal, it will mess up the rotation
pub fn create_general_ring_instance_matrix(
    data: &GeneralRingInstanceMatrixInfo
) -> Matrix4 {
    let local_y_axis: Vector3 = data.normal.cross(&data.local_x_axis);

    // TODO verify construction order
    // TODO replace with Rotation3
    let rotation_matrix = Matrix4::new(
        data.local_x_axis.x,
        local_y_axis.x,
        data.normal.x,
        0.0,
        data.local_x_axis.y,
        local_y_axis.y,
        data.normal.y,
        0.0,
        data.local_x_axis.z,
        local_y_axis.z,
        data.normal.z,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
    );

    let translation_matrix = Translation3::from(data.center);
    let scale = Vector3::new(2.0 * data.radius_a, 2.0 * data.radius_b, 1.0);
    let scale_matrix = Matrix4::new_nonuniform_scaling(&scale);

    // TODO remove Matrix4::from if possible
    (Matrix4::from(translation_matrix) * rotation_matrix * scale_matrix)
    //Matrix4::from(translation_matrix).transpose()
    //Matrix4::identity()
}

