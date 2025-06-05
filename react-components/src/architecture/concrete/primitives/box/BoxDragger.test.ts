import { assert, describe, expect, test } from 'vitest';
import { BoxDragger } from './BoxDragger';
import { expectEqualEuler, expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Matrix4, Ray, Vector3 } from 'three';
import { MeasureBoxDomainObject } from '../../measurements/MeasureBoxDomainObject';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { type CreateDraggerProps } from '../../../base/domainObjects/VisualDomainObject';
import { type BoxDomainObject } from './BoxDomainObject';
import { degToRad } from 'three/src/math/MathUtils.js';
import {
  createIntersectionMock,
  drag,
  getTestCases,
  getTestCasesWithSign,
  type TestCase
} from '#test-utils/architecture/baseDraggerUtil';
import { Box } from '../../../base/utilities/primitives/Box';

describe(BoxDragger.name, () => {
  test('should not create correct dragger when focus type is None', () => {
    const domainObject = createBoxDomainObject();
    const startRay = new Ray(new Vector3(0, 0, 2), new Vector3(0, 0, -1));
    const dragger = domainObject.createDragger(
      createCreateDraggerPropsMock(domainObject, startRay, 2, FocusType.None)
    );
    expect(dragger).toBeUndefined();
  });

  test('should not change when illegal focus type', () => {
    const focusType = FocusType.Focus;
    const domainObject = createBoxDomainObject();
    const direction = new Vector3(0, 0, -1);
    const startRay = new Ray(new Vector3(0, 0, 2), direction);
    const delta = new Vector3(1, 2, 0);

    const expectedBox = clone(domainObject.box);
    const dragger = domainObject.createDragger(
      createCreateDraggerPropsMock(domainObject, startRay, 5, focusType)
    );
    assert(dragger !== undefined);
    expect(dragger).instanceOf(BoxDragger);
    drag(dragger, startRay, delta, { expectedChange: false, shiftKey: false });
    expectEqual(domainObject, expectedBox, focusType);
  });

  test('translate the box', () => {
    const focusType = FocusType.Body;
    for (const testCase of getTestCasesWithSign()) {
      const { sign } = testCase;
      const domainObject = createBoxDomainObject();

      // Grab the box at top cap from above and move it in the XY plane
      const direction = new Vector3(0, 0, -sign);
      const startRay = new Ray(new Vector3(0, 0, sign * 2), direction);
      const delta = new Vector3();

      const expectedBox = clone(domainObject.box);
      if (testCase.expectedChange) {
        delta.set(testCase.shiftKey ? 0 : 1, 2, 0); // Shift only translate in dominate direction
        expectedBox.center.add(delta);
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, sign === 1 ? 5 : 2, focusType)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, testCase);
      expectEqual(domainObject, expectedBox, focusType);
    }
  });

  test('move a face of the box', () => {
    const focusType = FocusType.Face;
    for (const testCase of getTestCasesWithSign()) {
      const { sign } = testCase;
      const domainObject = createBoxDomainObject();

      // Grab the box from the face and move it away from the center
      const direction = new Vector3(-1, 0, -sign).normalize();
      const startRay = new Ray(new Vector3(2, 0, 2 * sign), direction);
      const delta = new Vector3();

      const expectedBox = clone(domainObject.box);
      if (testCase.expectedChange) {
        delta.z = sign;
        expectedBox.size.add(new Vector3(0, 0, 1));
        expectedBox.center.addScaledVector(delta, 0.5);
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, sign > 0 ? 2 : 5, focusType)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, testCase);
      expectEqual(domainObject, expectedBox, focusType);
    }
  });

  test('resize the box by the corner', () => {
    const focusType = FocusType.Corner;

    // Grab the box at the corner and move it away from the center
    //            Y
    //            ^ Face 1
    //            +------+
    //     Face 3 |      | Face 0
    //            |      |
    // (-1,-1,-1) +======+  --> X
    //            ^ Face 4
    //            | Dir = (0, 1, 0)
    // (-1,-2,-1) *

    for (const testCase of getTestCases()) {
      const domainObject = createBoxDomainObject();

      const direction = new Vector3(0, 1, 0); // Along the y axis
      const startRay = new Ray(new Vector3(-1, -2, -1), direction); // See figure
      const cornerSign = new Vector3(-1, -1, -1); // This is the corner that is being dragged
      const delta = new Vector3(); // Movement in the XZ plane

      const expectedBox = clone(domainObject.box);
      if (testCase.expectedChange) {
        delta.set(-1, 0, -2);
        expectedBox.size.addScaledVector(delta, -1);
        expectedBox.center.addScaledVector(delta, 0.5);
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, 4, focusType, cornerSign)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, testCase);
      expectEqual(domainObject, expectedBox, focusType);
    }
  });

  test('rotate the box', () => {
    // Grab the box at a corner and rotate it around the y axis 45 degrees
    //            Y
    //            ^
    //            | Face 1
    //            +------+
    //     Face 3 |      | Face 0
    //            |      |
    // (-1,-1,-1) +======+-----> X
    //            ^ Face 4
    //            | Dir = (0, 1, 0)
    // (-1,-2,-1) *

    const focusType = FocusType.Rotation;
    for (const testCases of getTestCasesWithCanRotate()) {
      const domainObject = createBoxDomainObject();
      domainObject.canRotateComponent = (_component: number): boolean => testCases.canRotate;

      const direction = new Vector3(0, 1, 0); // Along the y axis
      const startRay = new Ray(new Vector3(-1, -2, -1), direction); // See figure
      const delta = new Vector3();

      const expectedBox = clone(domainObject.box);
      if (testCases.expectedChange) {
        expectedBox.rotation.y = degToRad(45);
        delta.z = 1;
      } else if (!testCases.canRotate) {
        delta.z = 1; // To check if the rotation is not applied
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, 4, focusType)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, testCases);
      expectEqual(domainObject, expectedBox, focusType);
    }
  });
});

function createCreateDraggerPropsMock(
  domainObject: BoxDomainObject,
  ray: Ray,
  face: number,
  focusType: FocusType,
  cornerSign?: Vector3
): CreateDraggerProps {
  const point = domainObject.box.intersectRay(ray, new Matrix4());
  if (point === undefined) {
    throw new Error('No intersection found for the ray and box');
  }
  const intersection = createIntersectionMock(domainObject, face, focusType, cornerSign);
  return { intersection, point, ray };
}

function createBoxDomainObject(): BoxDomainObject {
  const domainObject = new MeasureBoxDomainObject(PrimitiveType.Box);
  domainObject.box.size.set(2, 2, 2);
  domainObject.box.center.set(0, 0, 0);
  return domainObject;
}

function* getTestCasesWithCanRotate(): Generator<TestCase & { canRotate: boolean }> {
  yield { expectedChange: true, shiftKey: false, canRotate: true };
  yield { expectedChange: true, shiftKey: true, canRotate: true };
  yield { expectedChange: false, shiftKey: false, canRotate: true };
  yield { expectedChange: false, shiftKey: false, canRotate: false };
}

function clone(cylinder: Box): Box {
  return new Box().copy(cylinder);
}

function expectEqual(domainObject: BoxDomainObject, expectedBox: Box, focusType: FocusType): void {
  expectEqualVector3(domainObject.box.center, expectedBox.center);
  expectEqualVector3(domainObject.box.size, expectedBox.size);
  expectEqualEuler(domainObject.box.rotation, expectedBox.rotation);
  expect(domainObject.focusType).toBe(focusType);
}
