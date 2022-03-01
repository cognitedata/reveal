/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { createCadManager } from '@reveal/cad-model';
import { RevealOptions } from './types';
import { createPointCloudManager } from '../datamodels/pointcloud/createPointCloudManager';
import { RevealManager } from './RevealManager';

import { MetricsLogger } from '@reveal/metrics';
import { RenderOptions, EffectRenderManager, CadMaterialManager } from '@reveal/rendering';
import {
  ModelMetadataProvider,
  CdfModelMetadataProvider,
  LocalModelMetadataProvider,
  LocalModelDataProvider,
  ModelDataProvider,
  CdfModelDataProvider
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
  return createRevealManager(
    'local',
    'local-dataSource-appId',
    modelMetadataProvider,
    modelDataProvider,
    renderer,
    scene,
    revealOptions
  );
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
  const applicationId = getSdkApplicationId(client);
  const modelMetadataProvider = new CdfModelMetadataProvider(client);
  const modelDataProvider = new CdfModelDataProvider(client);
  return createRevealManager(
    client.project,
    applicationId,
    modelMetadataProvider,
    modelDataProvider,
    renderer,
    scene,
    revealOptions
  );
}

/**
 * Used to create an instance of reveal manager.
 * @internal
 * @param project
 * @param applicationId
 * @param modelMetadataProvider
 * @param modelDataProvider
 * @param renderer
 * @param scene
 * @param revealOptions
 */
export function createRevealManager(
  project: string,
  applicationId: string,
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider,
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  revealOptions: RevealOptions = {}
): RevealManager {
  MetricsLogger.init(revealOptions.logMetrics !== false, project, applicationId, {
    constructorOptions: revealOptions
  });

  const renderOptions: RenderOptions = revealOptions.renderOptions || {};
  const materialManager = new CadMaterialManager();
  const renderManager = new EffectRenderManager(renderer, scene, materialManager, renderOptions);
  const cadManager = createCadManager(
    modelMetadataProvider,
    modelDataProvider,
    renderer,
    materialManager,
    renderManager,
    {
      ...revealOptions.internal?.cad,
      continuousModelStreaming: revealOptions.continuousModelStreaming
    }
  );
  const pointCloudManager = createPointCloudManager(modelMetadataProvider, modelDataProvider);
  return new RevealManager(cadManager, renderManager, pointCloudManager);
}

/**
 * Determines the `appId` of the `CogniteClient` provided.
 * @param sdk Instance of `CogniteClient`.
 * @returns Application ID or 'unknown' if not found.
 */
function getSdkApplicationId(sdk: CogniteClient): string {
  const headers = sdk.getDefaultRequestHeaders();
  return headers['x-cdp-app'] || 'unknown';
}
