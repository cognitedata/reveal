import { beforeEach, describe, expect, test } from 'vitest';
import { CircleMarkerDomainObject } from './CircleMarkerDomainObject';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { PerspectiveCamera, Raycaster, Sprite, Vector2, Vector3 } from 'three';
import { addView, expectChildrenOfTypeAndCount } from '#test-utils/architecture/viewUtil';
import { CircleMarkerView } from './CircleMarkerView';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type CustomObjectIntersectInput } from '@cognite/reveal';
import { expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';

describe(CircleMarkerView.name, () => {
  let view: CircleMarkerView;
  let domainObject: CircleMarkerDomainObject;

  beforeEach(() => {
    const renderTarget = createFullRenderTargetMock();

    domainObject = new CircleMarkerDomainObject();
    renderTarget.root.addChildInteractive(domainObject);

    view = new CircleMarkerView();
    addView(domainObject, view);
  });

  test('should have initial state', () => {
    expectChildrenOfTypeAndCount(view, Sprite, 1);
  });

  test('should change position when move', () => {
    const oldPosition = view.object.position.clone();
    domainObject.position.set(1, 2, 3);
    domainObject.notify(Changes.geometry);
    const newPosition = view.object.position.clone();
    expect(oldPosition).not.toEqual(newPosition);
  });

  test('should change scale when radius change', () => {
    const oldScale = view.object.scale.clone();
    domainObject.radius = 2;
    domainObject.notify(Changes.geometry);
    const newScale = view.object.scale.clone();
    expect(oldScale).not.toEqual(newScale);
  });

  test('should regenerate sprite on color change', () => {
    const oldSprite = getSprite(view);
    domainObject.notify(Changes.color);
    // Simply check if the sprite has been regenerated
    const newSprite = getSprite(view);
    expect(oldSprite).not.toBe(newSprite);
  });

  test('should not intersect', () => {
    const customObjectIntersectInputMock: CustomObjectIntersectInput = {
      raycaster: new Raycaster(new Vector3(0, 0, 0), new Vector3(0, 1, 0)),
      isVisible: (_point: Vector3) => true,
      clippingPlanes: undefined,

      // This is not used in this test
      normalizedCoords: new Vector2(),
      camera: new PerspectiveCamera()
    };

    expect(view.intersectIfCloser(customObjectIntersectInputMock, undefined)).toBeUndefined();
  });

  test('should adjust the point size for when camera near', () => {
    domainObject.position.set(0, 0, 0);
    domainObject.radius = 2;
    domainObject.notify(Changes.geometry);
    const camera = new PerspectiveCamera();
    camera.position.set(0, 20, 0); // Look down from 20 units away
    camera.lookAt(0, 0, 0);

    const expectedScale = new Vector3().setScalar(2 * domainObject.radius);

    // No adjustments expected when camera is far away
    domainObject.style.maxDistanceForSizeAdjustments = 10;
    view.beforeRender(camera);
    expectEqualVector3(view.object.scale, expectedScale);

    // Adjustment expected when camera is close
    camera.position.set(0, 1, 0); // Look down, but closer, 1 unit away, 10% of maxDistanceForSizeAdjustments
    view.beforeRender(camera);
    expectEqualVector3(view.object.scale, expectedScale.clone().multiplyScalar(0.1));

    // Set back to default behavior, no adjustments expected
    domainObject.style.maxDistanceForSizeAdjustments = undefined;
    view.beforeRender(camera);
    expectEqualVector3(view.object.scale, expectedScale);
  });
});

function getSprite(view: CircleMarkerView): Sprite {
  const sprite = view.object.children[0];
  if (sprite instanceof Sprite) {
    return sprite;
  }
  throw new Error('Child is not a sprite');
}
