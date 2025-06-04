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
    const contourIncrement = 1;

    // Loop over different levels, some are exactly on the contour itself
    // This is to test most the corner cases
    for (const level of [0, 0.5, 1]) {
      // Make a flat terrain at level
      for (let i = 0; i < terrain.nodeSize.i; i++) {
        for (let j = 0; j < terrain.nodeSize.j; j++) {
          terrain.setZ(i, j, level);
        }
      }
      const contouringService = new ContouringService(contourIncrement);
      const contours = contouringService.createContoursAsPositions(terrain);
      expect(contours.length).toBe(0);
    }
  });

  test('Should make contours on a sloped terrain', () => {
    const nodeSize = new Index2(10, 12);
    const origin = new Vector2(0, 0);
    const increment = new Vector2(1, 1);
    const terrain = new RegularGrid2(nodeSize, origin, increment);
    const contourIncrement = 2;

    // Make a sloped surface, but set some nodes to undefined
    for (let i = 0; i < terrain.nodeSize.i; i++) {
      for (let j = 0; j < terrain.nodeSize.j; j++) {
        if (i === j || i + 1 === j) {
          terrain.setNodeUndef(i, j);
        } else {
          terrain.setZ(i, j, 3 * i + 2 * j); // Z(x,y) = 3 * I + 2 * J
        }
      }
    }
    const contouringService = new ContouringService(contourIncrement);
    const contours = contouringService.createContoursAsPositions(terrain);

    // Find the bounding box of the contours
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
    expect(isInside(terrain.boundingBox, contourBoundingBox)).toBe(true);
    expect(isInside(contourBoundingBox, terrain.boundingBox)).toBe(false);
  });
});

function isInside(largeRange: Range3, smallRange: Range3): boolean {
  if (smallRange.isEmpty || largeRange.isEmpty) {
    return false;
  }
  return (
    largeRange.x.isInside(smallRange.x.min) &&
    largeRange.x.isInside(smallRange.x.max) &&
    largeRange.y.isInside(smallRange.y.min) &&
    largeRange.y.isInside(smallRange.y.max) &&
    largeRange.z.isInside(smallRange.z.min) &&
    largeRange.z.isInside(smallRange.z.max)
  );
}
