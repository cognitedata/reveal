/*!
 * Copyright 2020 Cognite AS
 */

import { vec3 } from 'gl-matrix';
import { Box3 } from '../../utils/Box3';

describe('Box3', () => {
  test('containsPoint, unit box', () => {
    const box = Box3.fromBounds(-1, -1, -1, 1, 1, 1);

    expect(box.containsPoint(vec3.fromValues(-2, 0, 0))).toBeFalse();
    expect(box.containsPoint(vec3.fromValues(0, -2, 0))).toBeFalse();
    expect(box.containsPoint(vec3.fromValues(0, 0, -2))).toBeFalse();
    expect(box.containsPoint(vec3.fromValues(2, 0, 0))).toBeFalse();
    expect(box.containsPoint(vec3.fromValues(0, 2, 0))).toBeFalse();
    expect(box.containsPoint(vec3.fromValues(0, 0, 2))).toBeFalse();

    expect(box.containsPoint(vec3.fromValues(0, 0, 0))).toBeTrue();
    expect(box.containsPoint(vec3.fromValues(-1, -1, -1))).toBeTrue();
    expect(box.containsPoint(vec3.fromValues(1, 1, 1))).toBeTrue();
    expect(box.containsPoint(vec3.fromValues(0.5, 0.5, 0.5))).toBeTrue();
  });

  test('intersectsBox with overlap', () => {
    const box1 = Box3.fromBounds(0, 0, 0, 1, 1, 1);
    const box2 = Box3.fromBounds(0.5, 0.5, 0.5, 1.5, 1.5, 1.5);
    expect(box1.intersectsBox(box2)).toBeTrue();
  });

  test('intersectsBox without overlap', () => {
    const box1 = Box3.fromBounds(0, 1, 2, 3, 4, 5);
    const box2 = Box3.fromBounds(11, 12, 13, 14, 15, 16);
    expect(box1.intersectsBox(box2)).toBeFalse();
  });

  test('intersectsBox share one corner, returns true', () => {
    const box1 = Box3.fromBounds(0, 1, 2, 3, 4, 5);
    const box2 = Box3.fromBounds(3, 4, 5, 6, 7, 8);
    expect(box1.intersectsBox(box2)).toBeTrue();
  });

  test('intersectsBox overlap except in X, return false', () => {
    const box1 = Box3.fromBounds(0, 0, 0, 1, 1, 1);
    const box2 = Box3.fromBounds(1.5, 0, 0, 2.5, 1, 1);
    expect(box1.intersectsBox(box2)).toBeFalse();
  });

  test('intersectsBox overlap except in Y, return false', () => {
    const box1 = Box3.fromBounds(0, 0, 0, 1, 1, 1);
    const box2 = Box3.fromBounds(0, 1.5, 0, 1, 2.5, 1);
    expect(box1.intersectsBox(box2)).toBeFalse();
  });

  test('intersectsBox overlap except in Z, return false', () => {
    const box1 = Box3.fromBounds(0, 0, 0, 1, 1, 1);
    const box2 = Box3.fromBounds(0, 0, 1.5, 1, 1, 2.5);
    expect(box1.intersectsBox(box2)).toBeFalse();
  });

  test('size, returns correct size', () => {
    expect(new Box3([v(-1, -2, -3), v(2, 3, 4)]).size).toEqual(v(3, 5, 7));
    expect(new Box3([v(1, 1, 1), v(1, 1, 1)]).size).toEqual(v(0, 0, 0));
  });

  test('fromCenterAndSize', () => {
    const box = Box3.fromCenterAndSize(vec3.fromValues(0, 1, 2), vec3.fromValues(2, 4, 6));
    expect(box.center).toEqual(vec3.fromValues(0, 1, 2));
    expect(box.size).toEqual(vec3.fromValues(2, 4, 6));
    expect(box.min).toEqual(vec3.fromValues(-1, -2, -3));
    expect(box.max).toEqual(vec3.fromValues(1, 2, 3));
  });
});

function v(x: number, y: number, z: number): vec3 {
  return vec3.fromValues(x, y, z);
}
