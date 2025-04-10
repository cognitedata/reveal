/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test } from 'vitest';

import { Range3 } from './Range3';
import { Box3, Plane, Vector3 } from 'three';
import { expectEqualVector3 } from '../../../../../tests/tests-utilities/primitives/primitiveTestUtil';

const min = new Vector3(100, 200, 300);
const max = new Vector3(400, 600, 800);
const mid = new Vector3().addVectors(min, max).divideScalar(2);
const delta = new Vector3().subVectors(max, min);

describe('Range3', () => {
  test('should test empty', () => {
    const range = new Range3();
    expect(range.isEmpty).toBe(true);

    range.set(min, max);
    expect(range.isEmpty).toBe(false);

    range.makeEmpty();
    expect(range.isEmpty).toBe(true);
  });

  test('should test non empty getters', () => {
    const range = new Range3(min, max);
    expect(range.isEmpty).toBe(false);
    expect(range.min).toStrictEqual(min);
    expect(range.max).toStrictEqual(max);
    expect(range.delta).toStrictEqual(delta);
    expect(range.center).toStrictEqual(mid);
    expect(range.diagonal).toStrictEqual(min.distanceTo(max));
    expect(range.area).toStrictEqual(
      2 * (delta.x * delta.y + delta.y * delta.z + delta.z * delta.x)
    );
    expect(range.volume).toStrictEqual(delta.x * delta.y * delta.z);
  });

  test('should test non empty get functions', () => {
    const range = new Range3(min, max);
    expect(range.getMin(new Vector3())).toStrictEqual(min);
    expect(range.getMax(new Vector3())).toStrictEqual(max);
    expect(range.getDelta(new Vector3())).toStrictEqual(delta);
    expect(range.getCenter(new Vector3())).toStrictEqual(mid);
    expect(range.getBox()).toStrictEqual(new Box3(min, max));
  });

  test('should test getCornerPoint', () => {
    const corners = new Array(8).fill(null).map(() => new Vector3());
    const range = new Range3(min, max);
    range.getCornerPoints(corners);

    // Check that each point is in the corner
    for (const cornerPoint of corners) {
      expect(cornerPoint.x === min.x || cornerPoint.x === max.x).toBe(true);
      expect(cornerPoint.y === min.y || cornerPoint.y === max.y).toBe(true);
      expect(cornerPoint.z === min.z || cornerPoint.z === max.z).toBe(true);
    }
    // Check that all points are unique
    const uniqueCorners = [...new Set(corners)];
    expect(uniqueCorners.length).toBe(8);
  });

  test('should test equals', () => {
    const range = new Range3(min, max);
    expect(range.equals(new Range3(min, max))).toBe(true);
    expect(range.equals(new Range3(min, mid))).toBe(false);
    expect(range.equals(new Range3(mid, max))).toBe(false);
  });

  test('should test clone', () => {
    const range = new Range3(min, max);
    expect(range.equals(range.clone())).toBe(true);

    range.makeEmpty();
    expect(range.equals(range.clone())).toBe(true);
  });

  test('should test isInside', () => {
    const range = new Range3(min, max);
    expect(range.isInside(min)).toBe(true);
    expect(range.isInside(mid)).toBe(true);
    expect(range.isInside(max)).toBe(true);
    expect(range.isInside(min.clone().subScalar(2))).toBe(false);
    expect(range.isInside(max.clone().addScalar(2))).toBe(false);
  });

  test('should test copy', () => {
    const expected = new Range3(min, max);
    const actual = new Range3();
    actual.copy(new Box3(min, max));
    expect(expected).toStrictEqual(actual);
  });

  test('should test set', () => {
    const range = new Range3();
    range.set(min, max);
    expect(range.min).toStrictEqual(min);
    expect(range.max).toStrictEqual(max);
    expect(range.isEmpty).toBe(false);
  });

  test('should test translate', () => {
    const range = new Range3(min, max);
    const translation = new Vector3(2, 2, 2);
    range.translate(translation);
    expect(range).toStrictEqual(
      new Range3(min.clone().add(translation), max.clone().add(translation))
    );
  });

  test('should test scale', () => {
    const range = new Range3(min, max);
    range.scale(2);
    expect(range).toStrictEqual(
      new Range3(min.clone().multiplyScalar(2), max.clone().multiplyScalar(2))
    );
  });

  test('should test add', () => {
    const range = new Range3();
    range.add(min);
    range.add(mid);
    range.add(max);
    expect(range).toStrictEqual(new Range3(min, max));
  });

  test('should test addHorizontal', () => {
    const actual = new Range3();
    actual.addHorizontal(min);
    actual.addHorizontal(mid);
    actual.addHorizontal(max);
    actual.z.add(0); // Prevent Z to not be empty

    const expected = new Range3(new Vector3(min.x, min.y, 0), new Vector3(max.x, max.y, 0));
    expect(actual).toStrictEqual(expected);
  });

  test('should test addRange', () => {
    const range = new Range3();
    range.addRange(new Range3(min, mid));
    range.addRange(new Range3(mid, max));
    expect(range).toStrictEqual(new Range3(min, max));
  });

  test('should test expandByMargin', () => {
    const range = new Range3(min, max);
    const margin = 5;
    range.expandByMargin(margin);
    expect(range).toStrictEqual(
      new Range3(min.clone().subScalar(margin), max.clone().addScalar(margin))
    );

    range.set(min, max);
    range.expandByMargin(-margin);
    expect(range).toStrictEqual(
      new Range3(min.clone().subScalar(-margin), max.clone().addScalar(-margin))
    );
  });

  test('should test expandByMargin3', () => {
    const range = new Range3(min, max);
    const margin = new Vector3(2, 3, 4);
    range.expandByMargin3(margin);
    expect(range).toStrictEqual(new Range3(min.clone().sub(margin), max.clone().add(margin)));

    range.set(min, max);
    margin.negate();
    range.expandByMargin3(margin);
    expect(range).toStrictEqual(new Range3(min.clone().sub(margin), max.clone().add(margin)));
  });

  test('should test expandByFraction', () => {
    const range = new Range3(min, max);
    range.expandByFraction(0.05);
    expect(range).toStrictEqual(new Range3(new Vector3(85, 180, 275), new Vector3(415, 620, 825)));
  });

  test('should test createCube', () => {
    const halfSize = 2;
    const actual = Range3.createCube(halfSize);

    const expected = new Range3();
    expected.add(new Vector3());
    expected.expandByMargin(halfSize);
    expect(actual).toStrictEqual(expected);
  });

  test('should test getCircleRangeMargin', () => {
    const radius = 2;
    for (let component = 0; component < 3; component++) {
      const normal = new Vector3();
      normal.setComponent(component, 1);
      const actual = Range3.getCircleRangeMargin(normal, radius);

      // Create the expected margin
      const expected = new Vector3();
      for (let i = 0; i < 3; i++) {
        if (i !== component) {
          expected.setComponent(i, radius);
        }
      }
      expect(actual).toStrictEqual(expected);
    }
  });

  test('should test getHorizontalIntersection', () => {
    const range = new Range3(min, max);
    const plane = new Plane(new Vector3(0, 0, 1), 0);
    for (let cornerIndex = 0; cornerIndex < 8; cornerIndex++) {
      const intersection = range.getHorizontalIntersection(plane, cornerIndex);
      const cornerPoint = range.getCornerPoint(cornerIndex, new Vector3());
      cornerPoint.z = 0;
      intersection.z = 0;
      expectEqualVector3(cornerPoint, intersection);
    }
  });

  describe('should test getVerticalPlaneIntersection', () => {
    const range = new Range3(min, max);
    const start = new Vector3();
    const end = new Vector3();

    test('with X-plane', () => {
      const plane = new Plane().setFromNormalAndCoplanarPoint(new Vector3(1, 0, 0), mid);

      for (const isTop of [true, false]) {
        expect(range.getVerticalPlaneIntersection(plane, isTop, start, end)).toBe(true);
        expectEqualVector3(start, new Vector3(mid.x, min.y, isTop ? max.z : min.z));
        expectEqualVector3(end, new Vector3(mid.x, max.y, isTop ? max.z : min.z));
      }
    });
    test('with Y-plane', () => {
      const plane = new Plane().setFromNormalAndCoplanarPoint(new Vector3(0, 1, 0), mid);
      for (const isTop of [true, false]) {
        expect(range.getVerticalPlaneIntersection(plane, isTop, start, end)).toBe(true);
        expectEqualVector3(start, new Vector3(max.x, mid.y, isTop ? max.z : min.z));
        expectEqualVector3(end, new Vector3(min.x, mid.y, isTop ? max.z : min.z));
      }
    });
    test('with Z-plane', () => {
      const plane = new Plane().setFromNormalAndCoplanarPoint(new Vector3(0, 0, 1), mid);
      for (const isTop of [true, false]) {
        expect(range.getVerticalPlaneIntersection(plane, isTop, start, end)).toBe(false);
      }
    });
  });

  test('should test various operation with empty', () => {
    const range = new Range3();
    expect(range.isEmpty).toBe(true);
    range.translate(min);
    expect(range.isEmpty).toBe(true);
    range.scale(2);
    expect(range.isEmpty).toBe(true);
    range.expandByMargin(1);
    expect(range.isEmpty).toBe(true);
    range.expandByFraction(1);
    expect(range.isEmpty).toBe(true);
  });
});
