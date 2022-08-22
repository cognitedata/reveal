use crate::renderables::{Box3D, PrimitiveCollections, ToRenderables};
use crate::{Matrix4, Rotation3, Translation3, Vector3};

impl ToRenderables for crate::Box3D {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let translation_matrix = Translation3::from(self.center());
        let first_rotation = Rotation3::from_axis_angle(&Vector3::z_axis(), self.rotation_angle);
        let second_rotation = Rotation3::rotation_between(&Vector3::z_axis(), &self.normal.into())
            .unwrap_or_else(|| {
                Rotation3::from_axis_angle(&Vector3::x_axis(), std::f32::consts::PI)
            });
        let scale_matrix = Matrix4::new_nonuniform_scaling(&self.delta());

        let instance_matrix = Matrix4::from(translation_matrix)
            * Matrix4::from(second_rotation)
            * Matrix4::from(first_rotation)
            * scale_matrix;

        collections.box_collection.push(Box3D {
            tree_index: self.tree_index as f32,
            color: self.color,
            instance_matrix,
        });
    }
}
