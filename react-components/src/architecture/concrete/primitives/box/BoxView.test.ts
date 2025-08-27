import { assert, beforeEach, describe, expect, test } from 'vitest';
import { BoxView } from './BoxView';
import { LineSegments, Mesh, Object3D, PerspectiveCamera, Sprite, Vector3 } from 'three';
import { type BoxDomainObject } from './BoxDomainObject';
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
import { MeasureBoxDomainObject } from '../../measurements/MeasureBoxDomainObject';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { BoxFace } from '../common/BoxFace';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';
import { degToRad } from 'three/src/math/MathUtils.js';

describe(BoxView.name, () => {
  let domainObject: BoxDomainObject;
  let view: BoxView;

  beforeEach(() => {
    domainObject = createBoxDomainObject();
    view = new BoxView();
    addView(domainObject, view);
  });

  test('should have initial state', () => {
    updateAndCheckVisibleChildren(view, 1, 1, 3);
  });

  test('should changed when focus change', () => {
    domainObject.setFocusInteractive(FocusType.None);
    updateAndCheckVisibleChildren(view, 1, 1, 3);

    domainObject.setFocusInteractive(FocusType.Pending);
    updateAndCheckVisibleChildren(view, 1, 1, 4);

    const face = new BoxFace(1);
    for (const focusType of [FocusType.Face, FocusType.Rotation, FocusType.Body, FocusType.Focus]) {
      domainObject.setFocusInteractive(focusType, face);
      updateAndCheckVisibleChildren(view, 1, 9, 3);
    }
  });

  test('should changed when render style change', () => {
    domainObject.renderStyle.showLines = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    updateAndCheckVisibleChildren(view, 0, 1, 3);

    domainObject.renderStyle.showLines = true;
    view.update(new DomainObjectChange(Changes.renderStyle));
    updateAndCheckVisibleChildren(view, 1, 1, 3);

    domainObject.renderStyle.showSolid = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    updateAndCheckVisibleChildren(view, 1, 0, 3);

    domainObject.renderStyle.showSolid = true;
    view.update(new DomainObjectChange(Changes.renderStyle));
    updateAndCheckVisibleChildren(view, 1, 1, 3);

    domainObject.renderStyle.showLabel = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    updateAndCheckVisibleChildren(view, 1, 1, 0);
  });

  test('should changed when line width change', () => {
    updateAndCheckVisibleChildren(view, 1, 1, 3);
    domainObject.renderStyle.lineWidth = 5;
    view.update(new DomainObjectChange(Changes.renderStyle));
    updateAndCheckVisibleChildren(view, 0, 1, 3, 1); // This should use the wireframe of the lineSegments
  });

  test('should changed when selection change', () => {
    domainObject.isSelected = true;
    view.update(new DomainObjectChange(Changes.selected));
    updateAndCheckVisibleChildren(view, 1, 1, 3);
  });

  test('should changed when box is rotated', () => {
    updateAndCheckVisibleChildren(view, 1, 1, 3);

    domainObject.box.rotation.z = degToRad(15);
    view.update(new DomainObjectChange(Changes.geometry));

    // When the Z-rotation is not 0, it will add rotation angle label at top.
    updateAndCheckVisibleChildren(view, 1, 1, 4);
  });

  test('should still have 3 labels when camera position changed to opposite direction', () => {
    domainObject.setFocusInteractive(FocusType.Focus);
    updateView(view, true);
    checkVisibleChildren(view, 1, 9, 3);

    // Move camera to look at the box at the opposite direction
    updateView(view, false);
    checkVisibleChildren(view, 1, 9, 3);
  });

  test('should intersect at body', () => {
    const intersectInput = createLookingDownIntersectInput();
    const intersection = view.intersectIfCloser(intersectInput, undefined);
    expect(intersection).toBeDefined();
    assert(intersection !== undefined);

    intersection.point.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.invert());
    expectEqualVector3(intersection.point, new Vector3(0, 0, 1));
    expect(intersection.customObject).toBe(view);
    expect(intersection.distanceToCamera).toBe(1);
    expect(intersection.userData).toBeInstanceOf(PrimitivePickInfo);

    assert(intersection.userData instanceof PrimitivePickInfo);
    expect(intersection.userData.focusType).toBe(FocusType.Face);
    expect(intersection.userData.face.face).toBe(2);

    if (isDomainObjectIntersection(intersection)) {
      expect(intersection.domainObject).toBe(domainObject);
    }
  });

  test('should intersect at corner', () => {
    const relativeXy = 0.99; // Close to the corner
    const origin = new Vector3(relativeXy, relativeXy, 2);
    const direction = new Vector3(0, 0, -1);
    const intersectInput = createIntersectInput(origin, direction);

    const intersection = view.intersectIfCloser(intersectInput, undefined);
    expect(intersection).toBeDefined();
    assert(intersection !== undefined);

    intersection.point.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.invert());
    expectEqualVector3(intersection.point, new Vector3(relativeXy, relativeXy, 1));
    expect(intersection.customObject).toBe(view);
    expect(intersection.distanceToCamera).toBe(1);
    expect(intersection.userData).toBeInstanceOf(PrimitivePickInfo);

    assert(intersection.userData instanceof PrimitivePickInfo);
    expect(intersection.userData.focusType).toBe(FocusType.Corner);
    expect(intersection.userData.face.face).toBe(2);

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

function createBoxDomainObject(): BoxDomainObject {
  const domainObject = new MeasureBoxDomainObject(PrimitiveType.Box);
  domainObject.box.size.set(2, 2, 2);
  domainObject.box.center.set(0, 0, 0);
  return domainObject;
}

function createLookingDownIntersectInput(isVisible = true): CustomObjectIntersectInput {
  // Looking down towards center with distance 1
  const origin = new Vector3(0, 0, 2);
  const direction = new Vector3(0, 0, -1);
  return createIntersectInput(origin, direction, isVisible);
}

function updateAndCheckVisibleChildren(
  view: BoxView,
  lineSegmentCount: number,
  meshCount: number,
  spriteCount: number,
  wireframeCount: number = 0
): void {
  updateView(view);
  checkVisibleChildren(view, lineSegmentCount, meshCount, spriteCount, wireframeCount);
}

function checkVisibleChildren(
  view: BoxView,
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

function updateView(view: BoxView, oppositeDirection = false): void {
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
