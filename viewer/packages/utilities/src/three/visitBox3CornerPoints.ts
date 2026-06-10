/*!
 * Copyright 2021 Cognite AS
 */
import type { Box3 } from 'three';
import { Vector3, Vector4 } from 'three';

const visitBox3CornerPointsVars = {
  tmpVector: new Vector3()
};

/**
 * Visits each corner point of the box given by applying
 * the callback provided to each of the points.
 * Note that the callback is invoked with a vector
 * that will be changed later, so if this is to be stored
 * it must be cloned first.
 */
export function visitBox3CornerPoints(box: Box3, callback: (corner: Vector3) => void): void {
  const { tmpVector } = visitBox3CornerPointsVars;
  tmpVector.set(box.min.x, box.min.y, box.min.z); // 000
  callback(tmpVector);
  tmpVector.set(box.min.x, box.min.y, box.max.z); // 001
  callback(tmpVector);
  tmpVector.set(box.min.x, box.max.y, box.min.z); // 010
  callback(tmpVector);
  tmpVector.set(box.min.x, box.max.y, box.max.z); // 011
  callback(tmpVector);
  tmpVector.set(box.max.x, box.min.y, box.min.z); // 100
  callback(tmpVector);
  tmpVector.set(box.max.x, box.min.y, box.max.z); // 101
  callback(tmpVector);
  tmpVector.set(box.max.x, box.max.y, box.min.z); // 110
  callback(tmpVector);
  tmpVector.set(box.max.x, box.max.y, box.max.z); // 111
  callback(tmpVector);
}

export function getBox3CornerPoints(box: Box3): Vector4[] {
  return [
    new Vector4(box.min.x, box.min.y, box.min.z),
    new Vector4(box.min.x, box.min.y, box.max.z),
    new Vector4(box.min.x, box.max.y, box.min.z),
    new Vector4(box.min.x, box.max.y, box.max.z),
    new Vector4(box.max.x, box.min.y, box.min.z),
    new Vector4(box.max.x, box.min.y, box.max.z),
    new Vector4(box.max.x, box.max.y, box.min.z),
    new Vector4(box.max.x, box.max.y, box.max.z)
  ];
}
