/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { iterateBox3CornerPoints } from '../../../../utilities/three';

export function transformBoxToNDC(box: THREE.Box3, camera: THREE.Camera, out?: THREE.Box3): THREE.Box3 {
  out = out !== undefined ? out : new THREE.Box3();

  out.makeEmpty();
  for (const corner of iterateBox3CornerPoints(box)) {
    corner.project(camera);
    out.expandByPoint(corner);
  }
  return out;
}
