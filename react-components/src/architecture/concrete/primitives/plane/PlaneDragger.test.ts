import { assert, describe, expect, test } from 'vitest';
import { PlaneDragger } from '../plane/PlaneDragger';
import { expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type Plane, Ray, Vector3 } from 'three';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { type CreateDraggerProps } from '../../../base/domainObjects/VisualDomainObject';
import { type PlaneDomainObject } from '../plane/PlaneDomainObject';
import {
  createIntersectionMock,
  drag,
  getTestCasesWithSign
} from '#test-utils/architecture/baseDraggerUtil';
import { SliceDomainObject } from '../../clipping/SliceDomainObject';

describe(PlaneDragger.name, () => {
  test('translate the plane', () => {
    // Grab the plane move it back or forth in the direction of the normal
    //   ^
    // Y |
    //      * / / <---- *(7,1)  end ray, sign = 1
    //     / / /
    //    / * /<------ *(6,1)   Start ray
    //   / / /
    //  / / * <------ *(5,1)    end ray, sign = -1
    // / / /
    //  * (0,0) ---> X
    for (const testCase of getTestCasesWithSign()) {
      const { sign } = testCase;
      const domainObject = createPlaneDomainObject();

      const direction = new Vector3(-1, 0, 0);
      const startRay = new Ray(new Vector3(6, 1, 0), direction);
      const delta = new Vector3();

      const expectedPlane = domainObject.plane.clone();
      if (testCase.expectedChange) {
        delta.set(0, sign, 0);
        expectedPlane.constant -= sign * Math.sqrt(2);
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay)
      );
      assert(dragger !== undefined);
      expect(dragger).instanceOf(PlaneDragger);
      drag(dragger, startRay, delta, testCase);
      expectEqual(domainObject, expectedPlane, FocusType.Focus);
    }
  });
});

function createCreateDraggerPropsMock(
  domainObject: PlaneDomainObject,
  ray: Ray
): CreateDraggerProps {
  const point = ray.intersectPlane(domainObject.plane, new Vector3());
  if (point === null) {
    throw new Error('No intersection found for the ray and plane');
  }
  const intersection = createIntersectionMock(domainObject, 0, FocusType.None);
  return { intersection, point, ray };
}

function createPlaneDomainObject(): PlaneDomainObject {
  const domainObject = new SliceDomainObject(PrimitiveType.PlaneXY);
  const normal = new Vector3(1, 1, 0).normalize();
  domainObject.plane.normal.copy(normal);
  domainObject.plane.constant = 0;
  return domainObject;
}

function expectEqual(
  domainObject: PlaneDomainObject,
  expectedPlane: Plane,
  focusType: FocusType
): void {
  expectEqualVector3(domainObject.plane.normal, expectedPlane.normal);
  expect(domainObject.plane.constant).toBeCloseTo(expectedPlane.constant);
  expect(domainObject.focusType).toBe(focusType);
}
