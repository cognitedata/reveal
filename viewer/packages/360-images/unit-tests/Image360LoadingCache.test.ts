/*!
 * Copyright 2022 Cognite AS
 */

import { DeferredPromise } from '@reveal/utilities';
import { It, Mock } from 'moq.ts';
import { Image360LoadingCache } from '../src/cache/Image360LoadingCache';
import { Image360RevisionEntity } from '../src/entity/Image360RevisionEntity';

describe(Image360LoadingCache.name, () => {
  test('preloading entites should properly queue file loading', async () => {
    const cacheSize = 5;
    const entityLoadingCache = new Image360LoadingCache(cacheSize);

    const deferredPromise = {
      firstCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    new DeferredPromise<{ fullResolutionCompleted: Promise<void> }>();

    const revisionMock1 = new Mock<Image360RevisionEntity>()
      .setup(p => p.load360Image(It.IsAny()))
      .returns(deferredPromise)
      .object();

    entityLoadingCache.cachedPreload(revisionMock1);

    expect(entityLoadingCache.getDownloadInProgress(revisionMock1)).not.toBe(undefined);
    expect(entityLoadingCache.cachedEntities.includes(revisionMock1)).toBeFalsy();

    deferredPromise.fullResolutionCompleted.resolve();
    await deferredPromise.fullResolutionCompleted;

    expect(entityLoadingCache.getDownloadInProgress(revisionMock1)).toBe(undefined);
    expect(entityLoadingCache.cachedEntities.includes(revisionMock1)).toBeTruthy();
  });

  test('preloading when cache is full should purge stale entity', async () => {
    const cacheSize = 1;
    const entityLoadingCache = new Image360LoadingCache(cacheSize);

    const deferredPromise1 = {
      firstCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    const revisionMock1 = new Mock<Image360RevisionEntity>()
      .setup(p => p.load360Image(It.IsAny()))
      .returns(deferredPromise1)
      .setup(p => p.image360Visualization.visible)
      .returns(false)
      .setup(p => p.unload360Image())
      .returns()
      .object();

    const deferredPromise2 = {
      firstCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };

    const revisionMock2 = new Mock<Image360RevisionEntity>()
      .setup(p => p.load360Image(It.IsAny()))
      .returns(deferredPromise2)
      .setup(p => p.image360Visualization.visible)
      .returns(false)
      .object();

    const preLoad1 = entityLoadingCache.cachedPreload(revisionMock1);

    deferredPromise1.firstCompleted.resolve();
    deferredPromise1.fullResolutionCompleted.resolve();
    await preLoad1;

    const preLoad2 = entityLoadingCache.cachedPreload(revisionMock2);

    expect(entityLoadingCache.getDownloadInProgress(revisionMock2)).not.toBe(undefined);
    expect(entityLoadingCache.cachedEntities.includes(revisionMock1)).toBeTruthy();

    deferredPromise2.firstCompleted.resolve();
    deferredPromise2.fullResolutionCompleted.resolve();
    await preLoad2;

    expect(entityLoadingCache.currentlyLoadingEntities.length).toBe(0);
    expect(entityLoadingCache.cachedEntities.length).toBe(1);
    expect(entityLoadingCache.cachedEntities.includes(revisionMock2)).toBeTruthy();
  });

  test('cache should not purge visible 360 images', async () => {
    const cacheSize = 2;
    const entityLoadingCache = new Image360LoadingCache(cacheSize);

    const deferredPromise1 = {
      firstCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };

    const revisionMock1 = new Mock<Image360RevisionEntity>()
      .setup(p => p.load360Image(It.IsAny()))
      .returns(deferredPromise1)
      .setup(p => p.image360Visualization.visible)
      .returns(true)
      .setup(p => p.unload360Image())
      .returns()
      .object();

    const deferredPromise2 = {
      firstCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    const revisionMock2 = new Mock<Image360RevisionEntity>()
      .setup(p => p.load360Image(It.IsAny()))
      .returns(deferredPromise2)
      .setup(p => p.image360Visualization.visible)
      .returns(false)
      .setup(p => p.unload360Image())
      .returns()
      .object();

    const deferredPromise3 = {
      firstCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    const revisionMock3 = new Mock<Image360RevisionEntity>()
      .setup(p => p.load360Image(It.IsAny()))
      .returns(deferredPromise3)
      .object();

    const preLoad1 = entityLoadingCache.cachedPreload(revisionMock1);
    const preLoad2 = entityLoadingCache.cachedPreload(revisionMock2);

    deferredPromise1.fullResolutionCompleted.resolve();
    deferredPromise1.firstCompleted.resolve();

    deferredPromise2.fullResolutionCompleted.resolve();
    deferredPromise2.firstCompleted.resolve();
    await Promise.all([preLoad1, preLoad2]);

    const preLoad3 = entityLoadingCache.cachedPreload(revisionMock3);
    deferredPromise3.fullResolutionCompleted.resolve();
    deferredPromise3.firstCompleted.resolve();
    await preLoad3;

    expect(entityLoadingCache.cachedEntities.length).toBe(2);

    expect(entityLoadingCache.cachedEntities.includes(revisionMock1)).toBeTruthy();
    expect(entityLoadingCache.cachedEntities.includes(revisionMock3)).toBeTruthy();
  });

  test('cache should handle failed downloads', async () => {
    const cacheSize = 3;
    const loadingCache = new Image360LoadingCache(cacheSize, cacheSize);

    const promiseToFail = {
      firstCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    const revisionMockToFail = new Mock<Image360RevisionEntity>()
      .setup(p => p.load360Image(It.IsAny()))
      .returns(promiseToFail)
      .object();

    const promiseToAbort = {
      firstCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    const revisionMockToAbort = new Mock<Image360RevisionEntity>()
      .setup(p => p.load360Image(It.IsAny()))
      .returns(promiseToAbort)
      .object();

    const promiseToResolve = {
      firstCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    const revisionMockToResolve = new Mock<Image360RevisionEntity>()
      .setup(p => p.load360Image(It.IsAny()))
      .returns(promiseToResolve)
      .object();

    const downloadToFail = loadingCache.cachedPreload(revisionMockToFail);
    const downloadToAbort = loadingCache.cachedPreload(revisionMockToAbort);
    const downloadToResolve = loadingCache.cachedPreload(revisionMockToResolve);

    expect(loadingCache.currentlyLoadingEntities.length).toBe(3);

    promiseToFail.firstCompleted.reject('Some other error');
    promiseToFail.fullResolutionCompleted.reject();

    promiseToAbort.firstCompleted.reject('Aborted');
    promiseToAbort.fullResolutionCompleted.reject();

    promiseToResolve.firstCompleted.resolve();
    promiseToResolve.fullResolutionCompleted.resolve();

    await expect(downloadToFail).rejects.toThrow();
    await expect(downloadToAbort).resolves.not.toThrow();
    await expect(downloadToResolve).resolves.not.toThrow();

    expect(loadingCache.cachedEntities.length).toBe(1);
    expect(loadingCache.cachedEntities[0]).toBe(revisionMockToResolve);
    expect(loadingCache.currentlyLoadingEntities.length).toBe(0);
  });

  test('cache should abort oldest fetch requests when cacheSize is exceeded', async () => {
    const cacheSize = 2;
    const loadingCache = new Image360LoadingCache(cacheSize, cacheSize);

    const createMockRevision = (deferredPromise: {
      firstCompleted: DeferredPromise<void>;
      fullResolutionCompleted: DeferredPromise<void>;
    }) => {
      return new Mock<Image360RevisionEntity>()
        .setup(p => p.load360Image(It.IsAny()))
        .returns(deferredPromise)
        .setup(p => p.image360Visualization.visible)
        .returns(false)
        .setup(p => p.unload360Image())
        .returns()
        .object();
    };

    const deferredPromise1 = {
      firstCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    const revision360Mock1 = createMockRevision(deferredPromise1);

    const deferredPromise2 = {
      firstCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    const revision360Mock2 = createMockRevision(deferredPromise2);

    const deferredPromise3 = {
      firstCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    const revision360Mock3 = createMockRevision(deferredPromise3);

    const download1 = loadingCache.cachedPreload(revision360Mock1);
    const download2 = loadingCache.cachedPreload(revision360Mock2);
    expect(loadingCache.currentlyLoadingEntities.length).toBe(2);
    expect(loadingCache.getDownloadInProgress(revision360Mock1)).not.toBe(undefined);
    expect(loadingCache.getDownloadInProgress(revision360Mock2)).not.toBe(undefined);

    const download3 = loadingCache.cachedPreload(revision360Mock3);
    expect(loadingCache.currentlyLoadingEntities.length).toBe(2);
    expect(loadingCache.getDownloadInProgress(revision360Mock2)).not.toBe(undefined);
    expect(loadingCache.getDownloadInProgress(revision360Mock3)).not.toBe(undefined);

    deferredPromise1.firstCompleted.resolve();
    deferredPromise1.fullResolutionCompleted.resolve();

    deferredPromise2.firstCompleted.resolve();
    deferredPromise2.fullResolutionCompleted.resolve();

    deferredPromise3.firstCompleted.resolve();
    deferredPromise3.fullResolutionCompleted.resolve();

    await download1;
    await download2;
    await download3;

    expect(loadingCache.currentlyLoadingEntities.length).toBe(0);
    expect(loadingCache.cachedEntities.length).toBe(cacheSize);
    expect(loadingCache.cachedEntities[0]).toBe(revision360Mock3);
    expect(loadingCache.cachedEntities[1]).toBe(revision360Mock2);
  });
});
