/*!
 * Copyright 2021 Cognite AS
 */

import { PointCloudManager } from './PointCloudManager';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';

import * as THREE from 'three';

import {
  DMDataSourceType,
  ModelDataProvider,
  ModelMetadataProvider,
  PointCloudStylableObjectProvider,
  CachedModelDataProvider
} from '@reveal/data-providers';
import { Potree } from './potree-three-loader';
import { PointCloudFactory } from './PointCloudFactory';
import { IPointClassificationsProvider } from './classificationsProviders/IPointClassificationsProvider';

import { PointCloudMaterialManager } from '@reveal/rendering';

export function createPointCloudManager(
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider,
  pointCloudStylableObjectProvider: PointCloudStylableObjectProvider,
  classificationsProvider: IPointClassificationsProvider,
  pointCloudDMProvider: PointCloudStylableObjectProvider<DMDataSourceType>,
  pointCloudMaterialManager: PointCloudMaterialManager,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer
): PointCloudManager {
  const metadataRepository = new PointCloudMetadataRepository(modelMetadataProvider, modelDataProvider);

  const cachedProvider = new CachedModelDataProvider(modelDataProvider, {
    cacheName: 'reveal-pointcloud-v1',
    maxCacheSize: 500 * 1024 * 1024,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    enableMetrics: true,
    enableLogging: true
  });

  const potreeInstance = new Potree(cachedProvider, pointCloudMaterialManager);
  const pointCloudFactory = new PointCloudFactory(
    potreeInstance,
    pointCloudStylableObjectProvider,
    pointCloudDMProvider,
    classificationsProvider,
    pointCloudMaterialManager
  );

  return new PointCloudManager(
    metadataRepository,
    pointCloudMaterialManager,
    pointCloudFactory,
    potreeInstance,
    scene,
    renderer
  );
}
