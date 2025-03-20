import { describe, expect, test } from 'vitest';
import { Matrix4, Vector2, Vector3 } from 'three';
import {
  getAbsMaxComponent,
  getHorizontalCrossProduct,
  getOctant,
  horizontalAngle,
  horizontalDistanceTo,
  rotateHorizontal,
  rotatePiHalf,
  verticalDistanceTo
} from './vectorExtensions';
import { expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';

describe('vectorExtensions', () => {
  test('should calculate horizontal angle', () => {
    expect(horizontalAngle(new Vector3(1, 0))).toBe(0);
    expect(horizontalAngle(new Vector3(0, 1))).toBe(Math.PI / 2);
    expect(horizontalAngle(new Vector3(-1, 0))).toBe(Math.PI);
    expect(horizontalAngle(new Vector3(0, -1))).toBe((3 * Math.PI) / 2);
    expect(horizontalAngle(new Vector3(1, 1))).toBe(Math.PI / 4);
  });

  test('should calculate horizontal distance', () => {
    const p1 = new Vector3(426.8, 123.8, 0);
    const p2 = new Vector3(845.8, 623.2, 0);
    expect(horizontalDistanceTo(p1, p2)).toBe(p1.distanceTo(p2));
    p1.negate();
    expect(horizontalDistanceTo(p1, p2)).toBe(p1.distanceTo(p2));
  });

  test('should calculate vertical distance', () => {
    const p1 = new Vector3(0, 0, 426.8);
    const p2 = new Vector3(0, 0, 845.8);
    expect(verticalDistanceTo(p1, p2)).toBe(p1.distanceTo(p2));
    p1.negate();
    expect(verticalDistanceTo(p1, p2)).toBe(p1.distanceTo(p2));
  });

  test('should rotate horizontal', () => {
    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, 2 * Math.PI];
    for (const angle of angles) {
      const actualVector = new Vector3(426.8, 123.8, 634);
      const matrix = new Matrix4().makeRotationZ(angle);
      const expectedVector = actualVector.clone().applyMatrix4(matrix);

      rotateHorizontal(actualVector, angle);
      expectEqualVector3(actualVector, expectedVector);
    }
  });

  test('should rotate Pi/2', () => {
    const actualVector = new Vector3(426.8, 123.8, 634);
    const matrix = new Matrix4().makeRotationZ(Math.PI / 2);
    const expectedVector = actualVector.clone().applyMatrix4(matrix);
    rotatePiHalf(actualVector);
    expectEqualVector3(actualVector, expectedVector);
  });

  test('should get the absolute maximal component of a vector', () => {
    const vectors = [new Vector3(9, 2, 1), new Vector3(2, 9, 1), new Vector3(1, 2, 9)];
    let expectedComponent = 0;
    for (const vector of vectors) {
      expect(getAbsMaxComponent(vector)).toBe(expectedComponent++);
    }
    expectedComponent = 0;
    for (const vector of vectors) {
      expect(getAbsMaxComponent(vector.negate())).toBe(expectedComponent++);
    }
  });

  test('should calculate horizontal cross product', () => {
    const p1 = new Vector3(426.8, 123.8, 0);
    const p2 = new Vector3(845.8, 623.2, 0);
    expect(getHorizontalCrossProduct(p1, p2)).toBe(new Vector3().crossVectors(p1, p2).z);
  });

  test('should calculate octant', () => {
    const yArray = [0, -0.3, 0.3]; // 0 is happy paths, the other are off by some fraction
    const center = new Vector2(0, 0);
    for (const y of yArray) {
      const vector = new Vector2(1, y);
      vector.multiplyScalar(100);
      for (let expectedOctant = 0; expectedOctant < 8; expectedOctant++) {
        expect(getOctant(vector)).toBe(expectedOctant);
        vector.rotateAround(center, Math.PI / 4);
      }
    }
  });
});
