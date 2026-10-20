/*!
 * Copyright 2026 Cognite AS
 */

import { Plane, Scene } from 'three';
import type { WebGLRenderer } from 'three';
import { It, Mock } from 'moq.ts';
import { vi } from 'vitest';
import { CdfModelIdentifier } from '@reveal/data-providers';
import type { AddModelOptionsWithModelRevisionId, ClassicDataSourceType } from '@reveal/data-providers';
import type { PointCloudMaterialManager } from '@reveal/rendering';
import { PickCacheInvalidation } from '@reveal/utilities';
import { PointCloudManager } from './PointCloudManager';
import { PointCloudNode } from './PointCloudNode';
import type { PointCloudMetadata } from './PointCloudMetadata';
import type { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import type { PointCloudFactory } from './PointCloudFactory';
import type { Potree } from './potree-three-loader';
import { createPointCloudNode } from '../../../test-utilities';

describe(PointCloudManager.name, () => {
  const modelIdentifier = new CdfModelIdentifier(1, 2);
  const addModelOptions: AddModelOptionsWithModelRevisionId<ClassicDataSourceType> = {
    modelId: 1,
    revisionId: 2,
    classicModelRevisionId: { modelId: 1, revisionId: 2 }
  };

  let pickCacheInvalidation: PickCacheInvalidation;
  let manager: PointCloudManager;

  beforeEach(() => {
    pickCacheInvalidation = new PickCacheInvalidation();

    const metadata = new Mock<PointCloudMetadata>().setup(p => p.formatVersion).returns(1);
    const metadataRepository = new Mock<PointCloudMetadataRepository>()
      .setup(p => p.loadData(It.IsAny()))
      .returns(Promise.resolve(metadata.object()))
      .object();
    const factory = new Mock<PointCloudFactory>()
      .setup(p => p.createModel<ClassicDataSourceType>(It.IsAny(), It.IsAny(), It.IsAny()))
      .callback(() => Promise.resolve(createPointCloudNode<ClassicDataSourceType>()))
      .object();
    const materialManager = new Mock<PointCloudMaterialManager>()
      .setup(p => p.initializeClippingPlanesForPointCloud(It.IsAny(), It.IsAny()))
      .returns(undefined)
      .setup(p => p.removeModelMaterial(It.IsAny()))
      .returns(undefined)
      .object();
    const potree = new Mock<Potree>()
      .setup(p => p.pointBudget)
      .returns(1_000_000)
      .setup(p => p.reset())
      .returns(undefined)
      .object();

    manager = new PointCloudManager(
      metadataRepository,
      materialManager,
      factory,
      potree,
      new Scene(),
      new Mock<WebGLRenderer>().object(),
      pickCacheInvalidation
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('is not requesting a pick cache invalidation initially', () => {
    expect(pickCacheInvalidation.consume()).toBe(false);
    manager.requestPickCacheInvalidationOnNewData();
    expect(pickCacheInvalidation.consume()).toBe(false);
  });

  test('requestRedraw redraws but does not invalidate the pick cache', () => {
    manager.requestRedraw();

    expect(manager.needsRedraw).toBe(true);
    expect(pickCacheInvalidation.consume()).toBe(false);
  });

  test('global clipping planes invalidate the pick cache', () => {
    manager.clippingPlanes = [new Plane()];

    expect(pickCacheInvalidation.consume()).toBe(true);
  });

  test('adding a model invalidates the pick cache', async () => {
    await manager.addModel(addModelOptions, modelIdentifier);

    expect(pickCacheInvalidation.consume()).toBe(true);
  });

  test('removing a model invalidates the pick cache', async () => {
    // The test node's mocked octree geometry cannot be disposed
    vi.spyOn(PointCloudNode.prototype, 'dispose').mockImplementation(() => {});
    const node = await manager.addModel(addModelOptions, modelIdentifier);
    pickCacheInvalidation.consume();

    manager.removeModel(node);

    expect(pickCacheInvalidation.consume()).toBe(true);
  });

  test('newly loaded point data invalidates the pick cache', async () => {
    await manager.addModel(addModelOptions, modelIdentifier);
    pickCacheInvalidation.consume();

    manager.requestPickCacheInvalidationOnNewData();

    expect(pickCacheInvalidation.consume()).toBe(true);
  });
});
