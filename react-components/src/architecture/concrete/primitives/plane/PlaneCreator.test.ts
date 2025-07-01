import { describe, expect, test } from 'vitest';
import { PlaneCreator } from './PlaneCreator';
import { Plane, Vector3 } from 'three';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { click } from '#test-utils/architecture/baseCreatorUtil';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { createPlaneDomainObjectMock } from './PlaneDomainObject.test';

describe(PlaneCreator.name, () => {
  test('Should create a plane perpendicular of X, Y or Z axis by clicking once', () => {
    const primitiveTypes = [PrimitiveType.PlaneX, PrimitiveType.PlaneY, PrimitiveType.PlaneZ];

    for (const primitiveType of primitiveTypes) {
      const domainObject = createPlaneDomainObjectMock(primitiveType);

      const expectedPlaneNormal = domainObject.plane.normal.clone();
      const expectedPointInPlane = expectedPlaneNormal.clone().multiplyScalar(5);
      const rayDirection = expectedPlaneNormal.clone().negate();

      const creator = new PlaneCreator(domainObject);
      expect(domainObject.focusType).toBe(FocusType.Pending);
      click(creator, expectedPointInPlane, rayDirection, true, expectedPointInPlane);

      const expectedPlane = new Plane().setFromNormalAndCoplanarPoint(
        expectedPlaneNormal,
        expectedPointInPlane
      );
      expectedPlane.negate();

      expect(creator.domainObject).toBe(domainObject);
      expect(domainObject.plane).toStrictEqual(expectedPlane);
      expect(domainObject.focusType).toBe(FocusType.Focus);
    }
  });

  test('Should create a vertical plane perpendicular by clicking twice', () => {
    const domainObject = createPlaneDomainObjectMock(PrimitiveType.PlaneXY);

    const expectedPlaneNormal = new Vector3(1, 1, 0).normalize();
    const expectedPointInPlane = new Vector3(5, 6, 7);
    const expectedPlane = new Plane().setFromNormalAndCoplanarPoint(
      expectedPlaneNormal,
      expectedPointInPlane
    );

    const origin1 = expectedPointInPlane.clone();
    const origin2 = origin1.clone().add(new Vector3(1, -1, 0));
    const rayDirection = expectedPlaneNormal.clone().negate();

    const creator = new PlaneCreator(domainObject);
    expect(domainObject.focusType).toBe(FocusType.Pending);
    click(creator, origin1, rayDirection, false, origin1);
    click(creator, origin2, rayDirection, true, origin2);

    expectedPlane.negate();

    expect(creator.domainObject).toBe(domainObject);
    expect(domainObject.plane).toStrictEqual(expectedPlane);
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });
});
