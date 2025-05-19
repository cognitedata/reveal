/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { Vector3 } from 'three';
import { click } from '#test-utils/architecture/baseCreatorUtil';
import { Image360AnnotationCreator } from './Image360AnnotationCreator';
import { type BaseCreator } from '../../base/domainObjectsHelpers/BaseCreator';
import { FocusType } from '../../base/domainObjectsHelpers/FocusType';
import { createEmptyImage360Annotation } from './testUtilities';
import { Image360AnnotationFolder } from './Image360AnnotationFolder';
import { forEach } from 'lodash';
import { expectEqualVector3 } from '../../../../tests/tests-utilities/primitives/primitiveTestUtil';

describe(Image360AnnotationCreator.name, () => {
  test('create Polygon or by mimics the user clicking 4 times', () => {
    const domainObject = createEmptyImage360Annotation();
    const folder = new Image360AnnotationFolder();
    folder.addChild(domainObject);

    const creator = new Image360AnnotationCreator(domainObject);
    expect(domainObject.focusType).toBe(FocusType.Pending);
    expect(creator.domainObject).toBe(domainObject);

    const points = [
      new Vector3(0, 0, 1),
      new Vector3(1, 0, 2),
      new Vector3(1, 1, 1),
      new Vector3(2, 1, 2)
    ];
    forEach(points, (point) => {
      point.normalize();
    });
    for (const point of points) {
      clickMe(creator, domainObject.center, point, false);
    }
    expect(creator.escape()).toBe(true);
    expect(domainObject.hasParent).toBe(true);

    expect(domainObject.points).toHaveLength(points.length);
    for (let i = 0; i < points.length; i++) {
      expectEqualVector3(domainObject.points[i], points[i]);
    }
    expect(domainObject.focusType).toBe(FocusType.Focus);
  });

  test('try to create Polygon with too few points', () => {
    const domainObject = createEmptyImage360Annotation();
    const folder = new Image360AnnotationFolder();
    folder.addChild(domainObject);

    const creator = new Image360AnnotationCreator(domainObject);
    expect(domainObject.focusType).toBe(FocusType.Pending);
    expect(creator.domainObject).toBe(domainObject);

    const points = [new Vector3(0, 0, 1), new Vector3(0, 1, 1)];
    forEach(points, (point) => {
      point.normalize();
    });
    expect(creator.escape()).toBe(false);
    expect(domainObject.hasParent).toBe(false);
  });
});

function clickMe(
  creator: BaseCreator,
  origin: Vector3,
  direction: Vector3,
  isFinished: boolean
): void {
  click(creator, origin, direction, isFinished, direction);
}
