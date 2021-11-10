/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { visitBox3CornerPoints } from '@reveal/utilities';

export function transformBoxToNDC(box: THREE.Box3, camera: THREE.Camera, out?: THREE.Box3): THREE.Box3 {
  const transformedBox = out !== undefined ? out : new THREE.Box3();
  transformedBox.makeEmpty();

  visitBox3CornerPoints(box, corner => {
    corner.project(camera);
    transformedBox.expandByPoint(corner);
  });

  return transformedBox;
}
