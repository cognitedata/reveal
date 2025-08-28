import { describe, expect, test } from 'vitest';
import { Vector3 } from 'three';
import { expectEqualVector3 } from '../../../../../tests/tests-utilities/primitives/primitiveTestUtil';
import { Cylinder } from './Cylinder';

describe(Cylinder.name, () => {
  test('should construct a vertical cylinder', () => {
    const expectedAxis = new Vector3(0, 0, 1);
    const expectedCenter = new Vector3(1, 2, 3);
    const expectedHeight = 5;
    const expectedRadius = 4;

    const cylinder = new Cylinder(expectedCenter, expectedAxis, expectedRadius, expectedHeight);
    expectEqualVector3(cylinder.axis, expectedAxis.normalize());
    expectEqualVector3(cylinder.center, expectedCenter);
    expectEqualVector3(cylinder.centerA, new Vector3(1, 2, 3 + expectedHeight / 2));
    expectEqualVector3(cylinder.centerB, new Vector3(1, 2, 3 - expectedHeight / 2));
    expect(cylinder.height).toBe(expectedHeight);
    expect(cylinder.radius).toBe(expectedRadius);
  });

  test('should construct a vertical cylinder with axis going down', () => {
    const inputAxis = new Vector3(1, 2, -3);
    const expectedAxis = inputAxis.clone().normalize().negate();
    const cylinder = new Cylinder(new Vector3(1, 2, -3), inputAxis, 5, 6);
    expectEqualVector3(cylinder.axis, expectedAxis);
  });

  test('should create a matrix that aligned the cylinder with Z axis and centered at origin ', () => {
    const expectedAxis = new Vector3(-7, -2, 1);
    const expectedCenter = new Vector3(1, 2, 3);
    const expectedHeight = 5;

    const cylinder = new Cylinder(expectedCenter, expectedAxis, 5, expectedHeight);
    const matrix = cylinder.getTranslationRotationMatrix();
    matrix.invert();

    const center = cylinder.center.clone();
    const centerA = cylinder.centerA.clone();
    const centerB = cylinder.centerB.clone();

    center.applyMatrix4(matrix);
    centerA.applyMatrix4(matrix);
    centerB.applyMatrix4(matrix);

    // Check that the cylinder now is aligned with Z axis and centered at origin
    expectEqualVector3(center, new Vector3(0, 0, 0));
    expectEqualVector3(centerA, new Vector3(0, 0, +expectedHeight / 2));
    expectEqualVector3(centerB, new Vector3(0, 0, -expectedHeight / 2));
  });
});
