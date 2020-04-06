/*!
 * Copyright 2020 Cognite AS
 */

import { vec3 } from 'gl-matrix';
import { Box3 } from '../../utils/Box3';

describe('Box3', () => {
  test('containsPoint, unit box', () => {
    const box = new Box3([vec3.fromValues(-1, -1, -1), vec3.fromValues(1, 1, 1)]);

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

  test('size, returns correct size', () => {
    expect(new Box3([v(-1, -2, -3), v(2, 3, 4)]).size).toEqual(v(3, 5, 7));
    expect(new Box3([v(1, 1, 1), v(1, 1, 1)]).size).toEqual(v(0, 0, 0));
  });
});

function v(x: number, y: number, z: number): vec3 {
  return vec3.fromValues(x, y, z);
}
