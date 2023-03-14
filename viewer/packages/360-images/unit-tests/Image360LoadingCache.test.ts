/*!
 * Copyright 2022 Cognite AS
 */

import { DeferredPromise } from '@reveal/utilities';
import { It, Mock } from 'moq.ts';
import { Image360Entity } from '../src/entity/Image360Entity';
import { Image360LoadingCache } from '../src/cache/Image360LoadingCache';

describe(Image360LoadingCache.name, () => {
  test('preloading entites should properly queue file loading', async () => {
    const cacheSize = 5;
    const entityLoadingCache = new Image360LoadingCache(cacheSize);

    const deferredPromise = new DeferredPromise<void>();
    const entityMock1 = new Mock<Image360Entity>()
      .setup(p => p.load360Image(It.IsAny()))
      .returns(deferredPromise)
      .object();

    entityLoadingCache.cachedPreload(entityMock1);

    expect(entityLoadingCache.getDownloadInProgress(entityMock1)).not.toBe(undefined);
    expect(entityLoadingCache.cachedEntities.includes(entityMock1)).toBeFalsy();

    deferredPromise.resolve(undefined);
    await deferredPromise;

    expect(entityLoadingCache.getDownloadInProgress(entityMock1)).toBe(undefined);
    expect(entityLoadingCache.cachedEntities.includes(entityMock1)).toBeTruthy();
  });

  test('preloading when cache is full should purge stale entity', async () => {
    const cacheSize = 1;
    const entityLoadingCache = new Image360LoadingCache(cacheSize);

    const deferredPromise1 = new DeferredPromise<void>();
    const entityMock1 = new Mock<Image360Entity>()
      .setup(p => p.load360Image(It.IsAny()))
      .returns(deferredPromise1)
      .setup(p => p.image360Visualization.visible)
      .returns(false)
      .setup(p => p.dispose())
      .returns()
      .setup(p => p.unload360Image())
      .returns()
      .object();

    const deferredPromise2 = new DeferredPromise<void>();
    const entityMock2 = new Mock<Image360Entity>()
      .setup(p => p.load360Image(It.IsAny()))
      .returns(deferredPromise2)
      .setup(p => p.image360Visualization.visible)
      .returns(false)
      .setup(p => p.dispose())
      .returns()
      .object();

    const preLoad1 = entityLoadingCache.cachedPreload(entityMock1);

    deferredPromise1.resolve(undefined);
    await preLoad1;

    const preLoad2 = entityLoadingCache.cachedPreload(entityMock2);

    expect(entityLoadingCache.getDownloadInProgress(entityMock2)).not.toBe(undefined);
    expect(entityLoadingCache.cachedEntities.includes(entityMock1)).toBeTruthy();

    deferredPromise2.resolve(undefined);
    await preLoad2;

    expect(entityLoadingCache.currentlyLoadingEntities.length).toBe(0);
    expect(entityLoadingCache.cachedEntities.length).toBe(1);
    expect(entityLoadingCache.cachedEntities.includes(entityMock2)).toBeTruthy();
  });

  test('cache should not purge visible 360 images', async () => {
    const cacheSize = 2;
    const entityLoadingCache = new Image360LoadingCache(cacheSize);

    const deferredPromise1 = new DeferredPromise<void>();
    const entityMock1 = new Mock<Image360Entity>()
      .setup(p => p.load360Image(It.IsAny()))
      .returns(deferredPromise1)
      .setup(p => p.dispose())
      .returns()
      .setup(p => p.image360Visualization.visible)
      .returns(true)
      .setup(p => p.unload360Image())
      .returns()
      .object();

    const deferredPromise2 = new DeferredPromise<void>();
    const entityMock2 = new Mock<Image360Entity>()
      .setup(p => p.load360Image(It.IsAny()))
      .returns(deferredPromise2)
      .setup(p => p.dispose())
      .returns()
      .setup(p => p.image360Visualization.visible)
      .returns(false)
      .setup(p => p.unload360Image())
      .returns()
      .object();

    const deferredPromise3 = new DeferredPromise<void>();
    const entityMock3 = new Mock<Image360Entity>()
      .setup(p => p.load360Image(It.IsAny()))
      .returns(deferredPromise2)
      .setup(p => p.dispose())
      .returns()
      .object();

    const preLoad1 = entityLoadingCache.cachedPreload(entityMock1);
    const preLoad2 = entityLoadingCache.cachedPreload(entityMock2);

    deferredPromise1.resolve(undefined);
    deferredPromise2.resolve(undefined);
    await Promise.all([preLoad1, preLoad2]);

    const preLoad3 = entityLoadingCache.cachedPreload(entityMock3);
    deferredPromise3.resolve(undefined);
    await preLoad3;

    expect(entityLoadingCache.cachedEntities.length).toBe(2);

    expect(entityLoadingCache.cachedEntities.includes(entityMock1)).toBeTruthy();
    expect(entityLoadingCache.cachedEntities.includes(entityMock3)).toBeTruthy();
  });

  test('cache should handle failed downloads', async () => {
    const cacheSize = 3;
    const loadingCache = new Image360LoadingCache(cacheSize, cacheSize);

    const promiseToReject = new DeferredPromise<void>();
    const image360MockToReject = new Mock<Image360Entity>()
      .setup(p => p.load360Image(It.IsAny()))
      .returns(promiseToReject)
      .object();

    const promiseToResolve = new DeferredPromise<void>();
    const image360MockToResolve = new Mock<Image360Entity>()
      .setup(p => p.load360Image(It.IsAny()))
      .returns(promiseToResolve)
      .object();

    const image360MockToThrow = new Mock<Image360Entity>()
      .setup(p => p.load360Image(It.IsAny()))
      .throwsAsync('Aborted')
      .object();

    const downloadToReject = loadingCache.cachedPreload(image360MockToReject);
    const downloadToResolve = loadingCache.cachedPreload(image360MockToResolve);
    const downloadToThrow = loadingCache.cachedPreload(image360MockToThrow);

    expect(loadingCache.currentlyLoadingEntities.length).toBe(3);

    promiseToReject.reject('Aborted');
    promiseToResolve.resolve(undefined);

    await expect(downloadToReject).resolves.not.toThrow();
    await expect(downloadToResolve).resolves.not.toThrow();
    await expect(downloadToThrow).resolves.not.toThrow();

    expect(loadingCache.cachedEntities.length).toBe(1);
    expect(loadingCache.cachedEntities[0]).toBe(image360MockToResolve);
    expect(loadingCache.currentlyLoadingEntities.length).toBe(0);
  });

  test('cache should abort oldest fetch requests when cacheSize is exceeded', async () => {
    const cacheSize = 2;
    const loadingCache = new Image360LoadingCache(cacheSize, cacheSize);

    const createMockEntity = (deferredPromise: DeferredPromise<void>) => {
      return new Mock<Image360Entity>()
        .setup(p => p.load360Image(It.IsAny()))
        .returns(deferredPromise)
        .setup(p => p.image360Visualization.visible)
        .returns(false)
        .setup(p => p.unload360Image())
        .returns();
    };

    const deferredPromise1 = new DeferredPromise<void>();
    const image360Mock1 = createMockEntity(deferredPromise1).object();

    const deferredPromise2 = new DeferredPromise<void>();
    const image360Mock2 = createMockEntity(deferredPromise2).object();

    const deferredPromise3 = new DeferredPromise<void>();
    const image360Mock3 = createMockEntity(deferredPromise3).object();

    const download1 = loadingCache.cachedPreload(image360Mock1);
    const download2 = loadingCache.cachedPreload(image360Mock2);
    expect(loadingCache.currentlyLoadingEntities.length).toBe(2);
    expect(loadingCache.getDownloadInProgress(image360Mock1)).not.toBe(undefined);
    expect(loadingCache.getDownloadInProgress(image360Mock2)).not.toBe(undefined);

    const download3 = loadingCache.cachedPreload(image360Mock3);
    expect(loadingCache.currentlyLoadingEntities.length).toBe(2);
    expect(loadingCache.getDownloadInProgress(image360Mock2)).not.toBe(undefined);
    expect(loadingCache.getDownloadInProgress(image360Mock3)).not.toBe(undefined);

    deferredPromise1.resolve(undefined);
    deferredPromise2.resolve(undefined);
    deferredPromise3.resolve(undefined);

    await download1;
    await download2;
    await download3;

    expect(loadingCache.currentlyLoadingEntities.length).toBe(0);
    expect(loadingCache.cachedEntities.length).toBe(2);
    expect(loadingCache.cachedEntities[0]).toBe(image360Mock3);
    expect(loadingCache.cachedEntities[1]).toBe(image360Mock2);
  });
});
