import { assert, describe, expect, test } from 'vitest';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { Matrix4, Ray, Vector3 } from 'three';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { BoxView } from './BoxView';
import { PrimitivePickInfo } from '../common/PrimitivePickInfo';
import { BoxFace } from '../common/BoxFace';
import { MeasureBoxDomainObject } from '../../measurements/MeasureBoxDomainObject';
import { BoxDragger } from './BoxDragger';
import { type CreateDraggerProps } from '../../../base/domainObjects/VisualDomainObject';
import { type DomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type BoxDomainObject } from './BoxDomainObject';
import { EventChangeTester } from '../../../../../tests/tests-utilities/architecture/EventChangeTester';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import { expectEqualVector3 } from '../../../../../tests/tests-utilities/primitives/primitiveTestUtil';

describe(BoxDragger.name, () => {
  const focusType = FocusType.None;
  test('should create correct dragger and not change anything', () => {
    const domainObject = createBoxDomainObject();

    // Grab the box at top cap from above and move it in the XY plane
    const direction = new Vector3(0, 0, -1);
    const delta = new Vector3(1, 0, 0);
    const startRay = new Ray(new Vector3(0, 0, 2), direction);
    const dragger = domainObject.createDragger(
      createCreateDraggerPropsMock(domainObject, startRay, new BoxFace(2), focusType)
    );
    expect(dragger).toBeInstanceOf(BoxDragger);
    assert(dragger !== undefined);
    drag(dragger, startRay, delta, false, false);
    expect(domainObject.focusType).toBe(focusType);
  });

  test('translate the box', () => {
    const focusType = FocusType.Body;
    for (const expectedChange of [true, false]) {
      const domainObject = createBoxDomainObject();

      // Grab the box at top cap from above and move it in the XY plane
      const direction = new Vector3(0, 0, -1);
      const delta = new Vector3(expectedChange ? 1 : 0, expectedChange ? 2 : 0, 0);
      const startRay = new Ray(new Vector3(0, 0, 2), direction);
      const expectedCenter = domainObject.box.center.clone().add(delta);

      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, new BoxFace(2), focusType)
      );
      assert(dragger !== undefined);
      drag(dragger, startRay, delta, expectedChange);
      expectEqualVector3(domainObject.box.center, expectedCenter);
      expect(domainObject.focusType).toBe(focusType);
    }
  });

  test('change radius of box', () => {
    const focusType = FocusType.Face;
    for (const expectedChange of [true, false]) {
      const domainObject = createBoxDomainObject();

      // Grab the box from the side and move it away from the center
      const direction = new Vector3(0, 1, 0);
      const delta = new Vector3(expectedChange ? 1 : 0, 0, 0);
      const startRay = new Ray(new Vector3(1, -2, 0), direction);
      const expectedRadius = domainObject.box.radius + delta.x;
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay, new BoxFace(0), focusType)
      );

      assert(dragger !== undefined);
      drag(dragger, startRay, delta, expectedChange);

      expect(domainObject.box.radius).toBeCloseTo(expectedRadius);
      expect(domainObject.focusType).toBe(focusType);
    }
  });

  test('change the length of the box by moving the end caps', () => {
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
    for (const expectedChange of [true, false]) {
      for (const sign of [1, -1]) {
        const domainObject = createBoxDomainObject();
        const direction = new Vector3(-1, 0, -sign).normalize();
        const delta = new Vector3(expectedChange ? 1 : 0, 0, 0);
        const startRay = new Ray(new Vector3(1, 0, sign * 2), direction);

        const expectedA = domainObject.box.centerA.clone();
        if (sign === 1 && expectedChange) {
          expectedA.z = 0;
        }
        const expectedB = domainObject.box.centerB.clone();
        if (sign === -1 && expectedChange) {
          expectedB.z = 0;
        }
        const dragger = domainObject.createDragger(
          createCreateDraggerPropsMock(
            domainObject,
            startRay,
            new BoxFace(sign === 1 ? 5 : 2),
            focusType
          )
        );
        assert(dragger !== undefined);
        drag(dragger, startRay, delta, expectedChange);

        expectEqualVector3(domainObject.box.centerA, expectedA);
        expectEqualVector3(domainObject.box.centerB, expectedB);
        expect(domainObject.focusType).toBe(focusType);
      }
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

    const focusType = FocusType.Rotation;
    for (const expectedChange of [true, false]) {
      for (const sign of [1, -1]) {
        const domainObject = createBoxDomainObject();
        const direction = new Vector3(-1, 0, -sign).normalize();
        const delta = new Vector3(expectedChange ? 1 : 0, 0, 0);
        const startRay = new Ray(new Vector3(1, 0, sign * 2), direction);

        const expectedA = domainObject.box.centerA.clone();
        if (sign === 1 && expectedChange) {
          expectedA.set(0.894427, 0, 0.788854);
        }
        const expectedB = domainObject.box.centerB.clone();
        if (sign === -1 && expectedChange) {
          expectedB.set(0.894427, 0, -0.788854);
        }
        const dragger = domainObject.createDragger(
          createCreateDraggerPropsMock(
            domainObject,
            startRay,
            new BoxFace(sign === 1 ? 5 : 2),
            focusType
          )
        );
        assert(dragger !== undefined);
        drag(dragger, startRay, delta, expectedChange);

        expectEqualVector3(domainObject.box.centerA, expectedA);
        expectEqualVector3(domainObject.box.centerB, expectedB);
        expect(domainObject.focusType).toBe(focusType);
      }
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
    for (const expectedChange of [true, false]) {
      for (const sign of [1, -1]) {
        const domainObject = createBoxDomainObject();
        const direction = new Vector3(-1, 0, -sign).normalize();
        const delta = new Vector3(expectedChange ? 1 : 0, 0, 0);
        const startRay = new Ray(direction.clone().negate(), direction);

        const expectedA = domainObject.box.centerA.clone();
        const expectedB = domainObject.box.centerB.clone();
        if (expectedChange) {
          expectedA.z += -sign;
          expectedB.z += -sign;
        }
        const dragger = domainObject.createDragger(
          createCreateDraggerPropsMock(
            domainObject,
            startRay,
            new BoxFace(sign === 1 ? 5 : 2),
            focusType
          )
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
  focusType: FocusType
): DomainObjectIntersection {
  return {
    type: 'customObject',
    point: new Vector3(), // This is not used in the dragger
    distanceToCamera: 0, // This is not used in the dragger
    domainObject,
    customObject: new BoxView(), // This is not used in the dragger
    userData: new PrimitivePickInfo(face, focusType, new Vector3())
  };
}

function createCreateDraggerPropsMock(
  domainObject: BoxDomainObject,
  ray: Ray,
  face: BoxFace,
  focusType: FocusType
): CreateDraggerProps {
  const intersection = domainObject.box.intersectRay(ray, new Matrix4());
  if (intersection === undefined) {
    throw new Error('No intersection found for the ray and box');
  }
  return {
    intersection: createIntersectionMock(domainObject, face, focusType),
    point: intersection,
    ray
  };
}

function createBoxDomainObject(): BoxDomainObject {
  const domainObject = new MeasureBoxDomainObject(PrimitiveType.Box);
  domainObject.box.size.set(1, 1, 1);
  domainObject.box.center.set(0, 0, 0);
  return domainObject;
}
