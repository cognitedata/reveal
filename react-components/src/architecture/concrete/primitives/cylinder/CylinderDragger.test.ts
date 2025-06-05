import { assert, describe, expect, test } from 'vitest';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';
import { CylinderDragger } from './CylinderDragger';
import { expectEqualVector3 } from '../../../../../tests/tests-utilities/primitives/primitiveTestUtil';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Matrix4, Ray, Vector3 } from 'three';
import { MeasureCylinderDomainObject } from '../../measurements/MeasureCylinderDomainObject';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { type CreateDraggerProps } from '../../../base/domainObjects/VisualDomainObject';
import { type CylinderDomainObject } from './CylinderDomainObject';
import {
  createIntersectionMock,
  drag,
  getTestCases,
  getTestCasesWithSign
} from '#test-utils/architecture/baseDraggerUtil';

describe(CylinderDragger.name, () => {
  test('should not create correct dragger when focus type is None', () => {
    const domainObject = createVerticalCylinderDomainObject();
    const startRay = new Ray(new Vector3(0, 0, 2), new Vector3(0, 0, -1));
    const dragger = domainObject.createDragger(
      createCreateDraggerPropsMock(domainObject, startRay, 2, FocusType.None)
    );
    expect(dragger).toBeUndefined();
  });

  test('should not change when illegal focus type', () => {
    const focusType = FocusType.Focus;
    const domainObject = createVerticalCylinderDomainObject();
    const direction = new Vector3(0, 0, -1);
    const startRay = new Ray(new Vector3(0, 0, 2), direction);
    const delta = new Vector3(1, 2, 0);

    const expectedBox = clone(domainObject.cylinder);
    const dragger = domainObject.createDragger(
      createCreateDraggerPropsMock(domainObject, startRay, 5, focusType)
    );
    assert(dragger !== undefined);
    expect(dragger).instanceOf(CylinderDragger);
    drag(dragger, startRay, delta, { expectedChange: false, shiftKey: false });
    expectEqual(domainObject, expectedBox, focusType);
  });

  test('translate the cylinder', () => {
    const focusType = FocusType.Body;
    for (const testCase of getTestCasesWithSign()) {
      const { sign } = testCase;
      const domainObject = createVerticalCylinderDomainObject();

      // Grab the cylinder at top cap from above and move it in the XY plane
      const direction = new Vector3(0, 0, -sign);
      const startRay = new Ray(new Vector3(0, 0, sign * 2), direction);
      const delta = new Vector3();

      const expectedCylinder = clone(domainObject.cylinder);
      if (testCase.expectedChange) {
        delta.set(1, 2, 0);
        expectedCylinder.centerA.add(delta);
        expectedCylinder.centerB.add(delta);
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, sign > 0 ? 5 : 2, focusType)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, testCase);
      expectEqual(domainObject, expectedCylinder, focusType);
    }
  });

  test('change radius of cylinder', () => {
    const focusType = FocusType.Face;
    for (const testCase of getTestCases()) {
      const domainObject = createVerticalCylinderDomainObject();

      // Grab the cylinder from the side and move it away from the center
      const direction = new Vector3(0, 1, 0);
      const startRay = new Ray(new Vector3(1, -2, 0), direction);
      const delta = new Vector3();

      const expectedCylinder = clone(domainObject.cylinder);
      if (testCase.expectedChange) {
        delta.x = 1;
        expectedCylinder.radius += 1;
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, 0, focusType)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, testCase);
      expectEqual(domainObject, expectedCylinder, focusType);
    }
  });

  test('change the length of the cylinder by moving the end caps up or down', () => {
    // Vertical plane with Z-axis up, ad X axis to right (sign is 1)
    //
    // Ray    Start   End
    //      (1,2)  (2,2)
    //         *  *
    //       /   /
    //  +---A---+  z=1  A: Start end cap
    //  |    /  |       B: End end cap
    // -----B----- z=0
    //  |       |
    //  +-------+

    const focusType = FocusType.Face;
    for (const testCase of getTestCasesWithSign()) {
      const { sign } = testCase;
      const domainObject = createVerticalCylinderDomainObject();
      const direction = new Vector3(-1, 0, -sign).normalize();
      const startRay = new Ray(new Vector3(1, 0, sign * 2), direction);
      const delta = new Vector3();

      const expectedCylinder = clone(domainObject.cylinder);
      if (testCase.expectedChange) {
        if (sign > 0) {
          expectedCylinder.centerA.z = 0;
        } else {
          expectedCylinder.centerB.z = 0;
        }
        delta.x = 1;
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, sign > 0 ? 5 : 2, focusType)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, testCase);
      expectEqual(domainObject, expectedCylinder, focusType);
    }
  });

  test('rotate the cylinder by moving one of the end caps', () => {
    // Vertical plane with Z-axis up, ad X axis to right (sign is 1)
    //
    // Ray   Start                  End
    //      (1,2)                  (2,2)
    //         *                    *
    //       /                     /
    //  +---A---+             +--_A_
    //  |       |            /      --+
    // -----------          /        /
    //  |       |          /        /
    //  +---B---+         +--_B_   /
    //                          --+

    const focusType = FocusType.Rotation;
    for (const testCase of getTestCasesWithSign()) {
      const { sign } = testCase;
      const domainObject = createVerticalCylinderDomainObject();
      const direction = new Vector3(-1, 0, -sign).normalize();
      const startRay = new Ray(new Vector3(1, 0, sign * 2), direction);
      const delta = new Vector3();

      const expectedCylinder = clone(domainObject.cylinder);
      if (testCase.expectedChange) {
        delta.x = 1;
        if (sign > 0) {
          expectedCylinder.centerA.set(0.894427, 0, 0.788854);
        } else {
          expectedCylinder.centerB.set(0.894427, 0, -0.788854);
        }
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, sign > 0 ? 5 : 2, focusType)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, testCase);
      expectEqual(domainObject, expectedCylinder, focusType);
    }
  });

  test('translate horizontal circle along the axis', () => {
    // Vertical plane with Z-axis up, ad X axis to right (sign is 1)
    //
    // Ray    Start   End
    //      (1,2)  (2,2)
    //         *  *
    //       /   /
    //  +-------+ z = 0     Start
    //
    //  +-------+ z = -1    End

    const focusType = FocusType.Face;
    for (const testCase of getTestCasesWithSign()) {
      const { sign } = testCase;
      const domainObject = createHorizontalCircleDomainObject();
      const direction = new Vector3(-1, 0, -sign).normalize();
      const startRay = new Ray(direction.clone().negate(), direction);
      const delta = new Vector3();

      const expectedCylinder = clone(domainObject.cylinder);
      if (testCase.expectedChange) {
        expectedCylinder.centerA.z += -sign;
        expectedCylinder.centerB.z += -sign;
        delta.x = 1;
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, sign > 0 ? 5 : 2, focusType)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, testCase);
      expectEqual(domainObject, expectedCylinder, focusType);
    }
  });
});

function createCreateDraggerPropsMock(
  domainObject: CylinderDomainObject,
  ray: Ray,
  faceIndex: number,
  focusType: FocusType
): CreateDraggerProps {
  const point = domainObject.cylinder.intersectRay(ray, new Matrix4());
  if (point === undefined) {
    throw new Error('No intersection found for the ray and cylinder');
  }
  const intersection = createIntersectionMock(domainObject, faceIndex, focusType);
  return { intersection, point, ray };
}

function createVerticalCylinderDomainObject(): CylinderDomainObject {
  const domainObject = new MeasureCylinderDomainObject(PrimitiveType.VerticalCylinder);
  domainObject.cylinder.radius = 1;
  domainObject.cylinder.centerA.set(0, 0, +1);
  domainObject.cylinder.centerB.set(0, 0, -1);
  return domainObject;
}

function createHorizontalCircleDomainObject(): CylinderDomainObject {
  const domainObject = new MeasureCylinderDomainObject(PrimitiveType.HorizontalCircle);
  domainObject.cylinder.radius = 1;
  domainObject.cylinder.centerA.set(0, 0, +Cylinder.HalfMinSize);
  domainObject.cylinder.centerB.set(0, 0, -Cylinder.HalfMinSize);
  return domainObject;
}

function clone(cylinder: Cylinder): Cylinder {
  return new Cylinder().copy(cylinder);
}

function expectEqual(
  domainObject: CylinderDomainObject,
  expectedCylinder: Cylinder,
  focusType: FocusType
): void {
  expectEqualVector3(domainObject.cylinder.centerA, expectedCylinder.centerA);
  expectEqualVector3(domainObject.cylinder.centerB, expectedCylinder.centerB);
  expect(domainObject.cylinder.radius).toBeCloseTo(expectedCylinder.radius);
  expect(domainObject.focusType).toBe(focusType);
}
