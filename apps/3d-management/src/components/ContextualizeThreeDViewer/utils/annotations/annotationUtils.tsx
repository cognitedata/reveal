import * as THREE from 'three';

import {
  AnnotationModel,
  AnnotationsBox,
  AnnotationsBoundingVolume,
  AnnotationsCylinder,
  CogniteClient,
} from '@cognite/sdk';

import {
  ANNOTATION_APPROVED_COLOR,
  ANNOTATION_CYLINDER_RADIUS_MARGIN,
  ANNOTATION_REJECTED_COLOR,
  ANNOTATION_SUGGESTED_COLOR,
} from '../../../../pages/ContextualizeEditor/constants';

import { createBoxGeometry } from './createBoxGeometry';
import { createCylinderGeometry } from './createCylinderGeometry';

// Static constants to be reused:
const UP_AXIS = new THREE.Vector3(0, 1, 0);
const CYliNDER_BUFFER_GEOMETRY = createCylinderGeometry();
const BOX_BUFFER_GEOMETRY = createBoxGeometry();

export const getCdfAnnotations = (
  client: CogniteClient,
  modelId: number
): Promise<AnnotationModel[]> => {
  return client.annotations
    .list({
      filter: {
        annotatedResourceType: 'threedmodel',
        annotationType: 'pointcloud.BoundingVolume',
        annotatedResourceIds: [{ id: modelId }],
      },
      limit: 1000,
    })
    .autoPagingToArray({ limit: Infinity });
};

export const createAnnotationsAsWireframes = (
  annotations: AnnotationModel[],
  matrix: THREE.Matrix4
): THREE.Group => {
  // The group of wireframes will have the annotationId in its user data, so it can be found later and changed
  const mainGroup = new THREE.Group();

  for (const annotation of annotations) {
    const group = createAnnotationAsWireframe({
      annotation,
      matrix,
      cylinderRadiusMargin: ANNOTATION_CYLINDER_RADIUS_MARGIN,
      lineWidth: 5,
    });
    if (group) mainGroup.add(group);
  }
  return mainGroup;
};

const createAnnotationAsWireframe = ({
  annotation,
  matrix,
  cylinderRadiusMargin,
  lineWidth,
}: {
  annotation: AnnotationModel;
  matrix: THREE.Matrix4;
  cylinderRadiusMargin: number;
  lineWidth: number;
}): THREE.Group | null => {
  // The group will have the annotationId in its user data, so it can be found later and changed
  const volume = annotation.data as AnnotationsBoundingVolume;
  if (volume.region.length === 0) return null;

  const color = getAnnotationColor(annotation);
  const group = new THREE.Group();
  group.userData.id = annotation.id; // Set the annotation id

  for (const regionPart of volume.region) {
    if (regionPart.box) {
      group.add(
        createBoxAnnotationAsWireframe({
          box: regionPart.box,
          matrix,
          color,
          lineWidth,
        })
      );
      continue;
    }

    if (regionPart.cylinder) {
      group.add(
        createCylinderAnnotationAsWireframe({
          cylinder: regionPart.cylinder,
          matrix,
          color,
          lineWidth,
          cylinderRadiusMargin,
        })
      );
    }
  }
  return group;
};

const createBoxAnnotationAsWireframe = ({
  box,
  matrix,
  color,
  lineWidth,
}: {
  box: AnnotationsBox;
  matrix: THREE.Matrix4;
  color: number;
  lineWidth: number;
}): THREE.LineSegments => {
  const material = new THREE.LineBasicMaterial({
    color: color,
    linewidth: lineWidth,
  });
  const line = new THREE.LineSegments(BOX_BUFFER_GEOMETRY, material);
  const boxMatrix = new THREE.Matrix4();
  boxMatrix.fromArray(box.matrix);
  boxMatrix.transpose();

  const actualMatrix = matrix.clone();
  actualMatrix.multiply(boxMatrix);
  line.applyMatrix4(actualMatrix);
  return line;
};

const createCylinderAnnotationAsWireframe = ({
  cylinder,
  matrix,
  color,
  lineWidth,
  cylinderRadiusMargin,
}: {
  cylinder: AnnotationsCylinder;
  matrix: THREE.Matrix4;
  color: number;
  lineWidth: number;
  cylinderRadiusMargin: number;
}): THREE.LineSegments => {
  // Calculate the center of the cylinder
  const centerA = new THREE.Vector3(...cylinder.centerA);
  const centerB = new THREE.Vector3(...cylinder.centerB);

  centerA.applyMatrix4(matrix);
  centerB.applyMatrix4(matrix);

  const center = centerB.clone();
  center.add(centerA);
  center.multiplyScalar(0.5);

  // Calculate the axis of the cylinder
  const axis = centerB.clone();
  axis.sub(centerA);
  axis.normalize();

  // Calculate the scale of the cylinder
  const radius = cylinder.radius * (1 + cylinderRadiusMargin);
  const height = centerA.distanceTo(centerB);
  const scale = new THREE.Vector3(radius, height, radius);

  const material = new THREE.LineBasicMaterial({
    color: color,
    linewidth: lineWidth,
  });
  const line = new THREE.LineSegments(CYliNDER_BUFFER_GEOMETRY, material);
  line.position.copy(center);
  line.scale.copy(scale);
  // Use quaternion to rotate cylinder from default to target orientation
  line.quaternion.setFromUnitVectors(UP_AXIS, axis);
  return line;
};

const getAnnotationColor = (annotation: AnnotationModel): number => {
  if (annotation.status === 'suggested') {
    return ANNOTATION_SUGGESTED_COLOR;
  }
  if (annotation.status === 'approved') {
    return ANNOTATION_APPROVED_COLOR;
  }
  return ANNOTATION_REJECTED_COLOR;
};
