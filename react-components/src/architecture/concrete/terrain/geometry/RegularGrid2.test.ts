/*!
 * Copyright 2025 Cognite AS
 */
import { describe, expect, test } from 'vitest';
import { Index2 } from '../../../base/utilities/geometry/Index2';
import { RegularGrid2 } from './RegularGrid2';
import { Vector2, Vector3 } from 'three';
import { Range1 } from '../../../base/utilities/geometry/Range1';
import { createFractalRegularGrid2 } from './createFractalRegularGrid2';
import { Range3 } from '../../../base/utilities/geometry/Range3';
import { expectEqualRange1, expectEqualRange2 } from '#test-utils/primitives/primitiveTestUtil';

describe(RegularGrid2.name, () => {
  test('Should create a flat terrain with and without rotation', () => {
    const nodeSize = new Index2(10, 12);
    const origin = new Vector2(2, 3);
    const increment = new Vector2(1, 1);

    for (const angle of [0, Math.PI / 10]) {
      const terrain = new RegularGrid2(nodeSize, origin, increment, angle);
      expect(terrain.rotationAngle).toEqual(angle);
      expect(terrain.origin).toEqual(origin);
      expect(terrain.increment).toEqual(increment);
      expect(terrain.zRange).toEqual(new Range1(0, 0));

      {
        // Testing node position at origin
        const actualPosition = new Vector3();
        expect(terrain.getNodePosition(0, 0, actualPosition)).toBe(true);
        expect(actualPosition.x).toEqual(origin.x);
        expect(actualPosition.y).toEqual(origin.y);
        expect(actualPosition.z).toEqual(0);

        terrain.getNodePosition2(0, 0, actualPosition);
        expect(actualPosition.x).toEqual(origin.x);
        expect(actualPosition.y).toEqual(origin.y);

        terrain.getRelativeNodePosition(0, 0, actualPosition);
        expect(actualPosition.x).toEqual(0);
        expect(actualPosition.y).toEqual(0);
      }

      // Testing each node
      const actualNormal = new Vector3();
      const expectedNormal = new Vector3(0, 0, 1);
      for (let i = 0; i < terrain.nodeSize.i; i++) {
        for (let j = 0; j < terrain.nodeSize.j; j++) {
          expect(terrain.isNodeDef(i, j)).toBe(true);
          expect(terrain.isNodeInsideDef(i, j)).toBe(true);
          expect(terrain.getZ(i, j)).toEqual(0);
          expect(terrain.getNormal(i, j, 0, true, actualNormal)).toEqual(expectedNormal);
        }
      }
    }
  });

  test('Should clone', () => {
    const initialRange = new Range3(new Vector3(0, 0, 20), new Vector3(1000, 1000, 40));
    const terrain = createFractalRegularGrid2(initialRange, 4, 0.7, 2);
    expect(terrain.clone()).toStrictEqual(terrain);
  });

  test('Should have bounding box', () => {
    const expectedRange = new Range3(new Vector3(0, 0, 20), new Vector3(100, 100, 40));
    const terrain = createFractalRegularGrid2(expectedRange, 4, 0.7);

    const cornerRange = terrain.getCornerRange();
    const boundingBox = terrain.boundingBox;

    expectEqualRange2(cornerRange, expectedRange);
    expectEqualRange2(boundingBox, expectedRange);
  });

  test('Should create a fractal surface', () => {
    const expectedRange = new Range3(new Vector3(0, 0, 20), new Vector3(100, 100, 40));
    const terrain = createFractalRegularGrid2(expectedRange, 4, 0.7);

    // Testing each node
    const actualPosition = new Vector3();
    let sumZ = 0;
    for (let i = 0; i < terrain.nodeSize.i; i++) {
      for (let j = 0; j < terrain.nodeSize.j; j++) {
        const z = terrain.getZ(i, j);
        sumZ += z;
        expect(terrain.isNodeDef(i, j)).toBe(true);
        expect(z).toBeGreaterThanOrEqual(expectedRange.min.z);
        expect(z).toBeLessThanOrEqual(expectedRange.max.z);

        terrain.getNodePosition(i, j, actualPosition);
        expect(actualPosition.z).toEqual(z);
        expect(expectedRange.isInside(actualPosition)).toBe(true);
      }
    }
    // Check average of z-values is in the middle
    const averageZ = sumZ / (terrain.nodeSize.i * terrain.nodeSize.j);
    const error = expectedRange.z.delta / 4;
    expect(averageZ).toBeGreaterThan(expectedRange.z.center - error);
    expect(averageZ).toBeLessThan(expectedRange.z.center + error);

    // Check min and max of z-values
    expectEqualRange1(terrain.boundingBox.z, expectedRange.z);
  });

  test('Should smooth a surface', () => {
    const initialRange = new Range3(new Vector3(0, 0, 20), new Vector3(1000, 1000, 40));
    const terrain = createFractalRegularGrid2(initialRange, 4, 0.7, 0);

    const oldRange = terrain.boundingBox.clone();
    terrain.smoothSimple(10);
    const newRange = terrain.boundingBox;

    expect(newRange.z.min).toBeGreaterThan(oldRange.z.min);
    expect(newRange.z.max).toBeLessThan(oldRange.z.max);
  });

  test('Should smooth a surface', () => {
    const initialRange = new Range3(new Vector3(0, 0, 20), new Vector3(1000, 1000, 40));
    const terrain = createFractalRegularGrid2(initialRange, 4, 0.7, 0);

    terrain.smoothSimple(0);

    // Check if unchanged
    expectEqualRange1(terrain.boundingBox.z, initialRange.z);
  });

  test('Should normalize a surface', () => {
    const initialRange = new Range3(new Vector3(0, 0, 20), new Vector3(1000, 1000, 40));
    const terrain = createFractalRegularGrid2(initialRange, 4, 0.7);

    const expectedZRange = new Range1(100, 200);
    terrain.normalizeZ(expectedZRange);
    expectEqualRange1(terrain.boundingBox.z, expectedZRange);
  });
});
