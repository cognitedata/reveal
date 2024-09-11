/*!
 * Copyright 2024 Cognite AS
 */

import { type Box3, Vector3 } from 'three';

export function* getCorners(box: Box3, target?: Vector3): Generator<Vector3> {
  if (target === undefined) {
    target = new Vector3();
  }
  target.set(box.min.x, box.min.y, box.min.z); // 000
  yield target;
  target.set(box.min.x, box.min.y, box.max.z); // 001
  yield target;
  target.set(box.min.x, box.max.y, box.min.z); // 010
  yield target;
  target.set(box.min.x, box.max.y, box.max.z); // 011
  yield target;
  target.set(box.max.x, box.min.y, box.min.z); // 100
  yield target;
  target.set(box.max.x, box.min.y, box.max.z); // 101
  yield target;
  target.set(box.max.x, box.max.y, box.min.z); // 110
  yield target;
  target.set(box.max.x, box.max.y, box.max.z); // 111
  yield target;
}
