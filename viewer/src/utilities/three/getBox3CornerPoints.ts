/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

export function getBox3CornerPoints(box: THREE.Box3): THREE.Vector3[] {
  return [
    new THREE.Vector3(box.min.x, box.min.y, box.min.z), // 000
    new THREE.Vector3(box.min.x, box.min.y, box.max.z), // 001
    new THREE.Vector3(box.min.x, box.max.y, box.min.z), // 010
    new THREE.Vector3(box.min.x, box.max.y, box.max.z), // 011
    new THREE.Vector3(box.max.x, box.min.y, box.min.z), // 100
    new THREE.Vector3(box.max.x, box.min.y, box.max.z), // 101
    new THREE.Vector3(box.max.x, box.max.y, box.min.z), // 110
    new THREE.Vector3(box.max.x, box.max.y, box.max.z) // 111
  ];
}
