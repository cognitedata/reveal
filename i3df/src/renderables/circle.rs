use crate::renderables::{Circle, CircleInfo, GeometryCollection, PrimitiveCollections, ToRenderables};

impl ToRenderables for crate::Circle {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        collections.circle_collection.push(Circle::new(&CircleInfo {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: self.center(),
            normal: self.normal.into(),
            radius: self.radius,
        }));

    }
}

