/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { PlaneCreator } from './PlaneCreator';
import { Plane, Vector3 } from 'three';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { click } from '#test-utils/architecture/baseCreatorUtil';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { createPlaneDomainObjectMock } from './PlaneDomainObject.test';

describe(PlaneCreator.name, () => {
  const primitiveTypes = [PrimitiveType.PlaneX, PrimitiveType.PlaneY, PrimitiveType.PlaneZ];

  test('Should create a plane perpendicular of X, Y or Z axis by clicking once', () => {
    for (const primitiveType of primitiveTypes) {
      const domainObject = createPlaneDomainObjectMock(primitiveType);
      const creator = new PlaneCreator(domainObject);
      expect(domainObject.focusType).toBe(FocusType.Pending);

      const normal = domainObject.plane.normal.clone();
      const origin = normal.clone().multiplyScalar(5);
      const rayDirection = normal.clone().negate();
      click(creator, origin, rayDirection, true, origin);

      const expectedPlane = new Plane().setFromNormalAndCoplanarPoint(normal, origin);
      expectedPlane.negate();

      expect(creator.domainObject).toBe(domainObject);
      expect(domainObject.plane).toStrictEqual(expectedPlane);
      expect(domainObject.focusType).toBe(FocusType.Focus);
    }
  });

  test('Should create a vertical plane perpendicular by clicking twice', () => {
    const domainObject = createPlaneDomainObjectMock(PrimitiveType.PlaneXY);
    const creator = new PlaneCreator(domainObject);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    const origin = new Vector3(5, 6, 7);
    const normal = new Vector3(1, 1, 0).normalize();
    const expectedPlane = new Plane().setFromNormalAndCoplanarPoint(normal, origin);

    const origin1 = origin.clone();
    const origin2 = origin1.clone().add(new Vector3(1, -1, 0));
    const rayDirection = normal.clone().negate();
    click(creator, origin1, rayDirection, false, origin1);
    click(creator, origin2, rayDirection, true, origin2);

    expectedPlane.negate();

    expect(creator.domainObject).toBe(domainObject);
    expect(domainObject.plane).toStrictEqual(expectedPlane);
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });
});
