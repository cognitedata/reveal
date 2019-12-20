use crate::renderables::common::{
    create_general_ring_instance_matrix, GeneralRingInstanceMatrixInfo,
};
use crate::renderables::{
    Circle, CircleInfo, Cone, EccentricCone, GeneralRing, GeometryCollection, PrimitiveCollections,
    ToRenderables, Trapezium,
};
use crate::{Matrix, Rotation3, Vector3};
use std::f64::consts::PI;

impl ToRenderables for crate::ClosedCone {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let normal = (center_a - center_b).normalize();
        let rotation = Rotation3::rotation_between(&z_axis, &normal).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.radius_a,
            radius_b: self.radius_b,
            angle: 0.0,
            arc_angle: 2.0 * PI as f32,
            local_x_axis,
        });
        collections.circle_collection.push(Circle::new(&CircleInfo {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a,
            normal: center_axis,
            radius: self.radius_a,
        }));
        collections.circle_collection.push(Circle::new(&CircleInfo {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_b,
            // TODO should this be negative, it is not in the JS version
            normal: -1.0 * center_axis,
            radius: self.radius_b,
        }));
    }
}

impl ToRenderables for crate::ClosedEccentricCone {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let center_axis: Vector3 = self.center_axis.into();
        let center: Vector3 = self.center();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;

        let mut normal: Vector3 = self.cap_normal.into();
        let dot_product = Matrix::dot(&normal, &(center_a - center_b));
        if dot_product < 0.0 {
            normal = -normal;
        }

        collections.eccentric_cone_collection.push(EccentricCone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.radius_a,
            radius_b: self.radius_b,
            normal,
        });
        collections.circle_collection.push(Circle::new(&CircleInfo {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a,
            normal,
            radius: self.radius_a,
        }));
        collections.circle_collection.push(Circle::new(&CircleInfo {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_b,
            // TODO should this be negative?
            normal,
            radius: self.radius_b,
        }));
    }
}

impl ToRenderables for crate::OpenCone {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let normal = (center_a - center_b).normalize();
        let rotation = Rotation3::rotation_between(&z_axis, &normal).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.radius_a,
            radius_b: self.radius_b,
            angle: 0.0,
            arc_angle: 2.0 * PI as f32,
            local_x_axis,
        });
    }
}

impl ToRenderables for crate::OpenEccentricCone {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let center_axis: Vector3 = self.center_axis.into();
        let center: Vector3 = self.center();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;

        let mut normal: Vector3 = self.cap_normal.into();
        let dot_product = Matrix::dot(&normal, &(center_a - center_b));
        if dot_product < 0.0 {
            normal = -normal;
        }

        collections.eccentric_cone_collection.push(EccentricCone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.radius_a,
            radius_b: self.radius_b,
            normal,
        });
    }
}

impl ToRenderables for crate::OpenGeneralCone {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let normal = (center_a - center_b).normalize();
        let rotation = Rotation3::rotation_between(&z_axis, &normal).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);
        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.radius_a,
            radius_b: self.radius_b,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis,
        });
    }
}

// TODO why ar enot slope and z_angle used for general cones?
//
impl ToRenderables for crate::ClosedGeneralCone {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let normal = (center_a - center_b).normalize();
        let rotation = Rotation3::rotation_between(&z_axis, &normal).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);

        let instance_matrix_a =
            create_general_ring_instance_matrix(&GeneralRingInstanceMatrixInfo {
                center: center_a,
                normal: center_axis,
                local_x_axis,
                radius_a: self.radius_a,
                radius_b: self.radius_a,
            });
        let instance_matrix_b =
            create_general_ring_instance_matrix(&GeneralRingInstanceMatrixInfo {
                center: center_b,
                normal: center_axis,
                local_x_axis,
                radius_a: self.radius_b,
                radius_b: self.radius_b,
            });

        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.radius_a,
            radius_b: self.radius_b,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis,
        });
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a,
            normal: center_axis,
            local_x_axis,
            radius_x: self.radius_a,
            radius_y: self.radius_a,
            // TODO is thickness in JS, but no thickness property exists on ClosedGeneralCone
            thickness: 1.0,
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
            radius_x: self.radius_b,
            radius_y: self.radius_b,
            thickness: 1.0,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            instance_matrix: instance_matrix_b,
        });
    }
}

impl ToRenderables for crate::SolidOpenGeneralCone {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let normal = (center_a - center_b).normalize();
        let rotation = Rotation3::rotation_between(&z_axis, &normal).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);

        let instance_matrix_a =
            create_general_ring_instance_matrix(&GeneralRingInstanceMatrixInfo {
                center: center_a,
                normal: center_axis,
                local_x_axis,
                radius_a: self.radius_a,
                radius_b: self.radius_a,
            });

        let instance_matrix_b =
            create_general_ring_instance_matrix(&GeneralRingInstanceMatrixInfo {
                center: center_b,
                normal: center_axis,
                local_x_axis,
                radius_a: self.radius_b,
                radius_b: self.radius_b,
            });

        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.radius_a,
            radius_b: self.radius_b,
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
            radius_a: self.radius_a - self.thickness,
            radius_b: self.radius_b - self.thickness,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis,
        });
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a,
            normal: center_axis,
            local_x_axis,
            radius_x: self.radius_a,
            radius_y: self.radius_a,
            thickness: self.thickness / self.radius_a,
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
            radius_x: self.radius_b,
            radius_y: self.radius_b,
            thickness: self.thickness / self.radius_b,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            instance_matrix: instance_matrix_b,
        });
    }
}

impl ToRenderables for crate::SolidClosedGeneralCone {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let center_axis: Vector3 = self.center_axis.into();
        let x_axis = Vector3::new(1.0, 0.0, 0.0);
        let z_axis = Vector3::new(0.0, 0.0, 1.0);
        let center: Vector3 = self.center();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let normal = (center_a - center_b).normalize();
        let rotation = Rotation3::rotation_between(&z_axis, &normal).unwrap();
        let local_x_axis: Vector3 = rotation.transform_vector(&x_axis);

        let instance_matrix_a =
            create_general_ring_instance_matrix(&GeneralRingInstanceMatrixInfo {
                center: center_a,
                normal: center_axis,
                local_x_axis,
                radius_a: self.radius_a,
                radius_b: self.radius_a,
            });

        let instance_matrix_b =
            create_general_ring_instance_matrix(&GeneralRingInstanceMatrixInfo {
                center: center_b,
                normal: center_axis,
                local_x_axis,
                radius_a: self.radius_b,
                radius_b: self.radius_b,
            });

        collections.cone_collection.push(Cone {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center_a,
            center_b,
            radius_a: self.radius_a,
            radius_b: self.radius_b,
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
            radius_a: self.radius_a - self.thickness,
            radius_b: self.radius_b - self.thickness,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            local_x_axis,
        });
        collections.general_ring_collection.push(GeneralRing {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            size: self.diagonal,
            center: center_a,
            normal: center_axis,
            local_x_axis,
            radius_x: self.radius_a,
            radius_y: self.radius_a,
            thickness: self.thickness / self.radius_a,
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
            radius_x: self.radius_b,
            radius_y: self.radius_b,
            thickness: self.thickness / self.radius_b,
            angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            instance_matrix: instance_matrix_b,
        });

        // TODO de-duplicate this code from other primitives
        for is_second in [false, true].iter() {
            let final_angle = self.rotation_angle + if *is_second { self.arc_angle } else { 0.0 };

            let rotation = Rotation3::rotation_between(&Vector3::z_axis(), &normal).unwrap();
            let point = Vector3::new(f32::cos(final_angle), f32::sin(final_angle), 0.0);
            let point = rotation.transform_vector(&point).normalize();
            let mut vertices = [Vector3::new(0.0, 0.0, 0.0); 4];
            let mut vertex_index = 0;
            for is_a in [false, true].iter() {
                let is_really_a = if *is_second { *is_a } else { !*is_a };
                let radius = if is_really_a {
                    self.radius_a
                } else {
                    self.radius_b
                };
                let center = if is_really_a { center_a } else { center_b };
                for offset in [0.0, -self.thickness].iter() {
                    vertices[vertex_index] = (radius + offset) * point + center;
                    vertex_index += 1;
                }
            }

            collections.trapezium_collection.push(Trapezium {
                node_id: self.node_id,
                tree_index: self.tree_index,
                color: self.color,
                size: self.diagonal,
                vertex_1: vertices[0],
                vertex_2: vertices[1],
                vertex_3: vertices[2],
                vertex_4: vertices[3],
            });
        }
    }
}
