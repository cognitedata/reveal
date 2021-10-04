/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { createCadManager } from '../datamodels/cad/createCadManager';
import { createPointCloudManager } from '../datamodels/pointcloud/createPointCloudManager';
import { RevealManager } from './RevealManager';
import { RevealOptions } from './types';
import { initMetrics } from '../utilities/metrics';
import { RenderOptions } from '..';
import { EffectRenderManager } from '../datamodels/cad/rendering/EffectRenderManager';
import { CadMaterialManager } from '../datamodels/cad/CadMaterialManager';
import { RenderAlreadyLoadedGeometryProvider } from '../datamodels/cad/rendering/RenderAlreadyLoadedGeometryProvider';

import {
  LocalModelDataProvider,
  CdfModelDataProvider,
  ModelDataProvider,
  ModelMetadataProvider,
  CdfModelMetadataProvider,
  LocalModelMetadataProvider
} from '@reveal/modeldata-api';
import { CogniteClient } from '@cognite/sdk';

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
): RevealManager {
  const modelMetadataProvider = new LocalModelMetadataProvider();
  const modelDataProvider = new LocalModelDataProvider();
  return createRevealManager('local', modelMetadataProvider, modelDataProvider, renderer, scene, revealOptions);
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
): RevealManager {
  const modelMetadataProvider = new CdfModelMetadataProvider(client);
  const modelDataProvider = new CdfModelDataProvider(client);
  return createRevealManager(client.project, modelMetadataProvider, modelDataProvider, renderer, scene, revealOptions);
}

/**
 * Used to create an instance of reveal manager.
 * @internal
 * @param project
 * @param modelMetadataProvider
 * @param modelDataProvider
 * @param renderer
 * @param scene
 * @param revealOptions
 */
export function createRevealManager(
  project: string,
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider,
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  revealOptions: RevealOptions = {}
): RevealManager {
  const applicationId = modelDataProvider.getApplicationIdentifier();
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
    modelDataProvider,
    renderer,
    materialManager,
    alreadyLoadedProvider,
    revealOptions
  );
  const pointCloudManager = createPointCloudManager(modelMetadataProvider, modelDataProvider);
  return new RevealManager(cadManager, renderManager, pointCloudManager);
}
