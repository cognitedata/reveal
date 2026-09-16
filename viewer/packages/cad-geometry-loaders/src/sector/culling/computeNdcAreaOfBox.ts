/*!
 * Copyright 2021 Cognite AS
 */
import type { Camera } from 'three';
import { Box3, Vector3 } from 'three';
import { transformBoxToNDC } from './transformBoxToNDC';

const ndcSpace = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1));
const ndcBox = new Box3();

/**
 * Computes area of the box after converting it to NDC space. The returned value will be a number
 * in range [0, 1].
 * @param camera
 * @param box
 * @returns
 */
export function computeNdcAreaOfBox(camera: Camera, box: Box3): number {
  transformBoxToNDC(box, camera, ndcBox);
  ndcBox.intersect(ndcSpace);
  if (ndcBox.isEmpty()) {
    return 0.0;
  }
  return 0.25 * (ndcBox.max.x - ndcBox.min.x) * (ndcBox.max.y - ndcBox.min.y);
}
