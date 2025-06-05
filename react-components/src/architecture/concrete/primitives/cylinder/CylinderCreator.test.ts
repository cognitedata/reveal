import { describe, expect, test } from 'vitest';
import { CylinderCreator } from './CylinderCreator';
import { Vector3 } from 'three';
import { expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { click } from '#test-utils/architecture/baseCreatorUtil';
import { MeasureCylinderDomainObject } from '../../measurements/MeasureCylinderDomainObject';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { swap } from '../../../base/utilities/extensions/arrayExtensions';

const direction = new Vector3(1, 0, 0);

describe(CylinderCreator.name, () => {
  test('Create horizontal circle by mimics the user clicking 2 times', () => {
    const domainObject = new MeasureCylinderDomainObject(PrimitiveType.HorizontalCircle);
    const creator = new CylinderCreator(domainObject, undefined);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    const dx = 5;
    const radius = 3;

    const center = new Vector3(dx, 0, 0);
    const points = [center, new Vector3(dx, radius, 2)];
    click(creator, points[0], direction, false, center);
    click(creator, points[1], direction, true);

    expect(creator.domainObject).toBe(domainObject);
    expectEqualVector3(domainObject.cylinder.center, center);
    expect(domainObject.cylinder.radius).toBeCloseTo(radius);
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });

  test('Create vertical cylinder by mimics the user clicking 3 times', () => {
    const domainObject = new MeasureCylinderDomainObject(PrimitiveType.VerticalCylinder);
    for (const reverseOrder of [false, true]) {
      const creator = new CylinderCreator(domainObject, undefined, reverseOrder);
      expect(domainObject.focusType).toBe(FocusType.Pending);

      const dx = 5;
      const radius = 3;

      const centerA = new Vector3(dx, 0, 0);
      const centerB = new Vector3(dx, 0, 2);
      const points = [centerA, centerB, new Vector3(dx, radius, 2)];
      if (!reverseOrder) {
        swap(points, 1, 2);
      }
      click(creator, points[0], direction, false, centerA);
      click(creator, points[1], direction, false);
      click(creator, points[2], direction, true);

      expect(creator.domainObject).toBe(domainObject);
      expectEqualVector3(domainObject.cylinder.centerA, centerA);
      expectEqualVector3(domainObject.cylinder.centerB, centerB);
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

      const centerA = new Vector3(0, 0, dz);
      const centerB = new Vector3(0, 2, dz);
      const points = [centerA, centerB, new Vector3(0, 2, radius + dz)];
      if (!reverseOrder) {
        swap(points, 1, 2);
      }
      click(creator, points[0], direction, false, centerA);
      click(creator, points[1], direction, false);
      click(creator, points[2], direction, true);

      expect(creator.domainObject).toBe(domainObject);
      expectEqualVector3(domainObject.cylinder.centerA, centerA);
      expectEqualVector3(domainObject.cylinder.centerB, centerB);
      expect(domainObject.cylinder.radius).toBeCloseTo(radius);
      expect(domainObject.focusType).toBe(FocusType.Focus);
    }
  });
});
