/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { MeasureBoxDomainObject } from '../../measurements/MeasureBoxDomainObject';
import { BoxCreator } from './BoxCreator';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { Ray, Vector3 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { expectEqualVector3 } from '../../../../../tests/tests-utilities/primitives/primitiveTestUtil';
import { Box } from '../../../base/utilities/primitives/Box';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
/**
 * Helper class for generate a BoxDomainObject by clicking around
 */
describe('BoxCreator', () => {
  test('Create Box', () => {
    const domainObject = new MeasureBoxDomainObject(PrimitiveType.Box);
    const creator = new BoxCreator(domainObject);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    // This mimics the user clicking around
    click(creator, new Vector3(0, 0, 1), false, new Vector3(0, 0, 0));
    click(creator, new Vector3(1, 0, 1), false);
    click(creator, new Vector3(1, 1, 1), false);
    click(creator, new Vector3(2, 1, 1), true);

    expect(creator.domainObject).toBe(domainObject);
    expectEqualVector3(domainObject.box.size, new Vector3(2, 1, 1));
    expectEqualVector3(domainObject.box.center, new Vector3(1, 0.5, 0.5));
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });

  test('Create HorizontalArea', () => {
    const domainObject = new MeasureBoxDomainObject(PrimitiveType.HorizontalArea);
    const creator = new BoxCreator(domainObject);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    // This mimics the user clicking around
    click(creator, new Vector3(0, 0, 1), false, new Vector3(0, 0, 0));
    click(creator, new Vector3(1, 0, 1), false);
    click(creator, new Vector3(1, 1, 1), true);

    expect(creator.domainObject).toBe(domainObject);
    expectEqualVector3(domainObject.box.size, new Vector3(2, 1, Box.MinSize));
    expectEqualVector3(domainObject.box.center, new Vector3(1, 0.5, Box.MinSize / 2));
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });

  test('Create VerticalArea', () => {
    const domainObject = new MeasureBoxDomainObject(PrimitiveType.VerticalArea);
    const creator = new BoxCreator(domainObject);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    // This mimics the user clicking around
    click(creator, new Vector3(0, 0, 1), false, new Vector3(0, 0, 0));
    click(creator, new Vector3(1, 0, 1), true, new Vector3(2, 0, 4));

    expect(creator.domainObject).toBe(domainObject);
    expectEqualVector3(domainObject.box.size, new Vector3(2, Box.MinSize, 4));
    expectEqualVector3(domainObject.box.center, new Vector3(1, 0, 2));
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });
});

function click(
  creator: BoxCreator,
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
  const direction = new Vector3(1, 0, -1);
  direction.normalize();
  const ray = new Ray(origin, direction);
  ray.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
  return ray;
}
