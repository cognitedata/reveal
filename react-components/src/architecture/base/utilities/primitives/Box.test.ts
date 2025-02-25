/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { Box } from './Box';
import { PrimitiveType } from './PrimitiveType';
import { Box3, Euler, Matrix4, Ray, Vector3 } from 'three';
import {
  expectEqualMatrix4,
  expectEqualBox3,
  expectEqualVector3,
  expectEqualEuler
} from './primitiveUtil.test';
import { isVoidExpression } from 'typescript';

describe('Box', () => {
  test('Should test all properties on regular box', () => {
    const box = createRegularBox();
    expect(box.primitiveType).toBe(PrimitiveType.Box);
    expect(box.diagonal).toBe(3.7416573867739413);
    expect(box.area).toBe(22);
    expect(box.volume).toBe(6);
    expect(box.hasHorizontalArea).toBe(true);
    expect(box.hasArea).toBe(true);
    expect(box.hasVolume).toBe(true);
    expect(box.horizontalArea).toBe(2);
    expect(box.hasXYRotation).toBe(false);
    expect(box.zRotationInDegrees).toBe(0);

    expect(box.getRotationInDegrees(0)).toBe(0);
    expect(box.getRotationInDegrees(1)).toBe(0);
    expect(box.getRotationInDegrees(2)).toBe(0);
    expect(box.getRotationAngleByComponent(0)).toBe(0);
    expect(box.getRotationAngleByComponent(1)).toBe(0);
    expect(box.getRotationAngleByComponent(2)).toBe(0);
  });

  test('Should test all properties on flat box', () => {
    const box = createFlatBox();
    expect(box.hasHorizontalArea).toBe(true);
    expect(box.hasArea).toBe(true);
    expect(box.hasVolume).toBe(false);
    expect(box.horizontalArea).toBe(2);
  });

  test('should test get and set matrix on regular box', () => {
    const box = createRegularBox();
    const matrix = box.getMatrix();
    box.setMatrix(matrix);
    expectEqualMatrix4(matrix, box.getMatrix());
  });

  test('should test get and set matrix on rotated box', () => {
    const box = createRotatedBox();
    const matrix = box.getMatrix();
    box.setMatrix(matrix);
    expectEqualMatrix4(matrix, box.getMatrix());
  });

  test('should test expandBoundingBox', () => {
    const box = createRegularBox();
    const boundingBox = new Box3();
    box.expandBoundingBox(boundingBox);
    expectEqualBox3(boundingBox, new Box3(new Vector3(3.5, 4, 4.5), new Vector3(4.5, 6, 7.5)));
  });

  test('should test isPointInside', () => {
    const box = createRegularBox();
    expect(box.isPointInside(box.center, new Matrix4())).toBe(true);
    expect(box.isPointInside(new Vector3(0, 0, 0), new Matrix4())).toBe(false);
  });

  test('should test intersectRay', () => {
    const box = createRegularBox();

    for (let i = 0; i < 3; i++) {
      // Go along X, Y, Z axis towards the box center, starting from 0 for each axis
      const center = box.center.clone();
      center.setComponent(i, 0);
      const direction = new Vector3();
      direction.setComponent(i, 1);

      const intersectionExpect = box.center.clone();
      intersectionExpect.setComponent(i, box.center.getComponent(i) - box.size.getComponent(i) / 2);

      const ray = new Ray(center, direction);
      const intersection = box.intersectRay(ray, new Matrix4());
      expectEqualVector3(intersection, intersectionExpect);
    }
  });

  test('should test copy', () => {
    const box = createRotatedBox();
    const other = new Box();
    expect(other.copy(box)).toStrictEqual(box);
  });

  test('should test clear', () => {
    const box = createRotatedBox();
    box.clear();
    expectEqualVector3(box.center, new Vector3());
    expectEqualVector3(box.size, new Vector3(Box.MinSize, Box.MinSize, Box.MinSize));
    expectEqualEuler(box.rotation, new Euler(0, 0, 0));
  });

  test('should test forceMinSize', () => {
    const box = new Box();
    box.size.set(0, 0, 0);
    box.forceMinSize();
    expectEqualVector3(box.size, new Vector3(Box.MinSize, Box.MinSize, Box.MinSize));
    expect(box.hasHorizontalArea).toBe(false);
    expect(box.hasArea).toBe(false);
    expect(box.hasVolume).toBe(false);
  });
});

function createRegularBox(): Box {
  const box = new Box();
  box.size.set(1, 2, 3);
  box.center.set(4, 5, 6);
  return box;
}

function createRotatedBox(): Box {
  const box = new Box();
  box.size.set(1, 2, 3);
  box.center.set(4, 5, 6);
  box.rotation.set(0.1, 0.2, 0.3);
  return box;
}

function createFlatBox(): Box {
  const box = new Box();
  box.size.set(1, 2, Box.MinSize);
  box.center.set(4, 5, 6);
  return box;
}
