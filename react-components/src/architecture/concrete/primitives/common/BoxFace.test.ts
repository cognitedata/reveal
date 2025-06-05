import { describe, expect, test } from 'vitest';
import { Matrix4, Vector2, Vector3 } from 'three';
import { BoxFace } from './BoxFace';
import { isPointVisibleByPlanes } from '@cognite/reveal';

describe(BoxFace.name, () => {
  test('should have correct properties, face, index, sign and tangent index', () => {
    for (let face = 0; face < 6; face++) {
      const boxFace = new BoxFace(face);
      expect(boxFace.face).toBe(face);
      expect(boxFace.index).toBe(face % 3);
      expect(boxFace.sign).toBe(face < 3 ? 1 : -1);
      expect(boxFace.tangentIndex1).toBe((boxFace.index + 1) % 3);
      expect(boxFace.tangentIndex2).toBe((boxFace.index + 2) % 3);
    }
  });
  test('Should set face', () => {
    const face = new BoxFace();
    expect(face.face).toBe(0);
    face.face = 2;
    expect(face.index).toBe(2);
  });

  test('should copy and check if equal', () => {
    const a = new BoxFace(2);
    const b = new BoxFace(4);
    expect(a.equals(b)).toBe(false);
    b.copy(a);
    expect(b.equals(a)).toBe(true);
  });

  test('should get correct position from fromPositionAtFace', () => {
    const faces = [
      { position: new Vector3(1, 0, 0), expected: 0 },
      { position: new Vector3(-1, 0, 0), expected: 3 },
      { position: new Vector3(0, 1, 0), expected: 1 },
      { position: new Vector3(0, -1, 0), expected: 4 },
      { position: new Vector3(0, 0, 1), expected: 2 },
      { position: new Vector3(0, 0, -1), expected: 5 }
    ];
    for (const { position, expected } of faces) {
      const boxFace = new BoxFace();
      boxFace.fromPositionAtFace(position);
      expect(boxFace.face).toBe(expected);
    }
  });

  test('should return correct plane point (a 2D version on the 3D point)', () => {
    const expected = new Vector2(2, 3);
    const boxFace = new BoxFace(0);
    expect(boxFace.getPlanePoint(new Vector3(0, 2, 3))).toEqual(expected);
    boxFace.face = 1;
    expect(boxFace.getPlanePoint(new Vector3(2, 0, 3))).toEqual(expected);
    boxFace.face = 2;
    expect(boxFace.getPlanePoint(new Vector3(2, 3, 0))).toEqual(expected);
    boxFace.face = 3;
    expect(boxFace.getPlanePoint(new Vector3(0, 2, 3))).toEqual(expected);
    boxFace.face = 4;
    expect(boxFace.getPlanePoint(new Vector3(2, 0, 3))).toEqual(expected);
    boxFace.face = 5;
    expect(boxFace.getPlanePoint(new Vector3(2, 3, 0))).toEqual(expected);
  });

  test('should get the center', () => {
    for (let face = 0; face < 6; face++) {
      const boxFace = new BoxFace(face);
      const center = boxFace.getCenter();
      expect(center.getComponent(boxFace.index)).toBeCloseTo(boxFace.sign * 0.5);
      expect(center.length()).toBeCloseTo(0.5);
    }
  });
  test('should get the normal', () => {
    for (let face = 0; face < 6; face++) {
      const boxFace = new BoxFace(face);
      const normal = boxFace.getNormal();
      expect(normal.getComponent(boxFace.index)).toBe(boxFace.sign);
      expect(normal.length()).toBe(1);
    }
  });

  test('should get the tangents', () => {
    for (let face = 0; face < 6; face++) {
      const boxFace = new BoxFace(face);
      const tangent1 = boxFace.getTangent1();
      const tangent2 = boxFace.getTangent2();
      expect(tangent1.getComponent(boxFace.tangentIndex1)).toBe(1);
      expect(tangent2.getComponent(boxFace.tangentIndex2)).toBe(1);
      expect(tangent1.length()).toBe(1);
      expect(tangent2.length()).toBe(1);
    }
  });

  test('should get all faces as a generator', () => {
    const faces = [];
    for (const boxFace of BoxFace.getAllFaces()) {
      faces.push(boxFace.face);
    }
    expect(faces).toEqual([0, 1, 2, 3, 4, 5]);
  });

  test('should create 4 or 6 planes', () => {
    for (const exceptIndex of [undefined, 0]) {
      const identity = new Matrix4();
      const planes = BoxFace.createClippingPlanes(identity, exceptIndex);
      expect(planes).toHaveLength(exceptIndex === undefined ? 6 : 4);

      const sum = new Vector3();
      for (const plane of planes) {
        expect(plane.normal.length()).toBeCloseTo(1);
        expect(Math.abs(plane.constant)).toBeCloseTo(0.5);
        sum.add(plane.normal);
      }
      expect(sum.length()).toBeCloseTo(0);
      expect(isPointVisibleByPlanes(planes, new Vector3(0, 0, 0))).toBe(true);
      expect(isPointVisibleByPlanes(planes, new Vector3(2, 2, 2))).toBe(false);
    }
  });

  test('should compare two box faces whee some can be undefined', () => {
    const a = new BoxFace(1);
    const b = new BoxFace(1);
    const c = new BoxFace(2);
    expect(BoxFace.equals(a, b)).toBe(true);
    expect(BoxFace.equals(a, c)).toBe(false);
    expect(BoxFace.equals(undefined, undefined)).toBe(true);
    expect(BoxFace.equals(a, undefined)).toBe(false);
    expect(BoxFace.equals(undefined, b)).toBe(false);
  });
});
