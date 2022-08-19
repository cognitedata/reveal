/*!
 * Copyright 2021 Cognite AS
 */

import { PointCloudManager } from './PointCloudManager';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import { CdfPointCloudFactory } from './factory/CdfPointCloudFactory';

import * as THREE from 'three';

import { ModelDataProvider, ModelMetadataProvider } from '@reveal/modeldata-api';
import { CogniteClient } from '@cognite/sdk';
import { Potree } from './potree-three-loader';
import { LocalPointCloudFactory } from './factory/LocalPointCloudFactory';

export function createPointCloudManager(
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  sdkClient: CogniteClient | undefined,
  localModels: boolean
): PointCloudManager {
  const metadataRepository = new PointCloudMetadataRepository(modelMetadataProvider, modelDataProvider);
  const potreeInstance = new Potree(modelDataProvider);

  let modelFactory;
  if (sdkClient && !localModels) {
    modelFactory = new CdfPointCloudFactory(potreeInstance, sdkClient);
  } else {
    modelFactory = new LocalPointCloudFactory(potreeInstance);
  }
  return new PointCloudManager(metadataRepository, modelFactory, potreeInstance, scene, renderer);
}
