/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { initMetrics } from '@reveal/utilities';
import { RenderOptions, EffectRenderManager, CadMaterialManager } from '@reveal/cad-geometry-loaders';

import { createCadManager } from '../datamodels/cad/createCadManager';
import { createPointCloudManager } from '../datamodels/pointcloud/createPointCloudManager';
import { RevealManager } from './RevealManager';
import { RevealOptions } from './types';
import { RenderAlreadyLoadedGeometryProvider } from '../datamodels/cad/rendering/RenderAlreadyLoadedGeometryProvider';

import {
  LocalModelDataClient,
  CdfModelDataClient,
  LocalModelIdentifier,
  CdfModelIdentifier,
  ModelDataClient,
  CdfModelMetadataProvider,
  LocalModelMetadataProvider
} from '@reveal/modeldata-api';
import { CogniteClient } from '@cognite/sdk';
import { ModelMetadataProvider } from '../../../packages/modeldata-api/src/types';

/**
 * Used to create an instance of reveal manager that works with localhost.
 * @param renderer
 * @param scene
 * @param revealOptions
 * @returns RevealManager instance.
 */
export function createLocalRevealManager(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  revealOptions: RevealOptions = {}
): RevealManager<LocalModelIdentifier> {
  const modelMetadataProvider = new LocalModelMetadataProvider();
  const modelDataClient = new LocalModelDataClient();
  return createRevealManager('local', modelMetadataProvider, modelDataClient, renderer, scene, revealOptions);
}

/**
 * Used to create an instance of reveal manager that works with the CDF.
 * @param client
 * @param renderer
 * @param scene
 * @param revealOptions
 */
export function createCdfRevealManager(
  client: CogniteClient,
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  revealOptions: RevealOptions = {}
): RevealManager<CdfModelIdentifier> {
  const modelMetadataProvider = new CdfModelMetadataProvider(client);
  const modelDataClient = new CdfModelDataClient(client);
  return createRevealManager(client.project, modelMetadataProvider, modelDataClient, renderer, scene, revealOptions);
}

/**
 * Used to create an instance of reveal manager.
 * @internal
 * @param project
 * @param modelMetadataProvider
 * @param modelDataClient
 * @param renderer
 * @param scene
 * @param revealOptions
 */
export function createRevealManager<T>(
  project: string,
  modelMetadataProvider: ModelMetadataProvider<T>,
  modelDataClient: ModelDataClient,
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  revealOptions: RevealOptions = {}
): RevealManager<T> {
  const applicationId = modelDataClient.getApplicationIdentifier();
  initMetrics(revealOptions.logMetrics !== false, project, applicationId, {
    moduleName: 'createRevealManager',
    methodName: 'createRevealManager',
    constructorOptions: revealOptions
  });

  const renderOptions: RenderOptions = revealOptions.renderOptions || {};
  const materialManager = new CadMaterialManager();
  const renderManager = new EffectRenderManager(renderer, scene, materialManager, renderOptions);
  const alreadyLoadedProvider = new RenderAlreadyLoadedGeometryProvider(renderManager);
  const cadManager = createCadManager(
    modelMetadataProvider,
    modelDataClient,
    renderer,
    materialManager,
    alreadyLoadedProvider,
    revealOptions
  );
  const pointCloudManager = createPointCloudManager(modelMetadataProvider, modelDataClient);
  return new RevealManager(cadManager, renderManager, pointCloudManager);
}
