import * as THREE from 'three';
//import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry';

import {
  AnnotationModel,
  AnnotationsBox,
  AnnotationsCylinder,
  CogniteClient,
} from '@cognite/sdk';

// Static constants to be reused:
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
