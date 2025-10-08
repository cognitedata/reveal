import { beforeEach, describe, expect, test } from 'vitest';
import { CircleMarkerDomainObject } from './CircleMarkerDomainObject';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { PerspectiveCamera, Raycaster, Sprite, Vector2, Vector3 } from 'three';
import { expectChildrenOfTypeAndCount } from '#test-utils/architecture/viewUtil';
import { CircleMarkerView } from './CircleMarkerView';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type CustomObjectIntersectInput } from '@cognite/reveal';

describe(CircleMarkerView.name, () => {
  let view: CircleMarkerView;
  let domainObject: CircleMarkerDomainObject;

  beforeEach(() => {
    const renderTarget = createFullRenderTargetMock();

    // Create the marker and add it to the scene
    domainObject = new CircleMarkerDomainObject();
    renderTarget.root.addChildInteractive(domainObject);
    domainObject.setVisibleInteractive(true, renderTarget);

    view = domainObject.getViewByTarget(renderTarget) as CircleMarkerView;

    // Force update view since nothing is visible in this mock code
    // this is not needed in the real code
    // but needed in the mock code since nothing is rendered in Reveal
    const _ = view.object;
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
});

function getSprite(view: CircleMarkerView): Sprite {
  const sprite = view.object.children[0];
  if (sprite instanceof Sprite) {
    return sprite;
  }
  throw new Error('Child is not a sprite');
}
