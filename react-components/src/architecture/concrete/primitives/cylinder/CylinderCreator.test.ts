/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { CylinderCreator } from './CylinderCreator';
import { Vector3 } from 'three';
import { expectEqualVector3 } from '../../../../../tests/tests-utilities/primitives/primitiveTestUtil';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { click } from '../../../../../tests/tests-utilities/architecture/baseCreatorUtil';
import { MeasureCylinderDomainObject } from '../../measurements/MeasureCylinderDomainObject';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';

const direction = new Vector3(1, 0, 0);

describe('CylinderCreator', () => {
  test('Create vertical cylinder by mimics the user clicking 3 times', () => {
    const domainObject = new MeasureCylinderDomainObject(PrimitiveType.VerticalCylinder);
    for (const reverseOrder of [false, true]) {
      const creator = new CylinderCreator(domainObject, undefined, reverseOrder);
      expect(domainObject.focusType).toBe(FocusType.Pending);

      const dx = 5;
      const radius = 3;

      const points = [new Vector3(dx, 0, 0), new Vector3(dx, 0, 2), new Vector3(dx, radius, 2)];
      if (!reverseOrder) {
        [points[1], points[2]] = [points[2], points[1]];
      }
      click(creator, points[0], direction, false, new Vector3(dx, 0, 0));
      click(creator, points[1], direction, false);
      click(creator, points[2], direction, true);

      expect(creator.domainObject).toBe(domainObject);
      expectEqualVector3(domainObject.cylinder.centerA, new Vector3(dx, 0, 0));
      expectEqualVector3(domainObject.cylinder.centerB, new Vector3(dx, 0, 2));
      expect(domainObject.cylinder.radius).toBeCloseTo(radius);
      expect(domainObject.focusType).toBe(FocusType.Focus);
    }
  });

  test('Create horizontal cylinder by mimics the user clicking 3 times', () => {
    for (const reverseOrder of [false, true]) {
      const domainObject = new MeasureCylinderDomainObject(PrimitiveType.HorizontalCylinder);
      const creator = new CylinderCreator(domainObject, undefined, reverseOrder);
      expect(domainObject.focusType).toBe(FocusType.Pending);

      const dz = 5;
      const radius = 3;

      const points = [new Vector3(0, 0, dz), new Vector3(0, 2, dz), new Vector3(0, 2, radius + dz)];
      if (!reverseOrder) {
        [points[1], points[2]] = [points[2], points[1]];
      }
      click(creator, points[0], direction, false, new Vector3(0, 0, dz));
      click(creator, points[1], direction, false);
      click(creator, points[2], direction, true);

      expect(creator.domainObject).toBe(domainObject);
      expectEqualVector3(domainObject.cylinder.centerA, new Vector3(0, 0, dz));
      expectEqualVector3(domainObject.cylinder.centerB, new Vector3(0, 2, dz));
      expect(domainObject.cylinder.radius).toBeCloseTo(radius);
      expect(domainObject.focusType).toBe(FocusType.Focus);
    }
  });
});
