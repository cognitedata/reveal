use crate::Vector3;
use crate::renderables::{GeometryCollection, Nut, PrimitiveCollections, ToRenderables};

impl ToRenderables for crate::Nut {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let normal: Vector3 = self.center_axis.into();
        let center_a = self.center() + 0.5 * self.height * normal;
        let center_b = self.center() - 0.5 * self.height * normal;

        collections.nut_collection.push(Nut {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius: self.radius,
            rotation_angle: self.rotation_angle,
        });
    }
}
