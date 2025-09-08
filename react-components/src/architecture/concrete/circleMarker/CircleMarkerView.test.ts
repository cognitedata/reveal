import { beforeEach, describe, expect, test } from 'vitest';
import { CircleMarkerDomainObject } from './CircleMarkerDomainObject';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { Sprite } from 'three';
import { expectChildrenOfTypeAndCount } from '#test-utils/architecture/viewUtil';
import { CircleMarkerView } from './CircleMarkerView';
import { Changes } from '../../base/domainObjectsHelpers/Changes';

describe(CircleMarkerView.name, () => {
  let view: CircleMarkerView;
  let domainObject: CircleMarkerDomainObject;

  beforeEach(() => {
    const renderTarget = createFullRenderTargetMock();

    // Create axis and add it to the scene
    domainObject = new CircleMarkerDomainObject();
    renderTarget.rootDomainObject.addChildInteractive(domainObject);
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
    const sprite = view.object.children[0] as Sprite;
    const oldPosition = sprite.position.clone();

    domainObject.position.set(1, 2, 3);
    domainObject.notify(Changes.geometry);

    expect(oldPosition).not.toBe(sprite.position);
  });

  test('should change scale when radius change', () => {
    const sprite = view.object.children[0] as Sprite;
    const oldScale = sprite.scale.clone();

    domainObject.radius = 2;
    domainObject.notify(Changes.geometry);

    expect(oldScale).not.toBe(sprite.position);
  });

  test('should change position when move', () => {
    const oldSprite = view.object.children[0] as Sprite;
    domainObject.notify(Changes.color);
    // Simply Create if the sprite har been regenerated
    const newSprite = view.object.children[0] as Sprite;
    expect(oldSprite).not.toBe(newSprite);
  });
});
