use crate::renderables::common::{
    create_general_ring_instance_matrix, GeneralRingInstanceMatrixInfo,
};
use crate::renderables::{
    Cone, GeneralRing, GeometryCollection, PrimitiveCollections, Quad, QuadInfo, ToRenderables,
};
use crate::{Rotation3, Vector3};
use std::f64::consts::PI;

impl ToRenderables for crate::ClosedExtrudedRingSegment {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let rotation = Rotation3::rotation_between(&z_axis, &center_axis).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);

        let thickness = (self.outer_radius - self.inner_radius) / self.outer_radius;

        let instance_matrix_a = create_general_ring_instance_matrix(&GeneralRingInstanceMatrixInfo {
            center: center_a,
            normal: center_axis,
            local_x_axis,
            radius_a: self.outer_radius,
            radius_b: self.outer_radius,
        });

        let instance_matrix_b = create_general_ring_instance_matrix(&GeneralRingInstanceMatrixInfo {
            center: center_b,
            normal: center_axis,
            local_x_axis,
            radius_a: self.outer_radius,
            radius_b: self.outer_radius,
        });

        // rings
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a,
            normal: center_axis,
            local_x_axis,
            radius_x: self.outer_radius,
            radius_y: self.outer_radius,
            thickness,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            instance_matrix: instance_matrix_a,
        });
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_b,
            normal: -center_axis,
            local_x_axis,
            radius_x: self.outer_radius,
            radius_y: self.outer_radius,
            thickness,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            instance_matrix: instance_matrix_b,
        });

        // outer cone
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.outer_radius,
            radius_b: self.outer_radius,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis,
        });

        // inner cone
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.inner_radius,
            radius_b: self.inner_radius,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis,
        });

        {
            let c = f32::cos(self.rotation_angle);
            let s = f32::sin(self.rotation_angle);
            let vertex = Vector3::new(c, s, 0.0);
            let vertex_0 = rotation.transform_vector(&vertex);
            let vertex_1 = vertex_0 * self.inner_radius + center_b;
            let vertex_2 = vertex_0 * self.outer_radius + center_a;
            let vertex_3 = vertex_0 * self.outer_radius + center_b;
            collections.quad_collection.push(Quad::new(&QuadInfo {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                vertex_1,
                vertex_2,
                vertex_3,
            }));
        }
        {
            let c = f32::cos(self.rotation_angle + self.arc_angle);
            let s = f32::sin(self.rotation_angle + self.arc_angle);
            let vertex = Vector3::new(c, s, 0.0);
            let vertex_0 = rotation.transform_vector(&vertex);
            let vertex_1 = vertex_0 * self.outer_radius + center_a;
            let vertex_2 = vertex_0 * self.inner_radius + center_b;
            let vertex_3 = vertex_0 * self.outer_radius + center_b;
            collections.quad_collection.push(Quad::new(&QuadInfo {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                vertex_1,
                vertex_2,
                vertex_3,
            }));
        }
    }
}

impl ToRenderables for crate::ExtrudedRing {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        // TODO duplicate of OpenExtrudedRing

        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let rotation = Rotation3::rotation_between(&z_axis, &center_axis).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);

        let thickness = (self.outer_radius - self.inner_radius) / self.outer_radius;

        let rotation_angle = 0.0;
        let arc_angle = 2.0 * PI as f32;

        let instance_matrix_a = create_general_ring_instance_matrix(&GeneralRingInstanceMatrixInfo {
            center: center_a,
            normal: center_axis,
            local_x_axis,
            radius_a: self.outer_radius,
            radius_b: self.outer_radius,
        });

        let instance_matrix_b = create_general_ring_instance_matrix(&GeneralRingInstanceMatrixInfo {
            center: center_b,
            normal: center_axis,
            local_x_axis,
            radius_a: self.outer_radius,
            radius_b: self.outer_radius,
        });

        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a,
            normal: center_axis,
            local_x_axis,
            radius_x: self.outer_radius,
            radius_y: self.outer_radius,
            thickness,
            angle: rotation_angle,
            arc_angle,
            instance_matrix: instance_matrix_a,
        });
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_b,
            normal: -center_axis,
            local_x_axis,
            radius_x: self.outer_radius,
            radius_y: self.outer_radius,
            thickness,
            angle: rotation_angle,
            arc_angle,
            instance_matrix: instance_matrix_b,
        });
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.outer_radius,
            radius_b: self.outer_radius,
            angle: rotation_angle,
            arc_angle,
            local_x_axis,
        });
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.inner_radius,
            radius_b: self.inner_radius,
            angle: rotation_angle,
            arc_angle,
            local_x_axis,
        });
    }
}

impl ToRenderables for crate::OpenExtrudedRingSegment {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let rotation = Rotation3::rotation_between(&z_axis, &center_axis).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);

        let thickness = (self.outer_radius - self.inner_radius) / self.outer_radius;

        let instance_matrix_a = create_general_ring_instance_matrix(&GeneralRingInstanceMatrixInfo {
            center: center_a,
            normal: center_axis,
            local_x_axis,
            radius_a: self.outer_radius,
            radius_b: self.outer_radius,
        });

        let instance_matrix_b = create_general_ring_instance_matrix(&GeneralRingInstanceMatrixInfo {
            center: center_b,
            normal: center_axis,
            local_x_axis,
            radius_a: self.outer_radius,
            radius_b: self.outer_radius,
        });

        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a,
            normal: center_axis,
            local_x_axis,
            radius_x: self.outer_radius,
            radius_y: self.outer_radius,
            thickness,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            instance_matrix: instance_matrix_a,
        });
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_b,
            normal: -center_axis,
            local_x_axis,
            radius_x: self.outer_radius,
            radius_y: self.outer_radius,
            thickness,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            instance_matrix: instance_matrix_b,
        });
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.outer_radius,
            radius_b: self.outer_radius,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis,
        });
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.inner_radius,
            radius_b: self.inner_radius,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis,
        });
    }
}
impl ToRenderables for crate::Ring {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let center: Vector3 = self.center();
        let normal: Vector3 = self.normal.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let thickness = (self.outer_radius - self.inner_radius) / self.outer_radius;
        let angle = 0.0;
        let arc_angle = 2.0 * PI as f32;
        let rotation = Rotation3::rotation_between(&z_axis, &normal).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);

        let instance_matrix = create_general_ring_instance_matrix(&GeneralRingInstanceMatrixInfo {
            center,
            normal,
            local_x_axis,
            radius_a: self.outer_radius,
            radius_b: self.outer_radius,
        });

        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center,
            normal: self.normal.into(),
            local_x_axis: x_axis,
            radius_x: self.outer_radius,
            radius_y: self.outer_radius,
            thickness,
            angle,
            arc_angle,
            instance_matrix,
        });
    }
}
