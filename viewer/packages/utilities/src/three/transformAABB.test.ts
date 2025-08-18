/*!
 * Copyright 2025 Cognite AS
 */
import { Box3, Matrix4, Vector3 } from 'three';
import { transformAABB } from './transformAABB';

describe(transformAABB.name, () => {
  test('should correctly transform a box with a translation matrix', () => {
    const box = new Box3(new Vector3(0, 0, 0), new Vector3(1, 1, 1));
    const translationMatrix = new Matrix4().makeTranslation(2, 3, 4);

    const result = transformAABB(box, translationMatrix);

    expect(result.min).toEqual(new Vector3(2, 3, 4));
    expect(result.max).toEqual(new Vector3(3, 4, 5));
  });

  test('should correctly transform a box with a scaling matrix', () => {
    const box = new Box3(new Vector3(0, 0, 0), new Vector3(1, 1, 1));
    const scalingMatrix = new Matrix4().makeScale(2, 3, 4);

    const result = transformAABB(box, scalingMatrix);

    expect(result.min).toEqual(new Vector3(0, 0, 0));
    expect(result.max).toEqual(new Vector3(2, 3, 4));
  });

  test('should correctly transform a box with a rotation matrix', () => {
    const box = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1));
    const rotationMatrix = new Matrix4().makeRotationY(Math.PI / 2);

    const result = transformAABB(box, rotationMatrix);

    // After rotation, the x and z coordinates should be swapped
    expect(result.min.x).toBeCloseTo(-1);
    expect(result.min.y).toBeCloseTo(-1);
    expect(result.min.z).toBeCloseTo(-1);
    expect(result.max.x).toBeCloseTo(1);
    expect(result.max.y).toBeCloseTo(1);
    expect(result.max.z).toBeCloseTo(1);
  });

  test('should correctly transform a box with a complex transformation', () => {
    const box = new Box3(new Vector3(0, 0, 0), new Vector3(1, 1, 1));
    const matrix = new Matrix4().makeTranslation(2, 3, 4).multiply(new Matrix4().makeScale(2, 2, 2));

    const result = transformAABB(box, matrix);

    expect(result.min).toEqual(new Vector3(2, 3, 4));
    expect(result.max).toEqual(new Vector3(4, 5, 6));
  });

  test('should not change the box with an identity matrix', () => {
    const box = new Box3(new Vector3(1, 2, 3), new Vector3(4, 5, 6));
    const identityMatrix = new Matrix4();

    const result = transformAABB(box, identityMatrix);

    expect(result.min).toEqual(box.min);
    expect(result.max).toEqual(box.max);
  });

  test('should handle a degenerate box correctly', () => {
    const box = new Box3(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
    const translationMatrix = new Matrix4().makeTranslation(1, 1, 1);

    const result = transformAABB(box, translationMatrix);

    expect(result.min).toEqual(new Vector3(1, 1, 1));
    expect(result.max).toEqual(new Vector3(1, 1, 1));
  });
});
