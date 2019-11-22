use crate::renderables::{
    InstancedMesh, GeometryCollection, PrimitiveCollections,
    ToRenderables, TriangleMesh,
};

impl ToRenderables for crate::TriangleMesh {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        collections.triangle_mesh_collection.push(TriangleMesh {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            file_id: self.file_id,
            //diffuse_texture: self.diffuse_texture,
            //specular_texture: self.specular_texture,
            //ambient_texture: self.ambient_texture,
            //normal_texture: self.normal_texture,
            //bump_texture: self.bump_texture,
            triangle_count: self.triangle_count,
            //triangle_offset: self.triangle_offset,
        });

    }
}

impl ToRenderables for crate::InstancedMesh {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        collections.instanced_mesh_collection.push(InstancedMesh {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            file_id: self.file_id,
            //diffuse_texture: self.diffuse_texture,
            //specular_texture: self.specular_texture,
            //ambient_texture: self.ambient_texture,
            //normal_texture: self.normal_texture,
            //bump_texture: self.bump_texture,
            triangle_count: self.triangle_count,
            triangle_offset: self.triangle_offset,
            translation: self.translation(),
            rotation: self.rotation(),
            scale: self.scale(),
        });

    }
}

