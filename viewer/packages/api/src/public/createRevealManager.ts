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
  PointCloudMaterialManager,
  BasicPipelineExecutor,
  DefaultRenderPipelineProvider
} from '@reveal/rendering';
import {
  CdfPointCloudStylableObjectProvider,
  PointCloudStylableObjectProvider,
  DummyPointCloudStylableObjectProvider
} from '@reveal/data-providers';
import { createPointCloudManager } from '@reveal/pointclouds';
import {
  ModelMetadataProvider,
  CdfModelMetadataProvider,
  LocalModelMetadataProvider,
  LocalModelDataProvider,
  ModelDataProvider,
  CdfModelDataProvider
} from '@reveal/data-providers';

import { CogniteClient } from '@cognite/sdk';
import { SceneHandler } from '@reveal/utilities';
import { createCadManager } from '@reveal/cad-geometry-loaders';
import {
  IPointClassificationsProvider,
  LocalPointClassificationsProvider,
  UrlPointClassificationsProvider
} from '@reveal/pointclouds';
import { CameraManager } from '@reveal/camera-manager';

/**
 * Used to create an instance of reveal manager that works with localhost.
 * @param renderer
 * @param sceneHandler
 * @param cameraManager
 * @param revealOptions
 * @returns RevealManager instance.
 */
export function createLocalRevealManager(
  renderer: THREE.WebGLRenderer,
  sceneHandler: SceneHandler,
  cameraManager: CameraManager,
  revealOptions: RevealOptions = {}
): RevealManager {
  const modelMetadataProvider = new LocalModelMetadataProvider();
  const modelDataProvider = new LocalModelDataProvider();
  const annotationProvider = new DummyPointCloudStylableObjectProvider();
  const pointClassificationsProvider = new LocalPointClassificationsProvider();
  return createRevealManager(
    'local',
    'local-dataSource-appId',
    modelMetadataProvider,
    modelDataProvider,
    annotationProvider,
    pointClassificationsProvider,
    renderer,
    sceneHandler,
    cameraManager,
    revealOptions
  );
}

/**
 * Used to create an instance of reveal manager that works with the CDF.
 * @param client
 * @param renderer
 * @param sceneHandler
 * @param cameraManager
 * @param revealOptions
 */
export function createCdfRevealManager(
  client: CogniteClient,
  renderer: THREE.WebGLRenderer,
  sceneHandler: SceneHandler,
  cameraManager: CameraManager,
  revealOptions: RevealOptions = {}
): RevealManager {
  const applicationId = getSdkApplicationId(client);
  const modelMetadataProvider = new CdfModelMetadataProvider(client);
  const modelDataProvider = new CdfModelDataProvider(client);
  const annotationProvider = new CdfPointCloudStylableObjectProvider(client);
  const pointClassificationsProvider = new UrlPointClassificationsProvider(modelDataProvider);
  return createRevealManager(
    client.project,
    applicationId,
    modelMetadataProvider,
    modelDataProvider,
    annotationProvider,
    pointClassificationsProvider,
    renderer,
    sceneHandler,
    cameraManager,
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
 * @param annotationProvider
 * @param pointClassificationsProvider
 * @param renderer
 * @param sceneHandler
 * @param cameraManager
 * @param revealOptions
 */
export function createRevealManager(
  project: string,
  applicationId: string,
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider,
  annotationProvider: PointCloudStylableObjectProvider,
  pointClassificationsProvider: IPointClassificationsProvider,
  renderer: THREE.WebGLRenderer,
  sceneHandler: SceneHandler,
  cameraManager: CameraManager,
  revealOptions: RevealOptions = {}
): RevealManager {
  MetricsLogger.init(revealOptions.logMetrics !== false, project, applicationId, {
    constructorOptions: revealOptions
  });

  const renderOptions: RenderOptions = revealOptions?.renderOptions ?? {};
  const cadMaterialManager = new CadMaterialManager();
  const pointCloudMaterialManager = new PointCloudMaterialManager();
  const pipelineExecutor = new BasicPipelineExecutor(renderer, {
    autoResizeRenderer: true,
    resolutionThreshold: revealOptions.rendererResolutionThreshold
  });
  const defaultRenderPipeline = new DefaultRenderPipelineProvider(
    cadMaterialManager,
    pointCloudMaterialManager,
    sceneHandler,
    renderOptions,
    revealOptions.outputRenderTarget
  );
  const pointCloudManager = createPointCloudManager(
    modelMetadataProvider,
    modelDataProvider,
    annotationProvider,
    pointClassificationsProvider,
    pointCloudMaterialManager,
    sceneHandler.scene,
    renderer
  );
  const cadManager = createCadManager(modelMetadataProvider, modelDataProvider, cadMaterialManager, {
    ...revealOptions.internal?.cad,
    continuousModelStreaming: revealOptions.continuousModelStreaming
  });
  return new RevealManager(cadManager, pointCloudManager, pipelineExecutor, defaultRenderPipeline, cameraManager);
}

/**
 * Determines the `appId` of the `CogniteClient` provided.
 * @param sdk Instance of `CogniteClient`.
 * @returns Application ID or 'unknown' if not found.
 */
function getSdkApplicationId(sdk: CogniteClient): string {
  const headers = sdk.getDefaultRequestHeaders();
  return headers['x-cdp-app'] ?? 'unknown';
}
