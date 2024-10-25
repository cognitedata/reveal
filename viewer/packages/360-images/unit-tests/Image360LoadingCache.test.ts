/*!
 * Copyright 2022 Cognite AS
 */

import { DeferredPromise } from '@reveal/utilities';
import { It, Mock } from 'moq.ts';
import { Image360LoadingCache } from '../src/cache/Image360LoadingCache';
import { Image360Entity } from '../src/entity/Image360Entity';
import { Image360RevisionEntity } from '../src/entity/Image360RevisionEntity';
import { DataSourceType } from '@reveal/data-providers';

describe(Image360LoadingCache.name, () => {
  test('preloading entites should properly queue file loading', async () => {
    const cacheSize = 5;
    const entityLoadingCache = new Image360LoadingCache(cacheSize);

    const deferredPromise = {
      lowResolutionCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };

    const revisionMock1 = new Mock<Image360RevisionEntity<DataSourceType>>()
      .setup(p => p.loadTextures(It.IsAny()))
      .returns(deferredPromise)
      .object();
    const entityMock1 = new Mock<Image360Entity<DataSourceType>>().object();

    entityLoadingCache.cachedPreload(entityMock1, revisionMock1);

    const downloadInProgress = entityLoadingCache.getDownloadInProgress(revisionMock1);
    expect(downloadInProgress).not.toBe(undefined);
    expect(entityLoadingCache.cachedRevisions.includes(revisionMock1)).toBeFalsy();

    deferredPromise.fullResolutionCompleted.resolve();
    deferredPromise.lowResolutionCompleted.reject();

    await downloadInProgress?.allCompleted;

    expect(entityLoadingCache.getDownloadInProgress(revisionMock1)).toBe(undefined);
    expect(entityLoadingCache.cachedRevisions.includes(revisionMock1)).toBeTruthy();
  });

  test('preloading when cache is full should purge stale entity', async () => {
    const cacheSize = 1;
    const entityLoadingCache = new Image360LoadingCache(cacheSize);

    const deferredPromise1 = {
      lowResolutionCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    const revisionMock1 = new Mock<Image360RevisionEntity<DataSourceType>>()
      .setup(p => p.loadTextures(It.IsAny()))
      .returns(deferredPromise1)
      .setup(p => p.dispose())
      .returns()
      .object();

    const entityMock1 = new Mock<Image360Entity<DataSourceType>>()
      .setup(p => p.image360Visualization.visible)
      .returns(false)
      .setup(p => p.getActiveRevision())
      .returns(revisionMock1)
      .setup(p => p.unloadImage())
      .returns()
      .object();

    const deferredPromise2 = {
      lowResolutionCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };

    const revisionMock2 = new Mock<Image360RevisionEntity<DataSourceType>>()
      .setup(p => p.loadTextures(It.IsAny()))
      .returns(deferredPromise2)
      .object();

    const entityMock2 = new Mock<Image360Entity<DataSourceType>>()
      .setup(p => p.image360Visualization.visible)
      .returns(false)
      .object();

    const preLoad1 = entityLoadingCache.cachedPreload(entityMock1, revisionMock1);

    deferredPromise1.lowResolutionCompleted.resolve();
    deferredPromise1.fullResolutionCompleted.resolve();
    await preLoad1;

    const preLoad2 = entityLoadingCache.cachedPreload(entityMock2, revisionMock2);

    const inProgressDownload2 = entityLoadingCache.getDownloadInProgress(revisionMock2);
    expect(inProgressDownload2).not.toBe(undefined);
    expect(entityLoadingCache.cachedRevisions.includes(revisionMock1)).toBeTruthy();

    deferredPromise2.lowResolutionCompleted.resolve();
    deferredPromise2.fullResolutionCompleted.resolve();
    await preLoad2;

    await inProgressDownload2?.allCompleted;

    expect(entityLoadingCache.currentlyLoadingEntities.length).toBe(0);
    expect(entityLoadingCache.cachedRevisions.length).toBe(1);
    expect(entityLoadingCache.cachedRevisions.includes(revisionMock2)).toBeTruthy();
  });

  test('cache should not purge visible 360 images', async () => {
    const cacheSize = 2;
    const entityLoadingCache = new Image360LoadingCache(cacheSize);

    const deferredPromise1 = {
      lowResolutionCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };

    const revisionMock1 = new Mock<Image360RevisionEntity<DataSourceType>>()
      .setup(p => p.loadTextures(It.IsAny()))
      .returns(deferredPromise1)
      .object();

    const entityMock1 = new Mock<Image360Entity<DataSourceType>>()
      .setup(p => p.image360Visualization.visible)
      .returns(true)
      .setup(p => p.getActiveRevision())
      .returns(revisionMock1)
      .setup(p => p.unloadImage())
      .returns()
      .object();

    const deferredPromise2 = {
      lowResolutionCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };

    const revisionMock2 = new Mock<Image360RevisionEntity<DataSourceType>>()
      .setup(p => p.loadTextures(It.IsAny()))
      .returns(deferredPromise2)
      .setup(p => p.dispose())
      .returns()
      .object();

    const entityMock2 = new Mock<Image360Entity<DataSourceType>>()
      .setup(p => p.image360Visualization.visible)
      .returns(false)
      .setup(p => p.getActiveRevision())
      .returns(revisionMock2)
      .setup(p => p.unloadImage())
      .returns()
      .object();

    const deferredPromise3 = {
      lowResolutionCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    const entityMock3 = new Mock<Image360Entity<DataSourceType>>().object();

    const revisionMock3 = new Mock<Image360RevisionEntity<DataSourceType>>()
      .setup(p => p.loadTextures(It.IsAny()))
      .returns(deferredPromise3)
      .object();

    const preLoad1 = entityLoadingCache.cachedPreload(entityMock1, revisionMock1);
    const preLoad2 = entityLoadingCache.cachedPreload(entityMock2, revisionMock2);

    deferredPromise1.fullResolutionCompleted.resolve();
    deferredPromise1.lowResolutionCompleted.resolve();

    deferredPromise2.fullResolutionCompleted.resolve();
    deferredPromise2.lowResolutionCompleted.resolve();
    await Promise.all([preLoad1, preLoad2]);

    const preLoad3 = entityLoadingCache.cachedPreload(entityMock3, revisionMock3);
    deferredPromise3.fullResolutionCompleted.resolve();
    deferredPromise3.lowResolutionCompleted.resolve();
    await preLoad3;

    expect(entityLoadingCache.cachedRevisions.length).toBe(2);

    expect(entityLoadingCache.cachedRevisions.includes(revisionMock1)).toBeTruthy();
    expect(entityLoadingCache.cachedRevisions.includes(revisionMock3)).toBeTruthy();
  });

  test('cache should handle failed downloads', async () => {
    const cacheSize = 3;
    const loadingCache = new Image360LoadingCache(cacheSize, cacheSize);
    const entity = new Mock<Image360Entity<DataSourceType>>().object();

    const promiseToFail = {
      lowResolutionCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    const revisionMockToFail = new Mock<Image360RevisionEntity<DataSourceType>>()
      .setup(p => p.loadTextures(It.IsAny()))
      .returns(promiseToFail)
      .object();

    const promiseToAbort = {
      lowResolutionCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    const revisionMockToAbort = new Mock<Image360RevisionEntity<DataSourceType>>()
      .setup(p => p.loadTextures(It.IsAny()))
      .returns(promiseToAbort)
      .object();

    const promiseToResolve = {
      lowResolutionCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    const revisionMockToResolve = new Mock<Image360RevisionEntity<DataSourceType>>()
      .setup(p => p.loadTextures(It.IsAny()))
      .returns(promiseToResolve)
      .object();

    const downloadToFail = loadingCache.cachedPreload(entity, revisionMockToFail);
    const downloadToAbort = loadingCache.cachedPreload(entity, revisionMockToAbort);
    const downloadToResolve = loadingCache.cachedPreload(entity, revisionMockToResolve);

    expect(loadingCache.currentlyLoadingEntities.length).toBe(3);

    promiseToFail.lowResolutionCompleted.reject('Some other error');
    promiseToFail.fullResolutionCompleted.reject('Some other error');

    promiseToAbort.lowResolutionCompleted.reject('Aborted');
    promiseToAbort.fullResolutionCompleted.reject('Aborted');

    promiseToResolve.lowResolutionCompleted.resolve();
    promiseToResolve.fullResolutionCompleted.resolve();

    await expect(downloadToFail).rejects.toThrow();
    await expect(downloadToAbort).rejects.toThrow();
    await expect(downloadToResolve).resolves.not.toThrow();

    expect(loadingCache.cachedRevisions.length).toBe(1);
    expect(loadingCache.cachedRevisions[0]).toBe(revisionMockToResolve);
    expect(loadingCache.currentlyLoadingEntities.length).toBe(0);
  });

  test('cache should abort oldest fetch requests when cacheSize is exceeded', async () => {
    const cacheSize = 2;
    const loadingCache = new Image360LoadingCache(cacheSize, cacheSize);

    const createMockRevision = (deferredPromise: {
      lowResolutionCompleted: DeferredPromise<void>;
      fullResolutionCompleted: DeferredPromise<void>;
    }) => {
      return new Mock<Image360RevisionEntity<DataSourceType>>()
        .setup(p => p.loadTextures(It.IsAny()))
        .returns(deferredPromise)
        .setup(p => p.dispose())
        .returns()
        .object();
    };

    const deferredPromise1 = {
      lowResolutionCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    const revision360Mock1 = createMockRevision(deferredPromise1);

    const deferredPromise2 = {
      lowResolutionCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    const revision360Mock2 = createMockRevision(deferredPromise2);

    const deferredPromise3 = {
      lowResolutionCompleted: new DeferredPromise<void>(),
      fullResolutionCompleted: new DeferredPromise<void>()
    };
    const revision360Mock3 = createMockRevision(deferredPromise3);

    const entity = new Mock<Image360Entity<DataSourceType>>()
      .setup(p => p.image360Visualization.visible)
      .returns(false)
      .setup(p => p.getActiveRevision())
      .returns(revision360Mock3)
      .setup(p => p.unloadImage())
      .returns()
      .object();

    const download1 = loadingCache.cachedPreload(entity, revision360Mock1);
    const download2 = loadingCache.cachedPreload(entity, revision360Mock2);
    expect(loadingCache.currentlyLoadingEntities.length).toBe(2);
    expect(loadingCache.getDownloadInProgress(revision360Mock1)).not.toBe(undefined);
    expect(loadingCache.getDownloadInProgress(revision360Mock2)).not.toBe(undefined);

    const download3 = loadingCache.cachedPreload(entity, revision360Mock3);
    expect(loadingCache.currentlyLoadingEntities.length).toBe(2);
    expect(loadingCache.getDownloadInProgress(revision360Mock2)).not.toBe(undefined);
    expect(loadingCache.getDownloadInProgress(revision360Mock3)).not.toBe(undefined);

    deferredPromise1.lowResolutionCompleted.resolve();
    deferredPromise1.fullResolutionCompleted.resolve();

    deferredPromise2.lowResolutionCompleted.resolve();
    deferredPromise2.fullResolutionCompleted.resolve();

    deferredPromise3.lowResolutionCompleted.resolve();
    deferredPromise3.fullResolutionCompleted.resolve();

    await download1;
    await download2;
    await download3;

    expect(loadingCache.currentlyLoadingEntities.length).toBe(0);
    expect(loadingCache.cachedRevisions.length).toBe(cacheSize);
    expect(loadingCache.cachedRevisions[0]).toBe(revision360Mock3);
    expect(loadingCache.cachedRevisions[1]).toBe(revision360Mock2);
  });
});
