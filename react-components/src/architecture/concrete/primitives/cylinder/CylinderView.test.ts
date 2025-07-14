import { assert, beforeEach, describe, expect, test } from 'vitest';
import { CylinderView } from './CylinderView';
import { LineSegments, Mesh, Object3D, PerspectiveCamera, Sprite, Vector3 } from 'three';
import { type CylinderDomainObject } from './CylinderDomainObject';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { CDF_TO_VIEWER_TRANSFORMATION, type CustomObjectIntersectInput } from '@cognite/reveal';
import { expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';
import {
  addView,
  createIntersectInput,
  expectVisibleChildren,
  expectVisibleChildrenOfType
} from '#test-utils/architecture/viewUtil';
import { isDomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { PrimitivePickInfo } from '../common/PrimitivePickInfo';
import { MeasureCylinderDomainObject } from '../../measurements/MeasureCylinderDomainObject';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';

describe(CylinderView.name, () => {
  let domainObject: CylinderDomainObject;
  let view: CylinderView;

  beforeEach(() => {
    domainObject = createCylinderDomainObject();
    view = new CylinderView();
    addView(domainObject, view);
    updateView(view);
  });

  test('should have default visible children', () => {
    updateAndCheckVisibleChildren(view, 1, 1, 2);
  });

  test('should changed when focus change', () => {
    for (const focusType of [FocusType.None, FocusType.Pending]) {
      domainObject.setFocusInteractive(focusType);
      updateAndCheckVisibleChildren(view, 1, 1, 2);
    }
    for (const focusType of [FocusType.Face, FocusType.Rotation, FocusType.Body, FocusType.Focus]) {
      domainObject.setFocusInteractive(focusType);
      updateAndCheckVisibleChildren(view, 1, 5, 2);
    }
  });

  test('should changed when render style change', () => {
    domainObject.renderStyle.showLines = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    updateAndCheckVisibleChildren(view, 0, 1, 2);

    domainObject.renderStyle.showLines = true;
    view.update(new DomainObjectChange(Changes.renderStyle));
    updateAndCheckVisibleChildren(view, 1, 1, 2);

    domainObject.renderStyle.showSolid = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    updateAndCheckVisibleChildren(view, 1, 0, 2);

    domainObject.renderStyle.showSolid = true;
    view.update(new DomainObjectChange(Changes.renderStyle));
    updateAndCheckVisibleChildren(view, 1, 1, 2);

    domainObject.renderStyle.showLabel = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    updateAndCheckVisibleChildren(view, 1, 1, 0);
  });

  test('should changed when line width change', () => {
    updateAndCheckVisibleChildren(view, 1, 1, 2);
    domainObject.renderStyle.lineWidth = 5;
    view.update(new DomainObjectChange(Changes.renderStyle));
    updateAndCheckVisibleChildren(view, 0, 1, 2, 1); // This should use the wireframe of the lineSegments
  });

  test('should changed when selection change', () => {
    domainObject.isSelected = true;
    view.update(new DomainObjectChange(Changes.selected));
    updateAndCheckVisibleChildren(view, 1, 1, 2);
  });

  test('should still have labels when camera position changed to opposite direction', () => {
    updateView(view, true);
    checkVisibleChildren(view, 1, 1, 2);

    // Move camera to look at the box at the opposite direction
    updateView(view, false);
    checkVisibleChildren(view, 1, 1, 2);
  });

  test('should intersect', () => {
    const intersectInput = createLookingDownIntersectInput();
    const intersection = view.intersectIfCloser(intersectInput, undefined);
    expect(intersection).toBeDefined();
    assert(intersection !== undefined);

    intersection.point.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.invert());
    expectEqualVector3(intersection.point, new Vector3(0, 0, 2));
    expect(intersection.customObject).toBe(view);
    expect(intersection.distanceToCamera).toBe(2);
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
  const domainObject = new MeasureCylinderDomainObject(PrimitiveType.HorizontalCylinder);
  // Horizontal cylinder with center at (0,0)
  domainObject.cylinder.radius = 2;
  domainObject.cylinder.centerA.set(1, 0, 0);
  domainObject.cylinder.centerB.set(-1, 0, 0);
  return domainObject;
}

function createLookingDownIntersectInput(isVisible = true): CustomObjectIntersectInput {
  // Looking down towards centerA with distance 1
  const origin = new Vector3(0, 0, 4);
  const direction = new Vector3(0, 0, -1);
  return createIntersectInput(origin, direction, isVisible);
}

function updateAndCheckVisibleChildren(
  view: CylinderView,
  lineSegmentCount: number,
  meshCount: number,
  spriteCount: number,
  wireframeCount: number = 0
): void {
  updateView(view);
  checkVisibleChildren(view, lineSegmentCount, meshCount, spriteCount, wireframeCount);
}

function checkVisibleChildren(
  view: CylinderView,
  lineSegmentCount: number,
  meshCount: number,
  spriteCount: number,
  wireframeCount: number = 0
): void {
  expect(view.object).toBeInstanceOf(Object3D);
  expectVisibleChildrenOfType(view, LineSegments, lineSegmentCount);
  expectVisibleChildrenOfType(view, Mesh, meshCount + wireframeCount); // Wireframe is also a mesh
  expectVisibleChildrenOfType(view, Sprite, spriteCount);
  expectVisibleChildrenOfType(view, Wireframe, wireframeCount);
  expectVisibleChildren(view, lineSegmentCount + meshCount + spriteCount + wireframeCount);
}

function updateView(view: CylinderView, oppositeDirection = false): void {
  const _ = view.object; // This force to the view to be updated
  const camera = new PerspectiveCamera();
  camera.position.set(5, 5, 5); // Look down
  if (oppositeDirection) {
    camera.position.negate(); // Look up
  }
  camera.lookAt(0, 0, 0);
  // This force the labels in correct position according to the camera
  view.beforeRender(camera);
}
