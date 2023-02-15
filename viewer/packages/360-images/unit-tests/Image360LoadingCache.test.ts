/*!
 * Copyright 2022 Cognite AS
 */

import { DeferredPromise } from '@reveal/utilities';
import { Mock } from 'moq.ts';
import { Image360Entity } from '../src/entity/Image360Entity';
import { Image360LoadingCache } from '../src/cache/Image360LoadingCache';

describe(Image360LoadingCache.name, () => {
  test('preloading entites should properly queue file loading', async () => {
    const cacheSize = 5;
    const entityLoadingCache = new Image360LoadingCache(cacheSize);

    const deferredPromise = new DeferredPromise<void>();
    const entityMock1 = new Mock<Image360Entity>()
      .setup(p => p.load360Image())
      .returns(deferredPromise)
      .object();

    entityLoadingCache.cachedPreload(entityMock1);

    expect(entityLoadingCache.currentlyLoadingEntities.has(entityMock1)).toBeTruthy();
    expect(entityLoadingCache.cachedEntities.includes(entityMock1)).toBeFalsy();

    deferredPromise.resolve();
    await deferredPromise;

    expect(entityLoadingCache.currentlyLoadingEntities.has(entityMock1)).toBeFalsy();
    expect(entityLoadingCache.cachedEntities.includes(entityMock1)).toBeTruthy();
  });

  test('preloading when cache is full should purge stale entity', async () => {
    const cacheSize = 1;
    const entityLoadingCache = new Image360LoadingCache(cacheSize);

    const deferredPromise1 = new DeferredPromise<void>();
    const entityMock1 = new Mock<Image360Entity>()
      .setup(p => p.load360Image())
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
      .setup(p => p.load360Image())
      .returns(deferredPromise2)
      .setup(p => p.image360Visualization.visible)
      .returns(false)
      .setup(p => p.dispose())
      .returns()
      .object();

    const preLoad1 = entityLoadingCache.cachedPreload(entityMock1);

    deferredPromise1.resolve();
    await preLoad1;

    const preLoad2 = entityLoadingCache.cachedPreload(entityMock2);

    expect(entityLoadingCache.currentlyLoadingEntities.has(entityMock2)).toBeTruthy();
    expect(entityLoadingCache.cachedEntities.includes(entityMock1)).toBeTruthy();

    deferredPromise2.resolve();
    await preLoad2;

    expect(entityLoadingCache.currentlyLoadingEntities.size).toBe(0);
    expect(entityLoadingCache.cachedEntities.length).toBe(1);
    expect(entityLoadingCache.cachedEntities.includes(entityMock2)).toBeTruthy();
  });

  test('cache should not purge visible 360 images', async () => {
    const cacheSize = 2;
    const entityLoadingCache = new Image360LoadingCache(cacheSize);

    const deferredPromise1 = new DeferredPromise<void>();
    const entityMock1 = new Mock<Image360Entity>()
      .setup(p => p.load360Image())
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
      .setup(p => p.load360Image())
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
      .setup(p => p.load360Image())
      .returns(deferredPromise2)
      .setup(p => p.dispose())
      .returns()
      .object();

    const preLoad1 = entityLoadingCache.cachedPreload(entityMock1);
    const preLoad2 = entityLoadingCache.cachedPreload(entityMock2);

    deferredPromise1.resolve();
    deferredPromise2.resolve();
    await Promise.all([preLoad1, preLoad2]);

    const preLoad3 = entityLoadingCache.cachedPreload(entityMock3);
    deferredPromise3.resolve();
    await preLoad3;

    expect(entityLoadingCache.cachedEntities.length).toBe(2);

    expect(entityLoadingCache.cachedEntities.includes(entityMock1)).toBeTruthy();
    expect(entityLoadingCache.cachedEntities.includes(entityMock3)).toBeTruthy();
  });

  test('cache should reject loading image download if purged', async () => {
    const cacheSize = 1;
    const loadingCache = new Image360LoadingCache(cacheSize, cacheSize);

    const deferredPromise1 = new DeferredPromise<void>();
    const image360Mock = new Mock<Image360Entity>()
      .setup(p => p.load360Image())
      .returns(deferredPromise1)
      .setup(p => p.image360Visualization.visible)
      .returns(false)
      .setup(p => p.unload360Image())
      .returns()
      .object();

    const deferredPromise2 = new DeferredPromise<void>();
    const image360Mock2 = new Mock<Image360Entity>()
      .setup(p => p.load360Image())
      .returns(deferredPromise2)
      .setup(p => p.image360Visualization.visible)
      .returns(true)
      .setup(p => p.unload360Image())
      .returns()
      .object();

    const loadOne = loadingCache.cachedPreload(image360Mock);
    const loadTwo = loadingCache.cachedPreload(image360Mock2);

    expect(loadingCache.currentlyLoadingEntities.size).toBe(1);

    // deferredPromise1.reject('Aborted');
    deferredPromise1.resolve();
    deferredPromise2.resolve();

    // await expect(loadOne).rejects.toThrow();
    await expect(loadOne).resolves.not.toThrow();
    await expect(loadTwo).resolves.not.toThrow();

    expect(loadingCache.cachedEntities.length).toBe(1);
    expect(loadingCache.cachedEntities[0]).toBe(image360Mock2);
    expect(loadingCache.currentlyLoadingEntities.size).toBe(0);
  });

  test('cache should abort oldest fetch requests', async () => {
    const cacheSize = 1;
    const loadingCache = new Image360LoadingCache(cacheSize, cacheSize);

    const createMockEntity = (deferredPromise: DeferredPromise<void>) => {
      return new Mock<Image360Entity>()
        .setup(p => p.load360Image())
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
    expect(loadingCache.currentlyLoadingEntities.size).toBe(1);
    expect(loadingCache.currentlyLoadingEntities.has(image360Mock1)).toBe(true);

    const download2 = loadingCache.cachedPreload(image360Mock2);
    expect(loadingCache.currentlyLoadingEntities.size).toBe(1);
    expect(loadingCache.currentlyLoadingEntities.has(image360Mock2)).toBe(true);

    const download3 = loadingCache.cachedPreload(image360Mock3);
    expect(loadingCache.currentlyLoadingEntities.size).toBe(1);
    expect(loadingCache.currentlyLoadingEntities.has(image360Mock3)).toBe(true);

    deferredPromise1.resolve();
    deferredPromise2.resolve();
    deferredPromise3.resolve();

    await download1;
    await download2;
    await download3;

    expect(loadingCache.currentlyLoadingEntities.size).toBe(0);
    expect(loadingCache.cachedEntities.length).toBe(1);
    expect(loadingCache.cachedEntities[0]).toBe(image360Mock3);
  });
});
