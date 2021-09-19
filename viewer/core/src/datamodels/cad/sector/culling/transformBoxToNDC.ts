/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { getBox3CornerPoints } from '../../../../utilities/three';

export function transformBoxToNDC(box: THREE.Box3, camera: THREE.Camera, out?: THREE.Box3): THREE.Box3 {
  out = out !== undefined ? out : new THREE.Box3();

  const corners = getBox3CornerPoints(box);
  corners.forEach(corner => {
    corner.project(camera);
  });
  out.setFromPoints(corners);

  return out;
}
