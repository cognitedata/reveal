/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { Box } from './Box';
import { PrimitiveType } from './PrimitiveType';
import { Box3, Euler, Matrix4, Quaternion, Ray, Vector3 } from 'three';
import {
  expectEqualMatrix4,
  expectEqualBox3,
  expectEqualVector3,
  expectEqualEuler
} from '../../../../../tests/tests-utilities/primitives/primitiveTestUtil';

describe('Box', () => {
  test('Should test setter and getter on base class', () => {
    const primitive = createRegularBox();
    primitive.confidence = 0.5;
    expect(primitive.confidence).toBe(0.5);
    primitive.label = 'box';
    expect(primitive.label).toBe('box');
  });

  test('Should test all properties on regular primitive', () => {
    const primitive = createRegularBox();
    expect(primitive.primitiveType).toBe(PrimitiveType.Box);
    expect(primitive.diagonal).toBe(3.7416573867739413);
    expect(primitive.area).toBe(22);
    expect(primitive.volume).toBe(6);
    expect(primitive.hasHorizontalArea).toBe(true);
    expect(primitive.hasArea).toBe(true);
    expect(primitive.hasVolume).toBe(true);
    expect(primitive.horizontalArea).toBe(2);
    expect(primitive.hasXYRotation).toBe(false);
    expect(primitive.zRotationInDegrees).toBe(0);

    expect(primitive.getRotationInDegrees(0)).toBe(0);
    expect(primitive.getRotationInDegrees(1)).toBe(0);
    expect(primitive.getRotationInDegrees(2)).toBe(0);
    expect(primitive.getRotationAngleByComponent(0)).toBe(0);
    expect(primitive.getRotationAngleByComponent(1)).toBe(0);
    expect(primitive.getRotationAngleByComponent(2)).toBe(0);
  });

  test('Should test all properties on rotated primitive', () => {
    const primitive = createRotatedBox();
    expect(primitive.primitiveType).toBe(PrimitiveType.Box);
    expect(primitive.diagonal).toBe(3.7416573867739413);
    expect(primitive.area).toBe(22);
    expect(primitive.volume).toBe(6);
    expect(primitive.hasHorizontalArea).toBe(true);
    expect(primitive.hasArea).toBe(true);
    expect(primitive.hasVolume).toBe(true);
    expect(primitive.horizontalArea).toBe(2);
    expect(primitive.verticalArea).toBe(3);
    expect(primitive.hasXYRotation).toBe(true);
    expect(primitive.zRotationInDegrees).not.toBe(0);

    expect(primitive.getRotationInDegrees(0)).not.toBe(0);
    expect(primitive.getRotationInDegrees(1)).not.toBe(0);
    expect(primitive.getRotationInDegrees(2)).not.toBe(0);
    expect(primitive.getRotationAngleByComponent(0)).not.toBe(0);
    expect(primitive.getRotationAngleByComponent(1)).not.toBe(0);
    expect(primitive.getRotationAngleByComponent(2)).not.toBe(0);
  });

  test('Should test all properties on flat primitive', () => {
    const primitive = createFlatBox();
    expect(primitive.hasHorizontalArea).toBe(true);
    expect(primitive.hasArea).toBe(true);
    expect(primitive.hasVolume).toBe(false);
    expect(primitive.horizontalArea).toBe(2);
  });

  test('should test get and set matrix on regular primitive', () => {
    const primitive = createRegularBox();
    const actual = primitive.getMatrix();
    primitive.setMatrix(actual);
    expectEqualMatrix4(actual, primitive.getMatrix());
  });

  test('should test getScaledMatrix', () => {
    const primitive = createRotatedBox();
    const actual = primitive.getScaledMatrix(primitive.size);

    const expected = new Matrix4().compose(
      primitive.center,
      new Quaternion().setFromEuler(primitive.rotation),
      primitive.size
    );
    expectEqualMatrix4(actual, expected);
  });

  test('should test getRotationMatrix', () => {
    const primitive = createRotatedBox();
    const actual = primitive.getRotationMatrix();
    const expected = new Matrix4().makeRotationFromEuler(primitive.rotation);
    expectEqualMatrix4(actual, expected);
  });

  test('should test get and set matrix on rotated primitive', () => {
    const primitive = createRotatedBox();
    const actual = primitive.getMatrix();
    primitive.setMatrix(actual);
    expectEqualMatrix4(actual, primitive.getMatrix());
  });

  test('should test expandBoundingBox', () => {
    const primitive = createRegularBox();
    const boundingBox = primitive.getBoundingBox();
    expectEqualBox3(boundingBox, new Box3(new Vector3(3.5, 4, 4.5), new Vector3(4.5, 6, 7.5)));
  });

  test('should test isPointInside', () => {
    const primitive = createRegularBox();
    expect(primitive.isPointInside(primitive.center, new Matrix4())).toBe(true);
    expect(primitive.isPointInside(new Vector3(0, 0, 0), new Matrix4())).toBe(false);
  });

  test('should test intersectRay', () => {
    const primitive = createRegularBox();

    for (let i = 0; i < 3; i++) {
      // Go along X, Y, Z axis towards the primitive center, starting from 0 for each axis
      const center = primitive.center.clone();
      center.setComponent(i, 0);
      const direction = new Vector3();
      direction.setComponent(i, 1);

      const intersectionExpect = primitive.center.clone();
      intersectionExpect.setComponent(
        i,
        primitive.center.getComponent(i) - primitive.size.getComponent(i) / 2
      );

      const ray = new Ray(center, direction);
      const intersection = primitive.intersectRay(ray, new Matrix4());
      expectEqualVector3(intersection, intersectionExpect);
    }
  });

  test('should test copy', () => {
    const primitive = createRotatedBox();
    const other = new Box();
    expect(other.copy(primitive)).toStrictEqual(primitive);
  });

  test('should test clear', () => {
    const primitive = createRotatedBox();
    primitive.clear();
    expectEqualVector3(primitive.center, new Vector3());
    expectEqualVector3(primitive.size, new Vector3(Box.MinSize, Box.MinSize, Box.MinSize));
    expectEqualEuler(primitive.rotation, new Euler(0, 0, 0));
  });

  test('should test forceMinSize', () => {
    const primitive = new Box();
    primitive.size.set(0, 0, 0);
    primitive.forceMinSize();
    expectEqualVector3(primitive.size, new Vector3(Box.MinSize, Box.MinSize, Box.MinSize));
    expect(primitive.hasHorizontalArea).toBe(false);
    expect(primitive.hasArea).toBe(false);
    expect(primitive.hasVolume).toBe(false);
  });
});

function createRegularBox(): Box {
  const primitive = new Box();
  primitive.size.set(1, 2, 3);
  primitive.center.set(4, 5, 6);
  return primitive;
}

function createRotatedBox(): Box {
  const primitive = new Box();
  primitive.size.set(1, 2, 3);
  primitive.center.set(4, 5, 6);
  primitive.rotation.set(0.1, 0.2, 0.3);
  return primitive;
}

function createFlatBox(): Box {
  const primitive = new Box();
  primitive.size.set(1, 2, Box.MinSize);
  primitive.center.set(4, 5, 6);
  return primitive;
}
