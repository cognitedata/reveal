/*!
 * Copyright 2021 Cognite AS
 */

import { PointCloudManager } from './PointCloudManager';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';

import type { Scene, WebGLRenderer } from 'three';

import type {
  DMDataSourceType,
  ModelMetadataProvider,
  PointCloudStylableObjectProvider,
  CachedModelDataProvider
} from '@reveal/data-providers';
import { Potree } from './potree-three-loader';
import { PointCloudFactory } from './PointCloudFactory';
import type { IPointClassificationsProvider } from './classificationsProviders/IPointClassificationsProvider';

import type { PointCloudMaterialManager } from '@reveal/rendering';
import type { PickCacheInvalidator } from '@reveal/utilities';

export function createPointCloudManager(
  modelMetadataProvider: ModelMetadataProvider,
  pointCloudStylableObjectProvider: PointCloudStylableObjectProvider,
  classificationsProvider: IPointClassificationsProvider,
  pointCloudDMProvider: PointCloudStylableObjectProvider<DMDataSourceType>,
  pointCloudMaterialManager: PointCloudMaterialManager,
  cachedProvider: CachedModelDataProvider,
  scene: Scene,
  renderer: WebGLRenderer,
  pickCacheInvalidator: PickCacheInvalidator
): PointCloudManager {
  const metadataRepository = new PointCloudMetadataRepository(modelMetadataProvider, cachedProvider);

  const potreeInstance = new Potree(cachedProvider, pointCloudMaterialManager);
  const pointCloudFactory = new PointCloudFactory(
    potreeInstance,
    pointCloudStylableObjectProvider,
    pointCloudDMProvider,
    classificationsProvider,
    pointCloudMaterialManager,
    pickCacheInvalidator
  );

  return new PointCloudManager(
    metadataRepository,
    pointCloudMaterialManager,
    pointCloudFactory,
    potreeInstance,
    scene,
    renderer,
    pickCacheInvalidator
  );
}
