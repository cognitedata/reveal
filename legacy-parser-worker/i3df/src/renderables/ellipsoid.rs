use crate::renderables::{
    Circle, CircleInfo, EllipsoidSegment, PrimitiveCollections, ToRenderables,
};
use crate::Vector3;

impl ToRenderables for crate::ClosedEllipsoidSegment {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        collections
            .ellipsoid_segment_collection
            .push(EllipsoidSegment {
                tree_index: self.tree_index as f32,
                color: self.color,
                center: self.center(),
                normal: self.normal.into(),
                horizontal_radius: self.horizontal_radius,
                vertical_radius: self.vertical_radius,
                height: self.height,
            });

        let length = self.vertical_radius - self.height;
        let circle_radius = f32::sqrt(self.vertical_radius.powi(2) - length.powi(2))
            * self.horizontal_radius
            / self.vertical_radius;
        let center = self.center() + length * Vector3::from(self.normal).normalize();

        collections.circle_collection.push(Circle::new(&CircleInfo {
            tree_index: self.tree_index as f32,
            color: self.color,
            center,
            normal: self.normal.into(),
            radius: circle_radius,
        }));
    }
}
impl ToRenderables for crate::Ellipsoid {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        collections
            .ellipsoid_segment_collection
            .push(EllipsoidSegment {
                tree_index: self.tree_index as f32,
                color: self.color,
                center: self.center(),
                normal: self.normal.into(),
                horizontal_radius: self.horizontal_radius,
                vertical_radius: self.vertical_radius,
                height: self.vertical_radius * 2.0,
            });
    }
}
impl ToRenderables for crate::OpenEllipsoidSegment {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        collections
            .ellipsoid_segment_collection
            .push(EllipsoidSegment {
                tree_index: self.tree_index as f32,
                color: self.color,
                center: self.center(),
                normal: self.normal.into(),
                horizontal_radius: self.horizontal_radius,
                vertical_radius: self.vertical_radius,
                height: self.height,
            });
    }
}
