/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

/**
 * Sets the elements of a matrix from a row-major
 * matrix stored in a Float32Array.
 * @param buffer
 * @param indexOffset
 * @param outMatrix
 */
export function float32BufferToMatrix(
  buffer: Float32Array,
  indexOffset: number,
  outMatrix: THREE.Matrix4
): THREE.Matrix4 {
  outMatrix.set(
    buffer[indexOffset + 0],
    buffer[indexOffset + 4],
    buffer[indexOffset + 8],
    buffer[indexOffset + 12],

    buffer[indexOffset + 1],
    buffer[indexOffset + 5],
    buffer[indexOffset + 9],
    buffer[indexOffset + 13],

    buffer[indexOffset + 2],
    buffer[indexOffset + 6],
    buffer[indexOffset + 10],
    buffer[indexOffset + 14],

    buffer[indexOffset + 3],
    buffer[indexOffset + 7],
    buffer[indexOffset + 11],
    buffer[indexOffset + 15]
  );
  return outMatrix;
}
