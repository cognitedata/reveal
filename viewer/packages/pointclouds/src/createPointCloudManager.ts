/*!
 * Copyright 2021 Cognite AS
 */

import { PointCloudManager } from './PointCloudManager';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';

import * as THREE from 'three';

import { ModelDataProvider, ModelMetadataProvider } from '@reveal/data-providers';
import { Potree } from './potree-three-loader';
import { PointCloudFactory } from './PointCloudFactory';
import { IAnnotationProvider } from './styling/IAnnotationProvider';

export function createPointCloudManager(
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider,
  annotationProvider: IAnnotationProvider,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer
): PointCloudManager {
  const metadataRepository = new PointCloudMetadataRepository(modelMetadataProvider, modelDataProvider);
  const potreeInstance = new Potree(modelDataProvider);
  const pointCloudFactory = new PointCloudFactory(potreeInstance, annotationProvider);

  return new PointCloudManager(metadataRepository, pointCloudFactory, potreeInstance, scene, renderer);
}
