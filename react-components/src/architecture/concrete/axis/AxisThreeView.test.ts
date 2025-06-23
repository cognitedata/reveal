import { assert, beforeEach, describe, expect, test } from 'vitest';
import { AxisDomainObject } from './AxisDomainObject';
import { AxisThreeView } from './AxisThreeView';
import { createFullRenderTargetMock } from '../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { Box3, LineSegments, Mesh, PerspectiveCamera, Sprite, Vector3 } from 'three';
import {
  expectChildrenLength,
  expectChildrenOfTypeAndCount,
  expectVisibleChildren,
  expectVisibleChildrenOfType
} from '../../../../tests/tests-utilities/architecture/viewUtil';
import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';
import { isViewerMock } from '#test-utils/fixtures/viewer';

describe(AxisThreeView.name, () => {
  let view: AxisThreeView;

  beforeEach(() => {
    const renderTarget = createFullRenderTargetMock();
    setLargeVisualSceneBoundingBox(renderTarget);

    // Create axis and add it to the scene
    const axisDomainObject = new AxisDomainObject();
    renderTarget.rootDomainObject.addChildInteractive(axisDomainObject);
    axisDomainObject.setVisibleInteractive(true, renderTarget);

    view = axisDomainObject.getViewByTarget(renderTarget) as AxisThreeView;

    // Force update view since nothing is visible in this mock code
    // this is not needed in the real code
    // but needed in the mock code since nothing is rendered in Reveal
    const _ = view.object;
  });

  test('should have initial state', () => {
    expect(view.object).toBeDefined();
    expectChildrenLength(view, 6 + 144 + 42);
    expectChildrenOfTypeAndCount(view, Mesh, 6); // These are the sides (6 i a box)
    expectChildrenOfTypeAndCount(view, Sprite, 144); // Number of labels
    expectChildrenOfTypeAndCount(view, LineSegments, 42); // There are 6 grids for the box, the rest is axis lines
  });

  test('should look towards all 6 sides', () => {
    const camera = new PerspectiveCamera();
    camera.lookAt(0, 0, 0);

    setCameraPositionAndCheck(camera, +1, 0, 0, view);
    setCameraPositionAndCheck(camera, -1, 0, 0, view);
    setCameraPositionAndCheck(camera, 0, +1, 0, view);
    setCameraPositionAndCheck(camera, 0, -1, 0, view);
    setCameraPositionAndCheck(camera, 0, 0, +1, view);
    setCameraPositionAndCheck(camera, 0, 0, -1, view);

    function setCameraPositionAndCheck(
      camera: PerspectiveCamera,
      x: number,
      y: number,
      z: number,
      view: AxisThreeView
    ): void {
      camera.position.set(x, y, z);
      camera.position.multiplyScalar(200);
      view.beforeRender(camera);
      checkChildren(view, 21, 5, 48);
    }
  });

  test('Should look towards all 8 corner', () => {
    const camera = new PerspectiveCamera();
    camera.lookAt(0, 0, 0);
    for (const x of [-1, 1]) {
      for (const y of [-1, 1]) {
        for (const z of [-1, 1]) {
          setCameraPositionAndCheck(camera, x, y, z, view);
        }
      }
    }

    function setCameraPositionAndCheck(
      camera: PerspectiveCamera,
      x: number,
      y: number,
      z: number,
      view: AxisThreeView
    ): void {
      camera.position.set(x, y, z);
      camera.position.multiplyScalar(200);
      view.beforeRender(camera);
      checkChildren(view, 18, 3, 72);
    }
  });
});

function checkChildren(
  view: AxisThreeView,
  lineSegmentCount: number,
  meshCount: number,
  spriteCount: number
): void {
  expectVisibleChildrenOfType(view, LineSegments, lineSegmentCount);
  expectVisibleChildrenOfType(view, Mesh, meshCount);
  expectVisibleChildrenOfType(view, Sprite, spriteCount);
  expectVisibleChildren(view, lineSegmentCount + meshCount + spriteCount);
}

function setLargeVisualSceneBoundingBox(renderTarget: RevealRenderTarget): void {
  const { viewer } = renderTarget;
  assert(isViewerMock(viewer));
  const boundingBox = new Box3(new Vector3(), new Vector3()).expandByScalar(100);
  viewer.setVisualSceneBoundingBox(boundingBox);
}
