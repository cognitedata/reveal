use crate::renderables::common::{
    create_general_ring_instance_matrix, GeneralRingInstanceMatrixInfo,
};
use crate::renderables::{
    Circle, CircleInfo, Cone, GeneralCylinder, GeneralRing, PrimitiveCollections, ToRenderables,
    Trapezium,
};
use crate::{Matrix, Rotation3, Vector3, Vector4};
use std::f32::consts::PI;

fn intersect(
    ray_vector: &Vector3,
    ray_point: &Vector3,
    plane_normal: &Vector3,
    plane_point: &Vector3,
) -> Vector3 {
    let diff = ray_point - plane_point;
    let prod1 = diff.dot(&plane_normal);
    let prod2 = ray_vector.dot(&plane_normal);
    let prod3 = prod1 / prod2;
    ray_point - ray_vector.scale(prod3)
}

fn normalize_radians(mut angle: f32) -> f32 {
    while angle < -PI {
        angle += 2.0 * PI;
    }
    while angle > PI {
        angle -= 2.0 * PI;
    }
    angle
}

struct Cap {
    ring: GeneralRing,
    plane: Vector4,
    center: Vector3,
}

// TODO use f64 for the calculations - there is a slight offset between the trapeziums and top caps

#[allow(clippy::too_many_arguments)]
fn create_cap(
    cylinder: &crate::SolidOpenGeneralCylinder,
    cylinder_rotation: &Rotation3,
    ext_a: &Vector3,
    ext_b: &Vector3,
    center: &Vector3,
    slope: f32,
    z_angle: f32,
    height: f32,
    invert_normal: bool,
) -> Cap {
    let slope_rotation = Rotation3::from_axis_angle(&Vector3::y_axis(), slope);
    let z_angle_rotation = Rotation3::from_axis_angle(&Vector3::z_axis(), z_angle);
    let rotation = z_angle_rotation * slope_rotation;
    let local_x_axis = rotation.transform_vector(&Vector3::x_axis());
    let local_z_axis = rotation.transform_vector(&Vector3::z_axis());
    let normal = if invert_normal { -1.0 } else { 1.0 } * local_z_axis;

    let center_axis_rotation =
        Rotation3::rotation_between(&Vector3::z_axis(), &Vector3::from(cylinder.center_axis))
            .unwrap_or_else(|| Rotation3::from_axis_angle(&Vector3::x_axis(), PI));
    let plane = Vector4::new(normal.x, normal.y, normal.z, height);
    let cap_x_axis_a = center_axis_rotation
        .transform_vector(&local_x_axis)
        .normalize();
    let cap_z_axis_a = cylinder_rotation
        .transform_vector(&local_z_axis)
        .normalize();

    let cap_radius_x_a = cylinder.radius / f32::abs(f32::cos(slope));
    let cap_radius_y = cylinder.radius;

    let line_point = Vector3::new(
        f32::cos(cylinder.rotation_angle),
        f32::sin(cylinder.rotation_angle),
        0.0,
    );
    let line_point = cylinder.radius * cylinder_rotation.transform_vector(&line_point).normalize();
    let line_start_a = ext_b - Vector3::from(cylinder.center_axis) + line_point;
    let line_end_a = ext_a + Vector3::from(cylinder.center_axis) + line_point;
    let line_vector = line_end_a - line_start_a;

    let intersection_point = intersect(&line_vector, &line_start_a, &cap_z_axis_a, &center);
    let cap_angle_axis_a = (intersection_point - center).normalize();
    let cap_angle_a = angle_between_vectors(&cap_angle_axis_a, &cap_x_axis_a, &cap_z_axis_a);

    let instance_matrix = create_general_ring_instance_matrix(&GeneralRingInstanceMatrixInfo {
        center: *center,
        // NOTE we cannot use the normal without also modifying the arc angles
        normal: cap_z_axis_a,
        local_x_axis: cap_x_axis_a,
        radius_a: cap_radius_x_a,
        radius_b: cap_radius_y,
    });

    Cap {
        ring: GeneralRing {
            tree_index: cylinder.tree_index as f32,
            color: cylinder.color,
            normal: if invert_normal { -1.0 } else { 1.0 } * cap_z_axis_a,
            thickness: cylinder.thickness / cylinder.radius,
            angle: normalize_radians(cap_angle_a),
            arc_angle: cylinder.arc_angle,
            instance_matrix,
        },
        plane,
        center: *center,
    }
}

impl ToRenderables for crate::ClosedCylinder {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let center_axis: Vector3 = self.center_axis.into();
        let center: Vector3 = self.center();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let normal = (center_a - center_b).normalize();
        let rotation = Rotation3::rotation_between(&Vector3::z_axis(), &normal)
            .unwrap_or_else(|| Rotation3::from_axis_angle(&Vector3::x_axis(), PI));
        let local_x_axis: Vector3 = rotation.transform_vector(&Vector3::x_axis());
        collections.cone_collection.push(Cone {
            tree_index: self.tree_index as f32,
            color: self.color,
            center_a,
            center_b,
            radius_a: self.radius,
            radius_b: self.radius,
            angle: 0.0,
            arc_angle: 2.0 * PI,
            local_x_axis,
        });
        collections.circle_collection.push(Circle::new(&CircleInfo {
            tree_index: self.tree_index as f32,
            color: self.color,
            center: center_a,
            normal: center_axis,
            radius: self.radius,
        }));
        collections.circle_collection.push(Circle::new(&CircleInfo {
            tree_index: self.tree_index as f32,
            color: self.color,
            center: center_b,
            // TODO should this be negative, it is not in the JS version
            normal: -1.0 * center_axis,
            radius: self.radius,
        }));
    }
}

impl ToRenderables for crate::OpenCylinder {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let center_axis: Vector3 = self.center_axis.into();
        let center: Vector3 = self.center();
        let center_a = center + center_axis * self.height / 2.0;
        let center_b = center - center_axis * self.height / 2.0;
        let normal = (center_a - center_b).normalize();
        let rotation = Rotation3::rotation_between(&Vector3::z_axis(), &normal)
            .unwrap_or_else(|| Rotation3::from_axis_angle(&Vector3::x_axis(), PI));
        let local_x_axis: Vector3 = rotation.transform_vector(&Vector3::x_axis());
        collections.cone_collection.push(Cone {
            tree_index: self.tree_index as f32,
            color: self.color,
            center_a,
            center_b,
            radius_a: self.radius,
            radius_b: self.radius,
            angle: 0.0,
            arc_angle: 2.0 * PI,
            local_x_axis,
        });
    }
}

struct GeneralCylinderWithCaps {
    cylinder: GeneralCylinder,
    cap_a: Cap,
    cap_b: Cap,
    ext_a: Vector3,
    ext_b: Vector3,
}

fn angle_between_vectors(v1: &Vector3, v2: &Vector3, up: &Vector3) -> f32 {
    let angle = Matrix::angle(v1, v2);
    let right = Vector3::cross(v1, up);
    let more_than_pi = Vector3::dot(&right, &v2) < 0.0;
    if more_than_pi {
        2.0 * PI - angle
    } else {
        angle
    } // TODO normalize radians
}

fn create_general_cylinder(cylinder: &crate::SolidOpenGeneralCylinder) -> GeneralCylinderWithCaps {
    let center_axis: Vector3 = cylinder.center_axis.into();
    let center: Vector3 = cylinder.center();
    let center_a = center + center_axis * cylinder.height / 2.0;
    let center_b = center - center_axis * cylinder.height / 2.0;

    // TODO request storing this in file format instead of doing conversion on client
    let dist_from_a_to_ext_a = cylinder.radius + f32::tan(cylinder.slope_a);
    let dist_from_b_to_ext_b = cylinder.radius + f32::tan(cylinder.slope_b); // TODO verify radius_a is correct
    let height_a = dist_from_b_to_ext_b + cylinder.height;
    let height_b = dist_from_b_to_ext_b;

    let ext_a = dist_from_a_to_ext_a * center_axis + center_a;
    let ext_b = -dist_from_b_to_ext_b * center_axis + center_b;

    let normal = (ext_a - ext_b).normalize();
    let rotation = Rotation3::rotation_between(&Vector3::z_axis(), &normal)
        .unwrap_or_else(|| Rotation3::from_axis_angle(&Vector3::x_axis(), PI));
    let local_x_axis: Vector3 = rotation.transform_vector(&Vector3::x_axis());

    let cap_a = create_cap(
        &cylinder,
        &rotation,
        &ext_a,
        &ext_b,
        &center_a,
        cylinder.slope_a,
        cylinder.zangle_a,
        height_a,
        false,
    );
    let cap_b = create_cap(
        &cylinder,
        &rotation,
        &ext_a,
        &ext_b,
        &center_b,
        cylinder.slope_b,
        cylinder.zangle_b,
        height_b,
        true,
    );

    GeneralCylinderWithCaps {
        cylinder: GeneralCylinder {
            tree_index: cylinder.tree_index as f32,
            color: cylinder.color,
            center_a: ext_a,
            center_b: ext_b,
            radius: cylinder.radius,
            angle: normalize_radians(cylinder.rotation_angle), // TODO normalize
            plane_a: cap_a.plane,
            plane_b: cap_b.plane,
            arc_angle: cylinder.arc_angle, // TODO normalize
            local_x_axis,
        },
        cap_a,
        cap_b,
        ext_a,
        ext_b,
    }
}

impl ToRenderables for crate::OpenGeneralCylinder {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let cylinder_with_caps = create_general_cylinder(&crate::SolidOpenGeneralCylinder {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            diagonal: self.diagonal,
            center_x: self.center_x,
            center_y: self.center_y,
            center_z: self.center_z,
            center_axis: self.center_axis,
            height: self.height,
            radius: self.radius,
            thickness: self.radius,
            rotation_angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            slope_a: self.slope_a,
            slope_b: self.slope_b,
            zangle_a: self.zangle_a,
            zangle_b: self.zangle_b,
        });

        collections
            .general_cylinder_collection
            .push(cylinder_with_caps.cylinder);
    }
}
impl ToRenderables for crate::ClosedGeneralCylinder {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let cylinder_with_caps = create_general_cylinder(&crate::SolidOpenGeneralCylinder {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            diagonal: self.diagonal,
            center_x: self.center_x,
            center_y: self.center_y,
            center_z: self.center_z,
            center_axis: self.center_axis,
            height: self.height,
            radius: self.radius,
            thickness: self.radius,
            rotation_angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            slope_a: self.slope_a,
            slope_b: self.slope_b,
            zangle_a: self.zangle_a,
            zangle_b: self.zangle_b,
        });

        collections
            .general_cylinder_collection
            .push(cylinder_with_caps.cylinder);
        collections
            .general_ring_collection
            .push(cylinder_with_caps.cap_a.ring);
        collections
            .general_ring_collection
            .push(cylinder_with_caps.cap_b.ring);
    }
}
impl ToRenderables for crate::SolidOpenGeneralCylinder {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let cylinder_with_caps = create_general_cylinder(&self);
        let outer_cylinder = cylinder_with_caps.cylinder;
        let inner_cylinder = {
            let mut c = outer_cylinder.clone();
            c.radius -= self.thickness;
            c
        };

        collections.general_cylinder_collection.push(outer_cylinder);
        collections.general_cylinder_collection.push(inner_cylinder);
        collections
            .general_ring_collection
            .push(cylinder_with_caps.cap_a.ring);
        collections
            .general_ring_collection
            .push(cylinder_with_caps.cap_b.ring);
    }
}
impl ToRenderables for crate::SolidClosedGeneralCylinder {
    fn to_renderables(&self, collections: &mut PrimitiveCollections) {
        let cylinder_with_caps = create_general_cylinder(&crate::SolidOpenGeneralCylinder {
            node_id: self.node_id,
            tree_index: self.tree_index,
            color: self.color,
            diagonal: self.diagonal,
            center_x: self.center_x,
            center_y: self.center_y,
            center_z: self.center_z,
            center_axis: self.center_axis,
            height: self.height,
            radius: self.radius,
            thickness: self.thickness,
            rotation_angle: self.rotation_angle,
            arc_angle: self.arc_angle,
            slope_a: self.slope_a,
            slope_b: self.slope_b,
            zangle_a: self.zangle_a,
            zangle_b: self.zangle_b,
        });

        let outer_cylinder = cylinder_with_caps.cylinder;
        let inner_cylinder = {
            let mut c = outer_cylinder.clone();
            c.radius -= self.thickness;
            c
        };

        let cap_a = cylinder_with_caps.cap_a;
        let cap_b = cylinder_with_caps.cap_b;
        let ext_a = cylinder_with_caps.ext_a;
        let ext_b = cylinder_with_caps.ext_b;

        collections.general_cylinder_collection.push(outer_cylinder);
        collections.general_cylinder_collection.push(inner_cylinder);
        collections.general_ring_collection.push(cap_a.ring.clone());
        collections.general_ring_collection.push(cap_b.ring.clone());

        let normal: Vector3 = self.center_axis.into();

        for is_second in &[false, true] {
            let mut vertex_index = 0;
            let final_angle = self.rotation_angle + if *is_second { self.arc_angle } else { 0.0 };
            let radii = if *is_second {
                [self.radius - self.thickness, self.radius]
            } else {
                [self.radius, self.radius - self.thickness]
            };

            let rotation = Rotation3::rotation_between(&Vector3::z_axis(), &normal)
                .unwrap_or_else(|| Rotation3::from_axis_angle(&Vector3::x_axis(), PI));
            let point = Vector3::new(f32::cos(final_angle), f32::sin(final_angle), 0.0);
            let point = rotation.transform_vector(&point).normalize();
            let mut vertices = [Vector3::new(0.0, 0.0, 0.0); 4];
            for radius in &radii {
                let line_start = point * *radius + ext_b - normal;
                let line_end = point * *radius + ext_a + normal;
                let line_vector = line_end - line_start;
                vertices[vertex_index] =
                    intersect(&line_vector, &line_start, &cap_b.ring.normal, &cap_b.center);
                vertices[vertex_index + 1] =
                    intersect(&line_vector, &line_start, &cap_a.ring.normal, &cap_a.center);
                vertex_index += 2;
            }

            collections.trapezium_collection.push(Trapezium {
                tree_index: self.tree_index as f32,
                color: self.color,
                vertex_1: vertices[0],
                vertex_2: vertices[1],
                vertex_3: vertices[2],
                vertex_4: vertices[3],
            });
        }
    }
}
