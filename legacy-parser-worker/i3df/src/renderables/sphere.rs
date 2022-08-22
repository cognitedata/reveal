use crate::renderables::{
    Circle, CircleInfo, PrimitiveCollections, SphericalSegment, ToRenderables,
};
use crate::Vector3;

impl ToRenderables for crate::OpenSphericalSegment {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        collections
            .spherical_segment_collection
            .push(SphericalSegment {
                tree_index: self.tree_index as f32,
                color: self.color,
                center: self.center(),
                normal: self.normal.into(),
                radius: self.radius,
                height: self.height,
            });
    }
}

impl ToRenderables for crate::Sphere {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        collections
            .spherical_segment_collection
            .push(SphericalSegment {
                tree_index: self.tree_index as f32,
                color: self.color,
                center: self.center(),
                normal: Vector3::z_axis().into_inner(),
                radius: self.radius,
                height: 2.0 * self.radius,
            });
    }
}

impl ToRenderables for crate::ClosedSphericalSegment {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        collections
            .spherical_segment_collection
            .push(SphericalSegment {
                tree_index: self.tree_index as f32,
                color: self.color,
                center: self.center(),
                normal: self.normal.into(),
                radius: self.radius,
                height: self.height,
            });

        let length = self.radius - self.height;
        let circle_radius = f32::sqrt(self.radius.powi(2) - length.powi(2));
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
