/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test } from 'vitest';

import { getCorners } from './getCorners';
import { Box3, Vector3 } from 'three';

describe(getCorners.name, () => {
  test('should test getCorners', () => {
    const min = new Vector3(100, 200, 300);
    const max = new Vector3(400, 600, 800);
    const box = new Box3(min, max);
    const corners = new Array<Vector3>();

    // Check that each point is in the corner
    for (const cornerPoint of getCorners(box)) {
      expect(cornerPoint.x === min.x || cornerPoint.x === max.x).toBe(true);
      expect(cornerPoint.y === min.y || cornerPoint.y === max.y).toBe(true);
      expect(cornerPoint.z === min.z || cornerPoint.z === max.z).toBe(true);
      corners.push(cornerPoint.clone());
    }
    // Check that all points are unique
    const uniqueCorners = [...new Set(corners)];
    expect(uniqueCorners.length).toBe(8);
  });
});
