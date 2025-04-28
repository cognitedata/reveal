/*!
 * Copyright 2025 Cognite AS
 */
import { beforeEach, describe, expect, test } from 'vitest';
import { Index2 } from '../../../base/utilities/geometry/Index2';
import { RegularGrid2 } from './RegularGrid2';
import { Vector2, Vector3 } from 'three';
import { Range3 } from '../../../base/utilities/geometry/Range3';
import { ContouringService } from './ContouringService';
import { round } from '../../../base/utilities/extensions/mathExtensions';

describe(ContouringService.name, () => {
  beforeEach(() => {});

  test('Should not make any contours on a flat terrain', () => {
    const nodeSize = new Index2(10, 12);
    const origin = new Vector2(0, 0);
    const increment = new Vector2(1, 1);
    const terrain = new RegularGrid2(nodeSize, origin, increment);

    // Make a flat terrain at level 0.5
    for (let i = 0; i < terrain.nodeSize.i; i++) {
      for (let j = 0; j < terrain.nodeSize.j; j++) {
        terrain.setZ(i, j, 0.5);
      }
    }
    const inc = 2;
    const contouringService = new ContouringService(inc);
    const contours = contouringService.createContoursAsPositions(terrain);
    expect(contours.length).toBe(0);
  });

  test('Should make contours on a sloped terrain', () => {
    const nodeSize = new Index2(10, 12);
    const origin = new Vector2(0, 0);
    const increment = new Vector2(1, 1);
    const terrain = new RegularGrid2(nodeSize, origin, increment);

    // Make a sloped surface, but set some nodes to undefined
    for (let i = 0; i < terrain.nodeSize.i; i++) {
      for (let j = 0; j < terrain.nodeSize.j; j++) {
        if (i === j || i + 1 === j) {
          terrain.setNodeUndef(i, j);
        } else {
          terrain.setZ(i, j, 3 * i + 2 * j); // Z = 3 * I + 2 * J
        }
      }
    }
    const boundingBox = terrain.boundingBox;
    const contourIncrement = 2;
    const contouringService = new ContouringService(contourIncrement);
    const contours = contouringService.createContoursAsPositions(terrain);

    const contourBoundingBox = new Range3();
    for (let i = 0; i < contours.length; i += 3) {
      const x = contours[i];
      const y = contours[i + 1];
      const z = contours[i + 2];
      const point = new Vector3(x, y, z);

      expect(round(z, contourIncrement)).toBe(z); // Check the Z-value is on the contour
      contourBoundingBox.add(point);
    }
    expect(contours.length).greaterThan(100);

    // Check that the contour bounding box is inside the terrain bounding box
    expect(contourBoundingBox.isEmpty).toBe(false);
    expect(contourBoundingBox.x.min).greaterThanOrEqual(boundingBox.x.min);
    expect(contourBoundingBox.x.max).lessThanOrEqual(boundingBox.x.max);
    expect(contourBoundingBox.y.min).greaterThanOrEqual(boundingBox.y.min);
    expect(contourBoundingBox.y.max).lessThanOrEqual(boundingBox.y.max);
    expect(contourBoundingBox.z.min).greaterThanOrEqual(boundingBox.z.min);
    expect(contourBoundingBox.z.max).lessThanOrEqual(boundingBox.z.max);
  });
});
