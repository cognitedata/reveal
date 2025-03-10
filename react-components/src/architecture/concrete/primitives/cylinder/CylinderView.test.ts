/*!
 * Copyright 2024 Cognite AS
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { CylinderView } from './CylinderView';
import { Object3D, Vector3 } from 'three';
import { CylinderDomainObject } from './CylinderDomainObject';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type GroupThreeView } from '../../../base/views/GroupThreeView';
import { DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { CDF_TO_VIEWER_TRANSFORMATION, type CustomObjectIntersectInput } from '@cognite/reveal';
import { expectEqualVector3 } from '../../../../../tests/tests-utilities/primitives/primitiveTestUtil';
import {
  addView,
  createIntersectInput
} from '../../../../../tests/tests-utilities/primitives/viewUtil';
import { isDomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { PrimitivePickInfo } from '../common/PrimitivePickInfo';

describe('CylinderView', () => {
  let domainObject: CylinderDomainObject;
  let view: GroupThreeView;

  beforeEach(() => {
    domainObject = new MockCylinderDomainObject();
    view = new CylinderView();
    addView(domainObject, view);
  });

  test('should have object', () => {
    expect(view.object).toBeInstanceOf(Object3D);
    expectChildrenLength(view, 2);
  });

  test('should changed when focus change', () => {
    expect(view.object).toBeInstanceOf(Object3D);
    expectChildrenLength(view, 2);

    domainObject.setFocusInteractive(FocusType.Face);
    expectChildrenLength(view, 6);

    domainObject.setFocusInteractive(FocusType.Pending);
    expectChildrenLength(view, 2);

    domainObject.setFocusInteractive(FocusType.Rotation);
    expectChildrenLength(view, 6);

    domainObject.setFocusInteractive(FocusType.Body);
    expectChildrenLength(view, 6);

    domainObject.setFocusInteractive(FocusType.Focus);
    expectChildrenLength(view, 6);

    domainObject.setFocusInteractive(FocusType.None);
    expectChildrenLength(view, 2);
  });

  test('should changed when render style change', () => {
    expectChildrenLength(view, 2);

    domainObject.renderStyle.showLines = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    expectChildrenLength(view, 1);

    domainObject.renderStyle.showLines = true;
    view.update(new DomainObjectChange(Changes.renderStyle));
    expectChildrenLength(view, 2);

    domainObject.renderStyle.showSolid = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    expectChildrenLength(view, 1);
  });

  test('should changed when selection change', () => {
    expectChildrenLength(view, 2);

    domainObject.isSelected = true;
    view.update(new DomainObjectChange(Changes.selected));
    expectChildrenLength(view, 2);
  });

  test('should intersect', () => {
    const intersectInput = createLookingDownIntersectInput();
    const intersection = view.intersectIfCloser(intersectInput, undefined);
    expect(intersection).toBeDefined();
    if (intersection === undefined) {
      return;
    }
    intersection.point.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.invert());
    expectEqualVector3(intersection.point, domainObject.cylinder.centerA);
    expect(intersection.customObject).toBe(view);
    expect(intersection.distanceToCamera).toBe(1);
    expect(intersection.userData).instanceOf(PrimitivePickInfo);

    if (isDomainObjectIntersection(intersection)) {
      expect(intersection.domainObject).toBe(domainObject);
    }
  });

  test('should not intersect when point is hidden', () => {
    const intersectInput = createLookingDownIntersectInput(false);
    const intersection = view.intersectIfCloser(intersectInput, undefined);
    expect(intersection).toBeUndefined();
  });

  test('should not intersect when distance is greater', () => {
    const intersectInput = createLookingDownIntersectInput();
    const intersection = view.intersectIfCloser(intersectInput, 0.5);
    expect(intersection).toBeUndefined();
  });
});

function expectChildrenLength(view: GroupThreeView, expected: number): void {
  expect(view.object.children.length).toBe(expected);
}

class MockCylinderDomainObject extends CylinderDomainObject {
  public constructor() {
    super();
    this.cylinder.radius = 2;
    this.cylinder.centerA.set(0, 0, 1);
    this.cylinder.centerB.set(0, 0, -1);
  }
}

function createLookingDownIntersectInput(isVisible = true): CustomObjectIntersectInput {
  // Looking down towards centerA with distance 1
  const origin = new Vector3(0, 0, 2);
  const direction = new Vector3(0, 0, -1);
  return createIntersectInput(origin, direction, isVisible);
}
