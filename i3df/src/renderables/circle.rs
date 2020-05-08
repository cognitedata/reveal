use crate::renderables::{Circle, CircleInfo, PrimitiveCollections, ToRenderables};

impl ToRenderables for crate::Circle {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        collections.circle_collection.push(Circle::new(&CircleInfo {
            tree_index: self.tree_index as f32,
            color: self.color,
            size: self.diagonal,
            center: self.center(),
            normal: self.normal.into(),
            radius: self.radius,
        }));
    }
}
