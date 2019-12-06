use crate::renderables::{GeometryCollection, Nut, PrimitiveCollections, ToRenderables};
use crate::{Matrix4, Rotation3, Translation3, Vector3};

impl ToRenderables for crate::Nut {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let diameter = 2.0 * self.radius;
        let translation_matrix = Translation3::from(self.center());
        let first_rotation = Rotation3::from_axis_angle(&Vector3::z_axis(), self.rotation_angle);
        let second_rotation =
            Rotation3::rotation_between(&Vector3::z_axis(), &self.center_axis.into()).unwrap();
        let scale_matrix =
            Matrix4::new_nonuniform_scaling(&Vector3::new(diameter, diameter, self.height));

        let instance_matrix = Matrix4::from(translation_matrix)
            * Matrix4::from(second_rotation)
            * Matrix4::from(first_rotation)
            * scale_matrix;

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
            instance_matrix,
        });
    }
}
