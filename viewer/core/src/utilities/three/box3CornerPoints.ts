/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

const iterateBox3CornerPointsVars = {
  tmpVector: new THREE.Vector3()
};

export function* iterateBox3CornerPoints(box: THREE.Box3): Generator<THREE.Vector3> {
  const { tmpVector } = iterateBox3CornerPointsVars;
  tmpVector.set(box.min.x, box.min.y, box.min.z); // 000
  yield tmpVector;
  tmpVector.set(box.min.x, box.min.y, box.max.z); // 001
  yield tmpVector;
  tmpVector.set(box.min.x, box.max.y, box.min.z); // 010
  yield tmpVector;
  tmpVector.set(box.min.x, box.max.y, box.max.z); // 011
  yield tmpVector;
  tmpVector.set(box.max.x, box.min.y, box.min.z); // 100
  yield tmpVector;
  tmpVector.set(box.max.x, box.min.y, box.max.z); // 101
  yield tmpVector;
  tmpVector.set(box.max.x, box.max.y, box.min.z); // 110
  yield tmpVector;
  tmpVector.set(box.max.x, box.max.y, box.max.z); // 111
  yield tmpVector;
}
