use crate::renderables::{
    PrimitiveCollections, ToRenderables,
};
use crate::{Matrix4, Rotation3, Translation3};

impl ToRenderables for crate::TriangleMesh {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        collections.triangle_mesh_collection.tree_index.push(self.tree_index as f32);
        collections.triangle_mesh_collection.color.push(self.color);
        collections.triangle_mesh_collection.size.push(self.diagonal);
        collections.triangle_mesh_collection.file_id.push(self.file_id);
        collections.triangle_mesh_collection.triangle_count.push(self.triangle_count);
    }
}

impl ToRenderables for crate::InstancedMesh {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let translation_matrix = Translation3::from(self.translation());
        let rotation_matrix =
            Rotation3::from_euler_angles(self.rotation_x, self.rotation_y, self.rotation_z);
        let scale_matrix = Matrix4::new_nonuniform_scaling(&self.scale());

        let instance_matrix =
            Matrix4::from(translation_matrix) * Matrix4::from(rotation_matrix) * scale_matrix;

        collections.instanced_mesh_collection.tree_index.push(self.tree_index as f32);
        collections.instanced_mesh_collection.color.push(self.color);
        collections.instanced_mesh_collection.size.push(self.diagonal);
        collections.instanced_mesh_collection.file_id.push(self.file_id);
        collections.instanced_mesh_collection.triangle_count.push(self.triangle_count as f64);
        collections.instanced_mesh_collection.triangle_offset.push(self.triangle_offset as f64);
        collections.instanced_mesh_collection.translation.push(self.translation());
        collections.instanced_mesh_collection.rotation.push(self.rotation());
        collections.instanced_mesh_collection.scale.push(self.scale());
        collections.instanced_mesh_collection.instance_matrix.push(instance_matrix);
    }
}
