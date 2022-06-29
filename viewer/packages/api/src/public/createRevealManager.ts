/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { RevealOptions } from './types';
import { RevealManager } from './RevealManager';

import { MetricsLogger } from '@reveal/metrics';
import {
  RenderOptions,
  CadMaterialManager,
  BasicPipelineExecutor,
  DefaultRenderPipelineProvider,
  CadGeometryRenderModePipelineProvider,
  RenderMode
} from '@reveal/rendering';
import { createPointCloudManager } from '@reveal/pointclouds';
import {
  ModelMetadataProvider,
  CdfModelMetadataProvider,
  LocalModelMetadataProvider,
  LocalModelDataProvider,
  ModelDataProvider,
  CdfModelDataProvider
} from '@reveal/modeldata-api';

import { CogniteClient } from '@cognite/sdk';
import { SceneHandler } from '@reveal/utilities';
import { createCadManager } from '@reveal/cad-geometry-loaders';

/**
 * Used to create an instance of reveal manager that works with localhost.
 * @param renderer
 * @param sceneHandler
 * @param revealOptions
 * @returns RevealManager instance.
 */
export function createLocalRevealManager(
  renderer: THREE.WebGLRenderer,
  sceneHandler: SceneHandler,
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
    sceneHandler,
    revealOptions
  );
}

/**
 * Used to create an instance of reveal manager that works with the CDF.
 * @param client
 * @param renderer
 * @param sceneHandler
 * @param revealOptions
 */
export function createCdfRevealManager(
  client: CogniteClient,
  renderer: THREE.WebGLRenderer,
  sceneHandler: SceneHandler,
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
    sceneHandler,
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
 * @param sceneHandler
 * @param revealOptions
 */
export function createRevealManager(
  project: string,
  applicationId: string,
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider,
  renderer: THREE.WebGLRenderer,
  sceneHandler: SceneHandler,
  revealOptions: RevealOptions = {}
): RevealManager {
  MetricsLogger.init(revealOptions.logMetrics !== false, project, applicationId, {
    constructorOptions: revealOptions
  });

  const renderOptions: RenderOptions = revealOptions.renderOptions || {};
  const materialManager = new CadMaterialManager();
  const pipelineExecutor = new BasicPipelineExecutor(renderer);
  const defaultRenderPipeline = new DefaultRenderPipelineProvider(
    materialManager,
    sceneHandler,
    renderOptions,
    revealOptions.outputRenderTarget
  );
  const depthRenderPipeline = new CadGeometryRenderModePipelineProvider(
    RenderMode.DepthBufferOnly,
    materialManager,
    sceneHandler
  );
  const pointCloudManager = createPointCloudManager(
    modelMetadataProvider,
    modelDataProvider,
    sceneHandler.scene,
    renderer
  );
  sceneHandler.customObjects.push(pointCloudManager.pointCloudGroupWrapper);
  const cadManager = createCadManager(
    modelMetadataProvider,
    modelDataProvider,
    renderer,
    materialManager,
    depthRenderPipeline,
    {
      ...revealOptions.internal?.cad,
      continuousModelStreaming: revealOptions.continuousModelStreaming
    }
  );
  return new RevealManager(cadManager, pointCloudManager, pipelineExecutor, defaultRenderPipeline, materialManager);
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
