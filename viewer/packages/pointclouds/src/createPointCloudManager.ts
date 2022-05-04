/*!
 * Copyright 2021 Cognite AS
 */

import { PointCloudManager } from './PointCloudManager';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import { PointCloudFactory } from './PointCloudFactory';

import * as THREE from 'three';

import { ModelDataProvider, ModelMetadataProvider } from '@reveal/modeldata-api';

export function createPointCloudManager(
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer
): PointCloudManager {
  const metadataRepository = new PointCloudMetadataRepository(modelMetadataProvider, modelDataProvider);
  const modelFactory = new PointCloudFactory(modelDataProvider);
  return new PointCloudManager(metadataRepository, modelFactory, scene, renderer);
}
