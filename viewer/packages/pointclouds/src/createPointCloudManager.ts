/*!
 * Copyright 2021 Cognite AS
 */

import { PointCloudManager } from './PointCloudManager';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import { PointCloudFactory } from './PointCloudFactory';

import * as THREE from 'three';

import { ModelDataProvider, ModelMetadataProvider } from '@reveal/data-providers';
import { PointCloudMaterialManager } from '@reveal/rendering';

export function createPointCloudManager(
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider,
  pointCloudMaterialManager: PointCloudMaterialManager,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer
): PointCloudManager {
  const metadataRepository = new PointCloudMetadataRepository(modelMetadataProvider, modelDataProvider);
  const modelFactory = new PointCloudFactory(modelDataProvider, pointCloudMaterialManager);
  return new PointCloudManager(metadataRepository, pointCloudMaterialManager, modelFactory, scene, renderer);
}
