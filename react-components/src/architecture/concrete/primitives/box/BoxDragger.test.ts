import { assert, describe, expect, test } from 'vitest';
import { BoxFace } from '../common/BoxFace';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { BoxDragger } from './BoxDragger';
import { EventChangeTester } from '../../../../../tests/tests-utilities/architecture/EventChangeTester';
import { expectEqualVector3 } from '../../../../../tests/tests-utilities/primitives/primitiveTestUtil';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Matrix4, Ray, Vector3 } from 'three';
import { MeasureBoxDomainObject } from '../../measurements/MeasureBoxDomainObject';
import { Mock } from 'moq.ts';
import { PrimitivePickInfo } from '../common/PrimitivePickInfo';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { type BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import { type CreateDraggerProps } from '../../../base/domainObjects/VisualDomainObject';
import { type BoxDomainObject } from './BoxDomainObject';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type DomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { type ICustomObject } from '@cognite/reveal';

describe(BoxDragger.name, () => {
  const focusType = FocusType.None;
  test('should create correct dragger and not change anything', () => {
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
    drag(dragger, startRay, delta, false, false);
    expect(domainObject.focusType).toBe(focusType);
  });

  test('translate the box', () => {
    const focusType = FocusType.Body;
    for (const expectedChange of [true, false]) {
      for (const sign of [1, -1]) {
        const domainObject = createBoxDomainObject();

        // Grab the box at top cap from above and move it in the XY plane
        const direction = new Vector3(0, 0, -sign);
        const delta = new Vector3(expectedChange ? 1 : 0, expectedChange ? 2 : 0, 0);
        const startRay = new Ray(new Vector3(0, 0, sign * 2), direction);
        const face = new BoxFace(sign === 1 ? 5 : 2);
        const expectedCenter = domainObject.box.center.clone().add(delta);

        const dragger = domainObject.createDragger(
          createCreateDraggerPropsMock(domainObject, startRay, face, focusType)
        );
        assert(dragger !== undefined);
        drag(dragger, startRay, delta, expectedChange);
        expectEqualVector3(domainObject.box.center, expectedCenter);
        expect(domainObject.focusType).toBe(focusType);
      }
    }
  });

  test('move a face of the box', () => {
    // This moves the top face up (sign = 1) and the bottom face down (sign = -1)
    const focusType = FocusType.Face;
    for (const expectedChange of [true, false]) {
      for (const sign of [1, -1]) {
        const domainObject = createBoxDomainObject();
        const face = new BoxFace(sign > 0 ? 2 : 5);

        // Grab the box from the side and move it away from the center
        const direction = new Vector3(-1, 0, -sign).normalize();
        const delta = new Vector3(0, 0, expectedChange ? sign : 0);
        const absDelta = new Vector3(0, 0, expectedChange ? 1 : 0);
        const startRay = new Ray(new Vector3(2, 0, 2 * sign), direction);
        const expectedSize = domainObject.box.size.clone().add(absDelta);
        const expectedCenter = domainObject.box.center.clone().addScaledVector(delta, 0.5);
        const dragger = domainObject.createDragger(
          createCreateDraggerPropsMock(domainObject, startRay, face, focusType)
        );
        assert(dragger !== undefined);
        drag(dragger, startRay, delta, expectedChange);

        expectEqualVector3(domainObject.box.size, expectedSize);
        expectEqualVector3(domainObject.box.center, expectedCenter);
        expect(domainObject.focusType).toBe(focusType);
      }
    }
  });

  test('resize the box by the corner', () => {
    // This moves the top face up (sign = 1) and the bottom face down (sign = -1)
    const focusType = FocusType.Corner;
    const cornerSign = new Vector3(1, 1, 1); // This is the corner that is being dragged
    for (const expectedChange of [true]) {
      const domainObject = createBoxDomainObject();
      const face = new BoxFace(2);

      // Grab the box from the side and move it away from the center

      // X
      // ^
      //  +------+
      //  |      |
      //  |      |
      //  +------+  --> X

      const direction = new Vector3(1, 0, 0).normalize();
      const delta = new Vector3(0, expectedChange ? 1 : 0, expectedChange ? 1 : 0);
      const absDelta = new Vector3(0, expectedChange ? 1 : 0, expectedChange ? 1 : 0);
      const startRay = new Ray(new Vector3(-2, 0, 1), direction);
      const expectedSize = domainObject.box.size.clone().add(absDelta);
      const expectedCenter = domainObject.box.center.clone().addScaledVector(delta, 0.5);
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, face, focusType, cornerSign)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, expectedChange);

      expectEqualVector3(domainObject.box.size, expectedSize);
      // expectEqualVector3(domainObject.box.center, expectedCenter);
      expect(domainObject.focusType).toBe(focusType);
    }
  });

  test('rotate the box by moving one of the end caps', () => {
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

    return;
    const focusType = FocusType.Rotation;
    for (const expectedChange of [true, false]) {
      for (const sign of [1, -1]) {
        const domainObject = createBoxDomainObject();
        const direction = new Vector3(-1, 0, -sign).normalize();
        const delta = new Vector3(expectedChange ? 1 : 0, 0, 0);
        const startRay = new Ray(new Vector3(1, 0, sign * 2), direction);
        const face = new BoxFace(sign === 1 ? 5 : 2);

        const expectedA = domainObject.box.centerA.clone();
        if (sign === 1 && expectedChange) {
          expectedA.set(0.894427, 0, 0.788854);
        }
        const expectedB = domainObject.box.centerB.clone();
        if (sign === -1 && expectedChange) {
          expectedB.set(0.894427, 0, -0.788854);
        }
        const dragger = domainObject.createDragger(
          createCreateDraggerPropsMock(domainObject, startRay, face, focusType)
        );
        assert(dragger !== undefined);
        drag(dragger, startRay, delta, expectedChange);

        expectEqualVector3(domainObject.box.centerA, expectedA);
        expectEqualVector3(domainObject.box.centerB, expectedB);
        expect(domainObject.focusType).toBe(focusType);
      }
    }
  });
});

function drag(
  dragger: BaseDragger,
  startRay: Ray,
  delta: Vector3,
  expectedChange: boolean,
  expectedFocusChange = false
): void {
  const draggerTester = new EventChangeTester(dragger.domainObject, Changes.dragging);
  const focusTester = new EventChangeTester(dragger.domainObject, Changes.focus);

  const endRay = new Ray(startRay.origin.clone().add(delta), startRay.direction.clone());
  dragger.onPointerDown(new PointerEvent('pointerdown'));
  const actualChanged = dragger.onPointerDrag(new PointerEvent('pointermove'), endRay);
  dragger.onPointerUp(new PointerEvent('pointermove'));

  expect(actualChanged).toBe(expectedChange);

  // Test of notifications has happened
  draggerTester.toHaveBeenCalledTimes(actualChanged ? 1 : 0);
  if (expectedFocusChange) {
    focusTester.toHaveBeenCalledTimes(1);
  }
}

function createIntersectionMock(
  domainObject: DomainObject,
  face: BoxFace,
  focusType: FocusType,
  cornerSign?: Vector3
): DomainObjectIntersection {
  const mock = new Mock<ICustomObject>();
  return {
    type: 'customObject',
    domainObject,
    userData: new PrimitivePickInfo(face, focusType, cornerSign),
    point: new Vector3(), // This is not used in the dragger
    distanceToCamera: 0, // This is not used in the dragger
    customObject: mock.object() // This is not used in the dragger
  };
}

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
