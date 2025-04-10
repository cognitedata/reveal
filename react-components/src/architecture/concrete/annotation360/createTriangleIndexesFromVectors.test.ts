/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { type Vector3 } from 'three';
import { createTriangleIndexesFromVectors } from './createTriangleIndexesFromVectors';

describe(createTriangleIndexesFromVectors.name, () => {
  test('should test empty vectors', () => {
    const vectors: Vector3[] = [];

    const indexes = createTriangleIndexesFromVectors(vectors);
    expect(indexes).toBeUndefined();
  });
});
