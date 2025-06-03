/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { LineCreator } from './LineCreator';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { Vector3 } from 'three';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { MeasureLineDomainObject } from '../../measurements/MeasureLineDomainObject';
import { FolderDomainObject } from '../../../base/domainObjects/FolderDomainObject';
import { type BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { click } from '#test-utils/architecture/baseCreatorUtil';

describe(LineCreator.name, () => {
  test('create Line by mimics the user clicking 2 times', () => {
    const domainObject = new MeasureLineDomainObject(PrimitiveType.Line);
    const creator = new LineCreator(domainObject);
    expect(domainObject.focusType).toBe(FocusType.Pending);
    const points = [new Vector3(0, 0, 1), new Vector3(1, 0, 1)];
    clickMe(creator, points[0], false);
    clickMe(creator, points[1], true);
    expect(creator.domainObject).toBe(domainObject);
    expect(domainObject.points).toStrictEqual(points);
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });

  test('create Polygon or by mimics the user clicking 4 times', () => {
    const domainObject = new MeasureLineDomainObject(PrimitiveType.Polygon);
    const creator = new LineCreator(domainObject);
    expect(domainObject.focusType).toBe(FocusType.Pending);
    const points = [
      new Vector3(0, 0, 1),
      new Vector3(1, 0, 2),
      new Vector3(1, 1, 1),
      new Vector3(2, 1, 2)
    ];
    for (const point of points) {
      clickMe(creator, point, false);
    }
    expect(creator.escape()).toBe(true);

    expect(creator.domainObject).toBe(domainObject);
    expect(domainObject.points).toStrictEqual(points);
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });

  test('try to create Polygon with too few points', () => {
    const domainObject = new MeasureLineDomainObject(PrimitiveType.Polygon);
    const folder = new FolderDomainObject();
    folder.addChild(domainObject);
    expect(domainObject.hasParent).toBe(true);
    const creator = new LineCreator(domainObject);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    const points = [new Vector3(0, 0, 1), new Vector3(0, 1, 1)];
    for (const point of points) {
      clickMe(creator, point, false);
    }
    expect(creator.escape()).toBe(false);
    expect(domainObject.hasParent).toBe(false);
  });
});

function clickMe(creator: BaseCreator, point: Vector3, isFinished: boolean): void {
  const direction = new Vector3(0, 0, -1);
  point = point.clone();
  const origin = point.clone().addScaledVector(direction, -1);
  click(creator, origin, direction, isFinished, point);
}
