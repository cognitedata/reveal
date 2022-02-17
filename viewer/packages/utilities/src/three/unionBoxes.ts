/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

export function unionBoxes(boxes: THREE.Box3[], out?: THREE.Box3): THREE.Box3 {
  out = out ?? new THREE.Box3();
  out.makeEmpty();

  boxes.forEach(inputBox => {
    out!.expandByPoint(inputBox.max);
    out!.expandByPoint(inputBox.min);
  });

  return out;
}
