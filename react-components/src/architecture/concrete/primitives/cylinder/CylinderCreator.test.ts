import { describe, expect, test } from 'vitest';
import { CylinderCreator } from './CylinderCreator';
import { Vector3 } from 'three';
import { expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { click } from '#test-utils/architecture/baseCreatorUtil';
import { MeasureCylinderDomainObject } from '../../measurements/MeasureCylinderDomainObject';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { swap } from '../../../base/utilities/extensions/arrayUtils';
import { type BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';

describe(CylinderCreator.name, () => {
  test('Create horizontal circle by mimics the user clicking 2 times', () => {
    for (const hasIntersectionPoint of [true, false]) {
      const domainObject = new MeasureCylinderDomainObject(PrimitiveType.HorizontalCircle);
      const creator = new CylinderCreator(domainObject);
      expect(domainObject.focusType).toBe(FocusType.Pending);

      // This is center and radius of the expected circle
      const x = 1;
      const y = 1;
      const z = 2;
      const radius = 1.5;

      const points = [new Vector3(x, y - radius, z), new Vector3(x, y + radius, z)];
      clickMe(creator, points[0], false, true);
      clickMe(creator, points[1], true, hasIntersectionPoint);

      expect(creator.domainObject).toBe(domainObject);
      expectEqualVector3(domainObject.cylinder.center, new Vector3(x, y, z));
      expect(domainObject.cylinder.radius).toBeCloseTo(radius);
      expect(domainObject.focusType).toBe(FocusType.Focus);
    }
  });

  test('Create vertical cylinder by mimics the user clicking 3 times', () => {
    for (const hasIntersectionPoint of [true, false]) {
      const domainObject = new MeasureCylinderDomainObject(PrimitiveType.VerticalCylinder);
      const creator = new CylinderCreator(domainObject);
      expect(domainObject.focusType).toBe(FocusType.Pending);

      // This is centers and radius of the expected cylinder
      const x = 1;
      const y = 1;
      const zA = 2;
      const zB = 5;
      const radius = 1.5;

      const points = [
        new Vector3(x, y - radius, zA),
        new Vector3(x, y + radius, zA),
        new Vector3(x, y, zB)
      ];
      clickMe(creator, points[0], false, true);
      clickMe(creator, points[1], false, hasIntersectionPoint);
      clickMe(creator, points[2], true, hasIntersectionPoint);

      expect(creator.domainObject).toBe(domainObject);
      expectEqualVector3(domainObject.cylinder.centerA, new Vector3(x, y, zA));
      expectEqualVector3(domainObject.cylinder.centerB, new Vector3(x, y, zB));
      expect(domainObject.cylinder.radius).toBeCloseTo(radius);
      expect(domainObject.focusType).toBe(FocusType.Focus);
    }
  });

  test('Create horizontal cylinder by mimics the user clicking 3 times', () => {
    for (const hasIntersectionPoint of [true, false]) {
      const domainObject = new MeasureCylinderDomainObject(PrimitiveType.HorizontalCylinder);
      const creator = new CylinderCreator(domainObject);
      expect(domainObject.focusType).toBe(FocusType.Pending);

      // This is centers and radius of the expected cylinder
      const x = 1;
      const yA = 2;
      const yB = 5;
      const z = 1;
      const radius = 1.5;

      const points = [
        new Vector3(x - radius, yA, z),
        new Vector3(x + radius, yA, z),
        new Vector3(x, yB, z)
      ];
      clickMe(creator, points[0], false, true);
      clickMe(creator, points[1], false, true);
      clickMe(creator, points[2], true, hasIntersectionPoint);

      expect(creator.domainObject).toBe(domainObject);
      expectEqualVector3(domainObject.cylinder.centerA, new Vector3(x, yA, z));
      expectEqualVector3(domainObject.cylinder.centerB, new Vector3(x, yB, z));
      expect(domainObject.cylinder.radius).toBeCloseTo(radius);
      expect(domainObject.focusType).toBe(FocusType.Focus);
    }
  });
});

function clickMe(
  creator: BaseCreator,
  point: Vector3,
  isFinished: boolean,
  hasIntersectionPoint = true
): void {
  const direction = new Vector3(-1, -1, -1); // Point somewhere down
  point = point.clone();
  const origin = point.clone().addScaledVector(direction, -3); // Origin of the ray

  // Origin and direction is for the ray.
  // The point is the intersection point, but can optional dependent of the click order
  click(creator, origin, direction, isFinished, hasIntersectionPoint ? point : undefined);
}
