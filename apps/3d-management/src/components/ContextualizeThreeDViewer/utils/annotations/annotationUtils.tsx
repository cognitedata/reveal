import * as THREE from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
//import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe';

import { Cognite3DViewer } from '@cognite/reveal';
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
const BOX_GEOMETRY = createBoxGeometry();
const CYLINDER_GEOMETRY = createCylinderGeometry();

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
  threeDViewer: Cognite3DViewer,
  annotations: AnnotationModel[],
  matrix: THREE.Matrix4
): THREE.Group => {
  // The group of wireframes will have the annotationId in its user data, so it can be found later and changed
  const mainGroup = new THREE.Group();

  for (const annotation of annotations) {
    const group = createAnnotationAsWireframe({
      threeDViewer,
      annotation,
      matrix,
      cylinderRadiusMargin: ANNOTATION_CYLINDER_RADIUS_MARGIN,
      lineWidth: 4,
    });
    if (group) mainGroup.add(group);
  }
  return mainGroup;
};

const createAnnotationAsWireframe = ({
  threeDViewer,
  annotation,
  matrix,
  cylinderRadiusMargin,
  lineWidth,
}: {
  threeDViewer: Cognite3DViewer;
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
          threeDViewer,
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
          threeDViewer,
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
  threeDViewer,
  box,
  matrix,
  color,
  lineWidth,
}: {
  threeDViewer: Cognite3DViewer;
  box: AnnotationsBox;
  matrix: THREE.Matrix4;
  color: number;
  lineWidth: number;
}): Wireframe => {
  // Create the line material
  const material = new LineMaterial({
    color: color,
    linewidth: lineWidth,
    resolution: new THREE.Vector2(
      threeDViewer.domElement.clientWidth,
      threeDViewer.domElement.clientHeight
    ),
    dashed: false,
  });

  // Create the wireframe from the main geometry
  const wireframe = new Wireframe(BOX_GEOMETRY, material);
  wireframe.computeLineDistances();

  // Adjust and apply the matrix
  const boxMatrix = new THREE.Matrix4();
  boxMatrix.fromArray(box.matrix);
  boxMatrix.transpose();

  const actualMatrix = matrix.clone();
  actualMatrix.multiply(boxMatrix);

  wireframe.applyMatrix4(actualMatrix);
  wireframe.scale.setFromMatrixScale(actualMatrix);
  return wireframe;
};

const createCylinderAnnotationAsWireframe = ({
  threeDViewer,
  cylinder,
  matrix,
  color,
  lineWidth,
  cylinderRadiusMargin,
}: {
  threeDViewer: Cognite3DViewer;
  cylinder: AnnotationsCylinder;
  matrix: THREE.Matrix4;
  color: number;
  lineWidth: number;
  cylinderRadiusMargin: number;
}): Wireframe => {
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

  const material = new LineMaterial({
    color: color,
    linewidth: lineWidth,
    resolution: new THREE.Vector2(
      threeDViewer.domElement.clientWidth,
      threeDViewer.domElement.clientHeight
    ),
    dashed: false,
  });

  const wireframe = new Wireframe(CYLINDER_GEOMETRY, material);
  wireframe.position.copy(center);
  wireframe.scale.copy(scale);
  // Use quaternion to rotate cylinder from default to target orientation
  wireframe.quaternion.setFromUnitVectors(UP_AXIS, axis);

  return wireframe;
};

export const createBoxAnnotationAsBox3 = ({
  box,
  matrix,
}: {
  box: AnnotationsBox;
  matrix: THREE.Matrix4;
}): THREE.Box3 => {
  const cubeCorners = [
    new THREE.Vector3(-1, -1, -1),
    new THREE.Vector3(1, -1, -1),
    new THREE.Vector3(1, 1, -1),
    new THREE.Vector3(-1, 1, -1),
    new THREE.Vector3(-1, -1, 1),
    new THREE.Vector3(1, -1, 1),
    new THREE.Vector3(1, 1, 1),
    new THREE.Vector3(-1, 1, 1),
  ];

  // Create the boxMatrix from the given box.matrix
  const boxMatrix = new THREE.Matrix4();
  boxMatrix.fromArray(box.matrix);
  boxMatrix.transpose();

  // Calculate the actualMatrix
  const actualMatrix = matrix.clone();
  actualMatrix.multiply(boxMatrix);

  // Transform each corner of the cube using the actualMatrix
  const transformedCorners = cubeCorners.map((corner) =>
    corner.applyMatrix4(actualMatrix)
  );

  // Create a new Box3 encompassing all transformed corners
  const resultBox = new THREE.Box3().setFromPoints(transformedCorners);

  return resultBox;
};

export const createCylinderAnnotationAsBox3 = (
  cylinder: AnnotationsCylinder,
  matrix4: THREE.Matrix4
): THREE.Box3 => {
  // Calculate the center of the cylinder
  const centerA = new THREE.Vector3(...cylinder.centerA);
  const centerB = new THREE.Vector3(...cylinder.centerB);

  centerA.applyMatrix4(matrix4);
  centerB.applyMatrix4(matrix4);

  const center = centerB.clone();
  center.add(centerA);
  center.multiplyScalar(0.5);

  // Calculate the axis of the cylinder
  const axis = centerB.clone();
  axis.sub(centerA);
  axis.normalize();

  // Calculate the scale of the cylinder
  const radius = cylinder.radius;
  const height = centerA.distanceTo(centerB);
  const scale = new THREE.Vector3(radius, height / 2, radius);

  // Create a new Box3 encompassing the cylinder
  const resultBox = new THREE.Box3().setFromCenterAndSize(center, scale);

  return resultBox;
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
