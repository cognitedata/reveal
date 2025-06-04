import { assert, describe, expect, test } from 'vitest';
import { BoxFace } from '../common/BoxFace';
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
  const focusType = FocusType.None;
  test('should create correct dragger and not change anything', () => {
    const domainObject = createVerticalCylinderDomainObject();

    // Grab the cylinder at top cap from above and move it in the XY plane
    const face = new BoxFace(2);
    const direction = new Vector3(0, 0, -1);
    const delta = new Vector3(1, 0, 0);
    const startRay = new Ray(new Vector3(0, 0, 2), direction);
    const dragger = domainObject.createDragger(
      createCreateDraggerPropsMock(domainObject, startRay, face, focusType)
    );
    expect(dragger).toBeInstanceOf(CylinderDragger);
    assert(dragger !== undefined);

    const testCase = { expectedChange: false, shiftKey: false };
    drag(dragger, startRay, delta, testCase, false);
    expect(domainObject.focusType).toBe(focusType);
  });

  test('translate the cylinder', () => {
    const focusType = FocusType.Body;
    for (const testCase of getTestCasesWithSign()) {
      const { sign, expectedChange } = testCase;
      const domainObject = createVerticalCylinderDomainObject();

      // Grab the cylinder at top cap from above and move it in the XY plane
      const direction = new Vector3(0, 0, -sign);
      const delta = new Vector3(expectedChange ? 1 : 0, expectedChange ? 2 : 0, 0);
      const startRay = new Ray(new Vector3(0, 0, sign * 2), direction);
      const face = new BoxFace(sign === 1 ? 5 : 2);
      const expectedCenterA = domainObject.cylinder.centerA.clone().add(delta);
      const expectedCenterB = domainObject.cylinder.centerB.clone().add(delta);

      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, face, focusType)
      );
      assert(dragger !== undefined);

      drag(dragger, startRay, delta, testCase);
      expectEqualVector3(domainObject.cylinder.centerA, expectedCenterA);
      expectEqualVector3(domainObject.cylinder.centerB, expectedCenterB);
      expect(domainObject.focusType).toBe(focusType);
    }
  });

  test('change radius of cylinder', () => {
    const focusType = FocusType.Face;
    const face = new BoxFace(0);
    for (const testCase of getTestCases()) {
      const domainObject = createVerticalCylinderDomainObject();

      // Grab the cylinder from the side and move it away from the center
      const direction = new Vector3(0, 1, 0);
      const delta = new Vector3(testCase.expectedChange ? 1 : 0, 0, 0);
      const startRay = new Ray(new Vector3(1, -2, 0), direction);
      const expectedRadius = domainObject.cylinder.radius + delta.x;
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, face, focusType)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, testCase);

      expect(domainObject.cylinder.radius).toBeCloseTo(expectedRadius);
      expect(domainObject.focusType).toBe(focusType);
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
      const { sign, expectedChange } = testCase;
      const domainObject = createVerticalCylinderDomainObject();
      const direction = new Vector3(-1, 0, -sign).normalize();
      const delta = new Vector3(expectedChange ? 1 : 0, 0, 0);
      const startRay = new Ray(new Vector3(1, 0, sign * 2), direction);
      const face = new BoxFace(sign === 1 ? 5 : 2);

      const expectedCenterA = domainObject.cylinder.centerA.clone();
      if (sign === 1 && expectedChange) {
        expectedCenterA.z = 0;
      }
      const expectedCenterB = domainObject.cylinder.centerB.clone();
      if (sign === -1 && expectedChange) {
        expectedCenterB.z = 0;
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, face, focusType)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, testCase);

      expectEqualVector3(domainObject.cylinder.centerA, expectedCenterA);
      expectEqualVector3(domainObject.cylinder.centerB, expectedCenterB);
      expect(domainObject.focusType).toBe(focusType);
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
      const { sign, expectedChange } = testCase;
      const domainObject = createVerticalCylinderDomainObject();
      const direction = new Vector3(-1, 0, -sign).normalize();
      const delta = new Vector3(expectedChange ? 1 : 0, 0, 0);
      const startRay = new Ray(new Vector3(1, 0, sign * 2), direction);
      const face = new BoxFace(sign === 1 ? 5 : 2);

      const expectedCenterA = domainObject.cylinder.centerA.clone();
      if (sign === 1 && expectedChange) {
        expectedCenterA.set(0.894427, 0, 0.788854);
      }
      const expectedCenterB = domainObject.cylinder.centerB.clone();
      if (sign === -1 && expectedChange) {
        expectedCenterB.set(0.894427, 0, -0.788854);
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, face, focusType)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, testCase);

      expectEqualVector3(domainObject.cylinder.centerA, expectedCenterA);
      expectEqualVector3(domainObject.cylinder.centerB, expectedCenterB);
      expect(domainObject.focusType).toBe(focusType);
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
      const { sign, expectedChange } = testCase;
      const domainObject = createHorizontalCircleDomainObject();
      const direction = new Vector3(-1, 0, -sign).normalize();
      const delta = new Vector3(expectedChange ? 1 : 0, 0, 0);
      const startRay = new Ray(direction.clone().negate(), direction);
      const face = new BoxFace(sign === 1 ? 5 : 2);

      const expectedCenterA = domainObject.cylinder.centerA.clone();
      const expectedCenterB = domainObject.cylinder.centerB.clone();
      if (expectedChange) {
        expectedCenterA.z += -sign;
        expectedCenterB.z += -sign;
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, face, focusType)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, testCase);

      expectEqualVector3(domainObject.cylinder.centerA, expectedCenterA);
      expectEqualVector3(domainObject.cylinder.centerB, expectedCenterB);
      expect(domainObject.focusType).toBe(focusType);
    }
  });
});

function createCreateDraggerPropsMock(
  domainObject: CylinderDomainObject,
  ray: Ray,
  face: BoxFace,
  focusType: FocusType
): CreateDraggerProps {
  const point = domainObject.cylinder.intersectRay(ray, new Matrix4());
  if (point === undefined) {
    throw new Error('No intersection found for the ray and cylinder');
  }
  const intersection = createIntersectionMock(domainObject, face, focusType);
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
