/*!
 * Copyright 2021 Cognite AS
 */

import { PointCloudManager } from './PointCloudManager';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import { PointCloudFactory } from './PointCloudFactory';

import * as THREE from 'three';

import { ModelDataProvider, ModelMetadataProvider } from '@reveal/modeldata-api';
import { CogniteClient } from '@cognite/sdk';
import { Potree } from './potree-three-loader';

export function createPointCloudManager(
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  sdkClient?: CogniteClient | undefined
): PointCloudManager {
  const metadataRepository = new PointCloudMetadataRepository(modelMetadataProvider, modelDataProvider);
  const potreeInstance = new Potree(modelDataProvider);
  const modelFactory = new PointCloudFactory(potreeInstance, sdkClient);
  return new PointCloudManager(metadataRepository, modelFactory, scene, renderer);
}
