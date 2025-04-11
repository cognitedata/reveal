/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { Vector3 } from 'three';
import { createTriangleIndexesFromVectors } from './createTriangleIndexesFromVectors';
import { forEach } from 'lodash';

describe(createTriangleIndexesFromVectors.name, () => {
  test('should return undefined when empty vectors', () => {
    const vectors: Vector3[] = [];

    const indexes = createTriangleIndexesFromVectors(vectors);
    expect(indexes).toBeUndefined();
  });

  test('should return undefined when area is zero', () => {
    const vectors: Vector3[] = [];
    for (let i = 0; i < 10; i++) {
      vectors.push(new Vector3(i, i, i));
      const indexes = createTriangleIndexesFromVectors(vectors);
      expect(indexes).toBeUndefined();
    }
  });

  test('should return undefined for less than 3 vectors', () => {
    const vectors = [new Vector3(1, 0, 0), new Vector3(0, 1, 0)];
    const indexes = createTriangleIndexesFromVectors(vectors);
    expect(indexes).toBeUndefined();
  });

  test('should return undefined for collinear vectors', () => {
    const vectors = [new Vector3(0, 0, 0), new Vector3(1, 1, 1), new Vector3(2, 2, 2)];
    const indexes = createTriangleIndexesFromVectors(vectors);
    expect(indexes).toBeUndefined();
  });

  test('should return correct indexes for a simple triangle', () => {
    const vectors = [new Vector3(0, 0, -1), new Vector3(1, 0, -1), new Vector3(0, 1, -1)];
    const indexes = createTriangleIndexesFromVectors(vectors);
    expect(indexes).toEqual([1, 2, 0]);
  });

  test('should handle vectors forming a square', () => {
    const vectors = createSquareToEdgeOfUnitSphere();
    const indexes = createTriangleIndexesFromVectors(vectors);
    expect(indexes).toEqual([2, 3, 0, 0, 1, 2]);
  });

  test('should handle reversed vectors forming a square', () => {
    const vectors = createSquareToEdgeOfUnitSphere();
    vectors.reverse();
    const indexes = createTriangleIndexesFromVectors(vectors);
    expect(indexes).toEqual([1, 0, 3, 3, 2, 1]);
  });

  test('should handle vectors forming a pentagon', () => {
    const vectors = createPentagonToEdgeOfUnitSphere();
    const indexes = createTriangleIndexesFromVectors(vectors);
    expect(indexes).toEqual([4, 0, 1, 2, 3, 4, 4, 1, 2]);
  });

  test('should handle reversed vectors forming a pentagon', () => {
    const vectors = createPentagonToEdgeOfUnitSphere();
    vectors.reverse();
    const indexes = createTriangleIndexesFromVectors(vectors);
    expect(indexes).toEqual([0, 4, 3, 2, 1, 0, 0, 3, 2]);
  });
});

/**
 * Creates a square of vectors positioned on the edge of a unit sphere.
 *
 * The function generates four 3D vectors representing the vertices of a square
 * in the XY plane at a fixed Z-coordinate. Each vector is normalized to lie on
 * the surface of a unit sphere.
 *
 */

function createSquareToEdgeOfUnitSphere(): Vector3[] {
  const vectors: Vector3[] = [];
  const z = -5;
  vectors.push(new Vector3(0, 0, z));
  vectors.push(new Vector3(1, 0, z));
  vectors.push(new Vector3(1, 1, z));
  vectors.push(new Vector3(0, 1, z));

  forEach(vectors, (vector) => vector.normalize());
  return vectors;
}

/**
 * Creates a pentagon of vectors positioned on the edge of a unit sphere.
 *
 * The function generates five 3D vectors representing the vertices of a pentagon
 * in the XY plane at a fixed Z-coordinate. Each vector is normalized to lie on
 * the surface of a unit sphere.
 *
 */
function createPentagonToEdgeOfUnitSphere(): Vector3[] {
  const vectors: Vector3[] = [];
  const z = -5;
  vectors.push(new Vector3(0, 0, z));
  vectors.push(new Vector3(1, 0, z));
  vectors.push(new Vector3(0.5, 0.5, z)); // This create a ear towards the center
  vectors.push(new Vector3(1, 1, z));
  vectors.push(new Vector3(0, 1, z));

  forEach(vectors, (vector) => vector.normalize());
  return vectors;
}
