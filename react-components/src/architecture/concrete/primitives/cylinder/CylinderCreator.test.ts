/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { CylinderCreator } from './CylinderCreator';
import { Ray, Vector3 } from 'three';
import {
  CDF_TO_VIEWER_TRANSFORMATION,
  type CustomObjectIntersection,
  type ICustomObject
} from '@cognite/reveal';
import { expectEqualVector3 } from '../../../../../tests/tests-utilities/primitives/primitiveTestUtil';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { BaseTool } from '../../../base/commands/BaseTool';
import { CylinderDomainObject } from './CylinderDomainObject';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { Mock } from 'moq.ts';
/**
 * Helper class for generate a BoxDomainObject by clicking around
 */
describe('CylinderCreator', () => {
  test('Create vertical cylinder by mimics the user clicking 3 times', () => {
    const domainObject = new MockCylinderDomainObject();
    const tool = new MockTool();

    const creator = new CylinderCreator(tool, domainObject, false);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    click(creator, new Vector3(0, 0, 1), false, new Vector3(0, 0, 0));
    click(creator, new Vector3(0, 0, 2), false);
    click(creator, new Vector3(3, 0, 2), true);

    expect(creator.domainObject).toBe(domainObject);
    expect(domainObject.cylinder.radius).toBeCloseTo(3);
    expectEqualVector3(domainObject.cylinder.centerA, new Vector3(0, 0, 0));
    expectEqualVector3(domainObject.cylinder.centerB, new Vector3(0, 0, 2));
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });

  test('Create horizontal cylinder by mimics the user clicking 3 times', () => {
    const domainObject = new MockCylinderDomainObject();
    const tool = new MockTool();

    const creator = new CylinderCreator(tool, domainObject, false);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    click(creator, new Vector3(0, 0, 1), false, new Vector3(0, 0, 0));
    click(creator, new Vector3(2, 0, 0), false);
    click(creator, new Vector3(3, 0, 2), true);

    expect(creator.domainObject).toBe(domainObject);
    expect(domainObject.cylinder.radius).toBeCloseTo(3);
    expectEqualVector3(domainObject.cylinder.centerA, new Vector3(0, 0, 0));
    expectEqualVector3(domainObject.cylinder.centerB, new Vector3(0, 2, 0));
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
  if (startPoint === undefined) {
    creator.addPoint(ray, undefined);
  } else {
    const i: CustomObjectIntersection = {
      point: startPoint,
      userData: undefined,
      distanceToCamera: 0,
      type: 'customObject',
      customObject: new Mock<ICustomObject>().object()
    };
    creator.addPoint(ray, i);
  }
  expect(creator.isFinished).toBe(isFinished);
}

function getRay(origin: Vector3): Ray {
  const direction = new Vector3(1, 0, -1);
  direction.normalize();
  const ray = new Ray(origin, direction);
  ray.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
  return ray;
}

class MockTool extends BaseTool {}

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
