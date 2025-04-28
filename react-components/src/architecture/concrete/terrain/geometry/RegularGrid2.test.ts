/*!
 * Copyright 2025 Cognite AS
 */
import { beforeEach, describe, expect, test } from 'vitest';
import { Index2 } from '../../../base/utilities/geometry/Index2';
import { RegularGrid2 } from './RegularGrid2';
import { Vector2, Vector3 } from 'three';
import { Range1 } from '../../../base/utilities/geometry/Range1';
import { createFractalRegularGrid2 } from './createFractalRegularGrid2';
import { Range3 } from '../../../base/utilities/geometry/Range3';

describe(RegularGrid2.name, () => {
  beforeEach(() => {});

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
        expect(terrain.getNodePosition(0, 0, actualPosition)).toEqual(true);
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
          expect(terrain.isNodeDef(i, j)).toEqual(true);
          expect(terrain.isNodeInsideDef(i, j)).toEqual(true);
          expect(terrain.getZ(i, j)).toEqual(0);
          expect(terrain.getNormal(i, j, 0, true, actualNormal)).toEqual(expectedNormal);
        }
      }
    }
  });

  test('Should clone', () => {
    const range = new Range3(new Vector3(0, 0, 20), new Vector3(1000, 1000, 40));
    const terrain = createFractalRegularGrid2(range);
    expect(terrain.clone()).toStrictEqual(terrain);
  });

  test('Should create a fractal surface', () => {
    const initialRange = new Range3(new Vector3(0, 0, 20), new Vector3(100, 100, 40));
    const terrain = createFractalRegularGrid2(initialRange, 4, 0.7, 2);

    // Testing each node
    const actualPosition = new Vector3();
    for (let i = 0; i < terrain.nodeSize.i; i++) {
      for (let j = 0; j < terrain.nodeSize.j; j++) {
        const z = terrain.getZ(i, j);
        expect(terrain.isNodeDef(i, j)).toEqual(true);
        expect(z).toBeGreaterThanOrEqual(initialRange.min.z);
        expect(z).toBeLessThanOrEqual(initialRange.max.z);

        terrain.getNodePosition(i, j, actualPosition);
        expect(actualPosition.z).toEqual(z);
        expect(initialRange.isInside(actualPosition)).toEqual(true);
      }
    }

    terrain.smoothSimple(10);
    const newRange = terrain.boundingBox;

    expect(newRange.z.min).toBeGreaterThanOrEqual(initialRange.z.min);
    expect(newRange.z.max).toBeLessThanOrEqual(initialRange.z.max);
  });

  test('Should smooth a surface', () => {
    const initialRange = new Range3(new Vector3(0, 0, 20), new Vector3(1000, 1000, 40));
    const terrain = createFractalRegularGrid2(initialRange, 4, 0.7, 2);

    const oldRange = terrain.boundingBox;
    terrain.smoothSimple(10);
    const newRange = terrain.boundingBox;

    expect(newRange.z.min).toBeGreaterThanOrEqual(oldRange.z.min);
    expect(newRange.z.max).toBeLessThanOrEqual(oldRange.z.max);
  });

  test('Should normalize a surface', () => {
    const initialRange = new Range3(new Vector3(0, 0, 20), new Vector3(1000, 1000, 40));
    const terrain = createFractalRegularGrid2(initialRange, 4, 0.7, 2);

    const newZRrange = new Range1(100, 200);
    terrain.normalizeZ(newZRrange);
    const newRange = terrain.boundingBox;

    expect(newRange.z.min).toBeCloseTo(newZRrange.min);
    expect(newRange.z.max).toBeCloseTo(newZRrange.max);
  });
});
