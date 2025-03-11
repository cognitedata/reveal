/*!
 * Copyright 2025 Cognite AS
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { CylinderView } from './CylinderView';
import { Object3D, Vector3 } from 'three';
import { type CylinderDomainObject } from './CylinderDomainObject';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { CDF_TO_VIEWER_TRANSFORMATION, type CustomObjectIntersectInput } from '@cognite/reveal';
import { expectEqualVector3 } from '../../../../../tests/tests-utilities/primitives/primitiveTestUtil';
import {
  addView,
  createIntersectInput,
  expectChildrenLength
} from '../../../../../tests/tests-utilities/architecture/viewUtil';
import { isDomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { PrimitivePickInfo } from '../common/PrimitivePickInfo';
import { MeasureCylinderDomainObject } from '../../measurements/MeasureCylinderDomainObject';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';

describe('CylinderView', () => {
  let domainObject: CylinderDomainObject;
  let view: CylinderView;

  beforeEach(() => {
    domainObject = createCylinderDomainObject();
    view = new CylinderView();
    addView(domainObject, view);
    expectChildrenLength(view, 2);
  });

  test('should have object', () => {
    expect(view.object).toBeInstanceOf(Object3D);
  });

  test('should changed when focus change', () => {
    domainObject.setFocusInteractive(FocusType.Face);
    expectChildrenLength(view, 4);

    domainObject.setFocusInteractive(FocusType.Pending);
    expectChildrenLength(view, 2);

    domainObject.setFocusInteractive(FocusType.Rotation);
    expectChildrenLength(view, 4);

    domainObject.setFocusInteractive(FocusType.Body);
    expectChildrenLength(view, 4);

    domainObject.setFocusInteractive(FocusType.Focus);
    expectChildrenLength(view, 4);

    domainObject.setFocusInteractive(FocusType.None);
    expectChildrenLength(view, 2);
  });

  test('should changed when render style change', () => {
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
    expect(intersection.userData).toBeInstanceOf(PrimitivePickInfo);

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

function createCylinderDomainObject(): CylinderDomainObject {
  const domainObject = new MeasureCylinderDomainObject(PrimitiveType.VerticalCylinder);
  // Vertical cylinder with center at (0,0)
  domainObject.cylinder.radius = 2;
  domainObject.cylinder.centerA.set(0, 0, 1);
  domainObject.cylinder.centerB.set(0, 0, -1);
  return domainObject;
}

function createLookingDownIntersectInput(isVisible = true): CustomObjectIntersectInput {
  // Looking down towards centerA with distance 1
  const origin = new Vector3(0, 0, 2);
  const direction = new Vector3(0, 0, -1);
  return createIntersectInput(origin, direction, isVisible);
}
