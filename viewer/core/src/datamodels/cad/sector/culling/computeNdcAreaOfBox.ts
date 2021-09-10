/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { getBox3CornerPoints } from '../../../../utilities/three';

const ndcSpace = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
const ndcBox = new THREE.Box3();

/**
 * Computes area of the box after converting it to NDC space. The returned value will be a number
 * in range [0, 4].
 * @param camera
 * @param box
 * @returns
 */
export function computeNdcAreaOfBox(camera: THREE.Camera, box: THREE.Box3): number {
  const corners = getBox3CornerPoints(box);
  corners.forEach(corner => {
    corner.project(camera);
  });
  ndcBox.setFromPoints(corners);
  ndcBox.intersect(ndcSpace);

  if (ndcBox.isEmpty()) {
    return 0.0;
  }
  return (ndcBox.max.x - ndcBox.min.x) * (ndcBox.max.y - ndcBox.min.y);
}
