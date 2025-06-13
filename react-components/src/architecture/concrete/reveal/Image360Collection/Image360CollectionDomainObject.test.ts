import { describe, expect, test, vi } from 'vitest';
import { Image360CollectionDomainObject } from './Image360CollectionDomainObject';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { waitFor } from '@testing-library/react';
import { Image360CollectionRenderStyle } from './Image360CollectionRenderStyle';
import { viewerMock } from '#test-utils/fixtures/viewer';

describe(Image360CollectionDomainObject.name, () => {
  test('has expected default values', () => {
    const image360Collection = createImage360ClassicMock();

    const domainObject = new Image360CollectionDomainObject(image360Collection);

    expect(domainObject.model).toBe(image360Collection);
    expect(domainObject.typeName).toEqual({ untranslated: 'Image360' });
    expect(domainObject.icon).toEqual('View360');
    expect(domainObject.hasIconColor).toEqual(false);
    expect(domainObject.createRenderStyle()).toBeInstanceOf(Image360CollectionRenderStyle);
  });

  test('should register event listeners for entering and exiting, which calls the command updater', async () => {
    const renderTargetMock = createRenderTargetMock();
    const image360Collection = createImage360ClassicMock();

    const domainObject = new Image360CollectionDomainObject(image360Collection);
    renderTargetMock.rootDomainObject.addChild(domainObject);

    const [onEventType0, registeredCallback0] = vi.mocked(image360Collection.on).mock.calls[0];
    const [onEventType1, registeredCallback1] = vi.mocked(image360Collection.on).mock.calls[1];

    expect(onEventType0).toBe('image360Entered');
    expect(onEventType1).toBe('image360Exited');

    expect(renderTargetMock.commandsController.update).not.toHaveBeenCalled();

    registeredCallback0();

    await waitFor(async () => {
      expect(renderTargetMock.commandsController.update).toHaveBeenCalledTimes(1);
    });

    registeredCallback1();

    await waitFor(async () => {
      expect(renderTargetMock.commandsController.update).toHaveBeenCalledTimes(2);
    });
  });

  test('should remove event listeners and 360 collection on removal', () => {
    const renderTargetMock = createRenderTargetMock();

    const image360Collection = createImage360ClassicMock();

    const domainObject = new Image360CollectionDomainObject(image360Collection);
    renderTargetMock.rootDomainObject.addChild(domainObject);

    const eventAndListener0 = vi.mocked(image360Collection.on).mock.calls[0];
    const eventAndListener1 = vi.mocked(image360Collection.on).mock.calls[1];

    domainObject.removeInteractive();

    expect(viewerMock.remove360ImageSet).toHaveBeenCalledWith(image360Collection);
    expect(vi.mocked(image360Collection.off).mock.calls[0]).toEqual(eventAndListener0);
    expect(vi.mocked(image360Collection.off).mock.calls[1]).toEqual(eventAndListener1);
  });
});
