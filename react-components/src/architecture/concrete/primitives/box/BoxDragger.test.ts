import { assert, describe, expect, test } from 'vitest';
import { BoxFace } from '../common/BoxFace';
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

describe(BoxDragger.name, () => {
  test('should create correct dragger and not change anything if not any focus type', () => {
    const focusType = FocusType.None;
    const domainObject = createBoxDomainObject();

    // Grab the box at top cap from above and move it in the XY plane
    const face = new BoxFace(2);
    const direction = new Vector3(0, 0, -1);
    const delta = new Vector3(1, 0, 0);
    const startRay = new Ray(new Vector3(0, 0, 2), direction);
    const dragger = domainObject.createDragger(
      createCreateDraggerPropsMock(domainObject, startRay, face, focusType)
    );
    expect(dragger).toBeInstanceOf(BoxDragger);
    assert(dragger !== undefined);

    const testCase = { expectedChange: false, shiftKey: false };
    drag(dragger, startRay, delta, testCase, false);
    expect(domainObject.focusType).toBe(focusType);
  });

  test('translate the box', () => {
    const focusType = FocusType.Body;
    for (const testCase of getTestCasesWithSign()) {
      const { sign } = testCase;
      const domainObject = createBoxDomainObject();

      // Grab the box at top cap from above and move it in the XY plane
      const direction = new Vector3(0, 0, -sign);
      const delta = new Vector3();
      const startRay = new Ray(new Vector3(0, 0, sign * 2), direction);
      const face = new BoxFace(sign === 1 ? 5 : 2);

      const expectedSize = domainObject.box.size.clone();
      const expectedCenter = domainObject.box.center.clone();
      if (testCase.expectedChange) {
        delta.set(testCase.shiftKey ? 0 : 1, 2, 0); // Shift only translate in dominate direction
        expectedCenter.add(delta);
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, face, focusType)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, testCase);

      expectEqualVector3(domainObject.box.size, expectedSize);
      expectEqualVector3(domainObject.box.center, expectedCenter);
      expect(domainObject.focusType).toBe(focusType);
    }
  });

  test('move a face of the box', () => {
    const focusType = FocusType.Face;
    for (const testCase of getTestCasesWithSign()) {
      const { sign } = testCase;
      const domainObject = createBoxDomainObject();
      const face = new BoxFace(sign > 0 ? 2 : 5);

      // Grab the box from the face and move it away from the center
      const direction = new Vector3(-1, 0, -sign).normalize();
      const startRay = new Ray(new Vector3(2, 0, 2 * sign), direction);
      const delta = new Vector3();
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, face, focusType)
      );
      const expectedSize = domainObject.box.size.clone();
      const expectedCenter = domainObject.box.center.clone();
      if (testCase.expectedChange) {
        delta.set(0, 0, sign);
        expectedSize.add(new Vector3(0, 0, 1));
        expectedCenter.addScaledVector(delta, 0.5);
      }

      assert(dragger !== undefined);
      drag(dragger, startRay, delta, testCase);

      expectEqualVector3(domainObject.box.size, expectedSize);
      expectEqualVector3(domainObject.box.center, expectedCenter);
      expect(domainObject.focusType).toBe(focusType);
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
      const delta = new Vector3(); // Movement in the XZ plane
      const cornerSign = new Vector3(-1, -1, -1); // This is the corner that is being dragged
      const face = new BoxFace(4); // Negative Y face

      const expectedSize = domainObject.box.size.clone();
      const expectedCenter = domainObject.box.center.clone();
      if (testCase.expectedChange) {
        delta.set(-1, 0, -2);
        expectedSize.addScaledVector(delta, -1);
        expectedCenter.addScaledVector(delta, 0.5);
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, face, focusType, cornerSign)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, testCase);

      expectEqualVector3(domainObject.box.size, expectedSize);
      expectEqualVector3(domainObject.box.center, expectedCenter);
      expect(domainObject.focusType).toBe(focusType);
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
    for (const params of getTestCasesWithCanRotate()) {
      const domainObject = createBoxDomainObject();
      domainObject.canRotateComponent = (_component: number): boolean => params.canRotate;

      const direction = new Vector3(0, 1, 0); // Along the y axis
      const startRay = new Ray(new Vector3(-1, -2, -1), direction); // See figure
      const delta = new Vector3();
      const face = new BoxFace(4); // Negative Y face

      const expectedSize = domainObject.box.size.clone();
      const expectedCenter = domainObject.box.center.clone();
      const expectedRotation = domainObject.box.rotation.clone();

      if (params.expectedChange) {
        expectedRotation.y = degToRad(45);
        delta.set(0, 0, 1);
      } else if (!params.canRotate) {
        delta.set(0, 0, 1); // To check if the rotation is not applied
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, face, focusType)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, params);

      expectEqualVector3(domainObject.box.size, expectedSize);
      expectEqualVector3(domainObject.box.center, expectedCenter);
      expectEqualEuler(domainObject.box.rotation, expectedRotation);
      expect(domainObject.focusType).toBe(focusType);
    }
  });
});

function createCreateDraggerPropsMock(
  domainObject: BoxDomainObject,
  ray: Ray,
  face: BoxFace,
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
