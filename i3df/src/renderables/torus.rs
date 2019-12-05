use crate::renderables::{
    GeometryCollection, PrimitiveCollections, ToRenderables, TorusSegment, TorusSegmentInfo,
};
use std::f32::consts::PI;

impl ToRenderables for crate::Torus {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        collections
            .torus_segment_collection
            .push(TorusSegment::new(&TorusSegmentInfo {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                center: self.center(),
                normal: self.normal.into(),
                radius: self.radius,
                tube_radius: self.tube_radius,
                rotation_angle: 0.0,
                arc_angle: 2.0 * PI,
            }));
    }
}
impl ToRenderables for crate::ClosedTorusSegment {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        collections
            .torus_segment_collection
            .push(TorusSegment::new(&TorusSegmentInfo {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                center: self.center(),
                normal: self.normal.into(),
                radius: self.radius,
                tube_radius: self.tube_radius,
                rotation_angle: self.rotation_angle,
                arc_angle: self.arc_angle,
            }));

        // TODO add circles in correct positions (also missing from TypeScript parser)
    }
}
impl ToRenderables for crate::OpenTorusSegment {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        collections
            .torus_segment_collection
            .push(TorusSegment::new(&TorusSegmentInfo {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                center: self.center(),
                normal: self.normal.into(),
                radius: self.radius,
                tube_radius: self.tube_radius,
                rotation_angle: self.rotation_angle,
                arc_angle: self.arc_angle,
            }));
    }
}
