import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getRevealDomainUpdateSignal } from './getRevealDomainObjectsSignal';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { CadDomainObject } from '../cad/CadDomainObject';
import { createCadMock } from '#test-utils/fixtures/cadModel';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { DomainObject } from '../../../base/domainObjects/DomainObject';
import { Image360CollectionDomainObject } from '../Image360Collection/Image360CollectionDomainObject';
import { PointCloudDomainObject } from '../pointCloud/PointCloudDomainObject';
import { effect } from '@cognite/signals';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';

describe(getRevealDomainUpdateSignal.name, () => {
  let revealRenderTarget: RevealRenderTarget;

  beforeEach(() => {
    revealRenderTarget = createRenderTargetMock();
  });

  test('returns callback with added Reveal domain objects', () => {
    const cadDomainObject = new CadDomainObject(createCadMock());
    const pointCloudDomainObject = new PointCloudDomainObject(createPointCloudMock());
    const image360DomainObject = new Image360CollectionDomainObject(createImage360ClassicMock());
    const dummyDomainObject = new DummyDomainOject();

    revealRenderTarget.rootDomainObject.addChild(cadDomainObject);
    revealRenderTarget.rootDomainObject.addChild(pointCloudDomainObject);
    revealRenderTarget.rootDomainObject.addChild(image360DomainObject);
    revealRenderTarget.rootDomainObject.addChild(dummyDomainObject);

    const signalResult = getRevealDomainUpdateSignal(revealRenderTarget);

    const value = signalResult.signal()();
    expect(value[0]).toBe(cadDomainObject);
    expect(value[1]).toBe(pointCloudDomainObject);
    expect(value[2]).toBe(image360DomainObject);
  });

  test('adds event listener, and calling dispose removes event listener', () => {
    const addEventMock = vi.spyOn(revealRenderTarget.rootDomainObject.views, 'addEventListener');
    const removeEventMock = vi.spyOn(
      revealRenderTarget.rootDomainObject.views,
      'removeEventListener'
    );

    const res = getRevealDomainUpdateSignal(revealRenderTarget);

    expect(addEventMock).toHaveBeenCalledTimes(1);
    expect(removeEventMock).toHaveBeenCalledTimes(0);

    const eventCallback = addEventMock.mock.calls[0][0];

    res.dispose();

    expect(removeEventMock).toHaveBeenCalledTimes(1);
    expect(removeEventMock).toHaveBeenCalledWith(eventCallback);
  });

  test('signal updates when object is added and removed', () => {
    const cadDomainObject = new CadDomainObject(createCadMock());
    const pointCloudDomainObject = new PointCloudDomainObject(createPointCloudMock());

    let signalUpdates = 0;

    revealRenderTarget.rootDomainObject.addChild(cadDomainObject);

    const signalResult = getRevealDomainUpdateSignal(revealRenderTarget);

    effect(() => {
      signalResult.signal();
      signalUpdates++;
    });

    const initialDomainObjects = signalResult.signal()();

    expect(signalUpdates).toBe(1);
    expect(initialDomainObjects).toHaveLength(1);
    expect(initialDomainObjects[0]).toBe(cadDomainObject);

    revealRenderTarget.rootDomainObject.addChildInteractive(pointCloudDomainObject);

    const domainObjectsAfterAdd = signalResult.signal()();

    expect(signalUpdates).toBe(2);
    expect(domainObjectsAfterAdd).toHaveLength(2);
    expect(domainObjectsAfterAdd[0]).toBe(cadDomainObject);
    expect(domainObjectsAfterAdd[1]).toBe(pointCloudDomainObject);

    cadDomainObject.removeInteractive();

    const domainObjectsAfterRemove = signalResult.signal()();

    expect(signalUpdates).toBe(3);
    expect(domainObjectsAfterRemove).toHaveLength(1);
    expect(domainObjectsAfterRemove[0]).toBe(pointCloudDomainObject);
  });

  test('returns domain objects based on predicate and provided change flag', () => {
    const cadDomainObject = new CadDomainObject(createCadMock());
    const pointCloudDomainObject = new PointCloudDomainObject(createPointCloudMock());

    cadDomainObject.setVisibleInteractive(true, revealRenderTarget);
    pointCloudDomainObject.setVisibleInteractive(true, revealRenderTarget);

    revealRenderTarget.rootDomainObject.addChildInteractive(cadDomainObject);
    revealRenderTarget.rootDomainObject.addChildInteractive(pointCloudDomainObject);

    const signalResult = getRevealDomainUpdateSignal(
      revealRenderTarget,
      (domainObject) => domainObject.isVisible(revealRenderTarget),
      [Changes.visibleState]
    );

    const resultBeforeHiding = signalResult.signal()();
    expect(resultBeforeHiding).toHaveLength(2);
    expect(resultBeforeHiding[0]).toBe(cadDomainObject);
    expect(resultBeforeHiding[1]).toBe(pointCloudDomainObject);

    cadDomainObject.setVisibleInteractive(false, revealRenderTarget);

    const resultAfterHiding = signalResult.signal()();

    expect(resultAfterHiding).toHaveLength(1);
    expect(resultAfterHiding[0]).toBe(pointCloudDomainObject);
  });
});

class DummyDomainOject extends DomainObject {
  typeName = { untranslated: 'DummyDomainObject' };
}
