use crate::renderables::{Box3D, GeometryCollection, PrimitiveCollections, ToRenderables};

impl ToRenderables for crate::Box3D {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        collections.box_collection.push(Box3D {
            node_id: self.node_id + 1,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: self.center(),
            normal: self.normal.into(),
            rotation_angle: self.rotation_angle,
            delta: self.delta(),
        });

    }
}

