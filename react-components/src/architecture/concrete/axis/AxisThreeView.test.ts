import { assert, beforeEach, describe, expect, test } from 'vitest';
import { AxisDomainObject } from './AxisDomainObject';
import { AxisThreeView } from './AxisThreeView';
import { createFullRenderTargetMock } from '../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { Box3, LineSegments, Mesh, PerspectiveCamera, Vector3 } from 'three';
import {
  expectChildrenOfTypeAndCount,
  expectVisibleChildren
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
    expectChildrenOfTypeAndCount(view, Mesh, 6); // These are the sides (6 i a box)
    expectChildrenOfTypeAndCount(view, LineSegments, 42); // There are 6 grids for the box, the rest is axis lines
  });

  test('should look towards all 6 sides', () => {
    const camera = new PerspectiveCamera();
    for (const x of [-1, 1]) {
      camera.position.set(x * 200, 0, 0);
      camera.lookAt(0, 0, 0);
      view.beforeRender(camera);
      expectVisibleChildren(view, 26);
    }
    for (const y of [-1, 1]) {
      camera.position.set(0, y * 200, 0);
      camera.lookAt(0, 0, 0);
      view.beforeRender(camera);
      expectVisibleChildren(view, 26);
    }
    for (const z of [-1, 1]) {
      camera.position.set(0, 0, z * 200);
      camera.lookAt(0, 0, 0);
      view.beforeRender(camera);
      expectVisibleChildren(view, 26);
    }
  });

  test('Should look towards all 8 corner', () => {
    const camera = new PerspectiveCamera();
    for (const x of [-1, 1]) {
      for (const y of [-1, 1]) {
        for (const z of [-1, 1]) {
          camera.position.set(x * 200, y * 200, z * 200);
          camera.lookAt(0, 0, 0);
          view.beforeRender(camera);
          expectVisibleChildren(view, 21);
        }
      }
    }
  });
});

function setLargeVisualSceneBoundingBox(renderTarget: RevealRenderTarget): void {
  const { viewer } = renderTarget;
  assert(isViewerMock(viewer));
  const boundingBox = new Box3(new Vector3(), new Vector3()).expandByScalar(100);
  viewer.setVisualSceneBoundingBox(boundingBox);
}
