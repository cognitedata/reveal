/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { CylinderCreator } from './CylinderCreator';
import { Ray, Vector3 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { expectEqualVector3 } from '../../../../../tests/tests-utilities/primitives/primitiveTestUtil';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { CylinderDomainObject } from './CylinderDomainObject';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';

describe('CylinderCreator', () => {
  test('Create vertical cylinder by mimics the user clicking 3 times', () => {
    const domainObject = new MockCylinderDomainObject();
    const creator = new CylinderCreator(domainObject, false);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    const dx = 5;
    const radius = 3;

    click(creator, new Vector3(dx, 0, 0), false, new Vector3(dx, 0, 0));
    click(creator, new Vector3(dx, 0, 2), false);
    click(creator, new Vector3(dx, radius, 2), true);

    expect(creator.domainObject).toBe(domainObject);
    expectEqualVector3(domainObject.cylinder.centerA, new Vector3(dx, 0, 0));
    expectEqualVector3(domainObject.cylinder.centerB, new Vector3(dx, 0, 2));
    expect(domainObject.cylinder.radius).toBeCloseTo(radius);
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });

  test('Create horizontal cylinder by mimics the user clicking 3 times', () => {
    const domainObject = new MockCylinderDomainObject();
    const creator = new CylinderCreator(domainObject, true);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    const dz = 5;
    const radius = 3;

    click(creator, new Vector3(0, 0, dz), false, new Vector3(0, 0, dz));
    click(creator, new Vector3(0, 2, dz), false);
    click(creator, new Vector3(0, 2, radius + dz), true);

    expect(creator.domainObject).toBe(domainObject);
    expectEqualVector3(domainObject.cylinder.centerA, new Vector3(0, 0, dz));
    expectEqualVector3(domainObject.cylinder.centerB, new Vector3(0, 2, dz));
    expect(domainObject.cylinder.radius).toBeCloseTo(radius);
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });
});

function click(
  creator: CylinderCreator,
  origin: Vector3,
  isFinished: boolean,
  startPoint?: Vector3
): void {
  const ray = getRay(origin);
  if (startPoint !== undefined) {
    startPoint.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
  }
  creator.addPoint(ray, startPoint);
  expect(creator.isFinished).toBe(isFinished);
}

function getRay(origin: Vector3): Ray {
  const direction = new Vector3(1, 0, 0);
  direction.normalize();
  const ray = new Ray(origin, direction);
  ray.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
  return ray;
}

class MockCylinderDomainObject extends CylinderDomainObject {
  public constructor() {
    super();
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new MockCylinderDomainObject();
    clone.copyFrom(this, what);
    return clone;
  }
}
