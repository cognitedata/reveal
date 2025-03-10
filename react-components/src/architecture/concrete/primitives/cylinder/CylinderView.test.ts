/*!
 * Copyright 2024 Cognite AS
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { CylinderView } from './CylinderView';
import { createFullRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { Object3D, PerspectiveCamera, Raycaster, Vector2, Vector3 } from 'three';
import { CylinderDomainObject } from './CylinderDomainObject';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type ThreeView } from '../../../base/views/ThreeView';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type GroupThreeView } from '../../../base/views/GroupThreeView';
import { DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { CDF_TO_VIEWER_TRANSFORMATION, type CustomObjectIntersectInput } from '@cognite/reveal';
import { expectEqualVector3 } from '../../../../../tests/tests-utilities/primitives/primitiveTestUtil';

describe('CylinderView', () => {
  let domainObject: CylinderDomainObject;
  let view: CylinderView;

  beforeEach(() => {
    domainObject = new MockCylinderDomainObject();
    view = new CylinderView();
    addView(domainObject, view);
  });

  test('should have object', () => {
    expect(view.object).toBeInstanceOf(Object3D);
    expectLength(view, 2);
  });

  test('should changed when focus change', () => {
    expect(view.object).toBeInstanceOf(Object3D);
    expectLength(view, 2);

    domainObject.setFocusInteractive(FocusType.Face);
    expectLength(view, 6);

    domainObject.setFocusInteractive(FocusType.Pending);
    expectLength(view, 2);

    domainObject.setFocusInteractive(FocusType.Rotation);
    expectLength(view, 6);

    domainObject.setFocusInteractive(FocusType.Body);
    expectLength(view, 6);

    domainObject.setFocusInteractive(FocusType.Focus);
    expectLength(view, 6);

    domainObject.setFocusInteractive(FocusType.None);
    expectLength(view, 2);
  });

  test('should changed when render style change', () => {
    expectLength(view, 2);

    domainObject.renderStyle.showLines = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    expectLength(view, 1);

    domainObject.renderStyle.showLines = true;
    view.update(new DomainObjectChange(Changes.renderStyle));
    expectLength(view, 2);

    domainObject.renderStyle.showSolid = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    expectLength(view, 1);
  });

  test('should changed when selection change', () => {
    expectLength(view, 2);

    domainObject.isSelected = true;
    view.update(new DomainObjectChange(Changes.selected));
    expectLength(view, 2);
  });

  test('should intersect', () => {
    const intersectInput = createIntersectInput();
    const intersection = view.intersectIfCloser(intersectInput, undefined);
    expect(intersection).toBeDefined();
    if (intersection === undefined) {
      return;
    }
    intersection.point.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.invert());
    expectEqualVector3(intersection.point, domainObject.cylinder.centerA);
    expect(intersection.customObject).toBe(view);
    expect(intersection.distanceToCamera).toBe(1);
  });

  test('should not intersect when point is hidden', () => {
    const intersectInput = createIntersectInput(false);
    const intersection = view.intersectIfCloser(intersectInput, undefined);
    expect(intersection).toBeUndefined();
  });

  test('should not intersect when distance is greater', () => {
    const intersectInput = createIntersectInput();
    const intersection = view.intersectIfCloser(intersectInput, 0.5);
    expect(intersection).toBeUndefined();
  });
});

function expectLength(view: GroupThreeView, expected: number): void {
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

function createIntersectInput(isVisible = true): CustomObjectIntersectInput {
  // Looking down towards centerA with distance 1
  const origin = new Vector3(0, 0, 2);
  const direction = new Vector3(0, 0, -1);

  direction.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
  origin.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

  const raycaster = new Raycaster(origin, direction);
  const customObjectIntersectInputMock: CustomObjectIntersectInput = {
    raycaster,
    isVisible: (_point: Vector3) => isVisible,
    clippingPlanes: undefined,

    // This is not used in this test
    normalizedCoords: new Vector2(),
    camera: new PerspectiveCamera()
  };
  return customObjectIntersectInputMock;
}

function addView(domainObject: DomainObject, view: ThreeView): void {
  const renderTarget = createFullRenderTargetMock();
  view.attach(domainObject, renderTarget);
  view.initialize();
  view.onShow();
  domainObject.views.addView(view);
}
