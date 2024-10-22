/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { RevealOptions } from './RevealOptions';
import { RevealManager } from './RevealManager';

import { MetricsLogger } from '@reveal/metrics';
import {
  RenderOptions,
  CadMaterialManager,
  PointCloudMaterialManager,
  BasicPipelineExecutor,
  DefaultRenderPipelineProvider,
  ResizeHandler
} from '@reveal/rendering';
import {
  CdfPointCloudStylableObjectProvider,
  PointCloudStylableObjectProvider,
  DummyPointCloudStylableObjectProvider,
  CdfPointCloudDMStylableObjectProvider,
  DMPointCloudDataType,
  DummyPointCloudDMStylableObjectProvider
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
  const pointCloudDMProvider = new DummyPointCloudDMStylableObjectProvider();
  const pointClassificationsProvider = new LocalPointClassificationsProvider();
  return createRevealManager(
    'local',
    'local-dataSource-appId',
    modelMetadataProvider,
    modelDataProvider,
    annotationProvider,
    pointCloudDMProvider,
    pointClassificationsProvider,
    renderer,
    sceneHandler,
    cameraManager,
    revealOptions,
    undefined
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
  const pointCloudDMProvider = new CdfPointCloudDMStylableObjectProvider(client);
  const pointClassificationsProvider = new UrlPointClassificationsProvider(modelDataProvider);
  return createRevealManager(
    client.project,
    applicationId,
    modelMetadataProvider,
    modelDataProvider,
    annotationProvider,
    pointCloudDMProvider,
    pointClassificationsProvider,
    renderer,
    sceneHandler,
    cameraManager,
    revealOptions,
    client
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
 * @param pointCloudDMProvider
 * @param pointClassificationsProvider
 * @param renderer
 * @param sceneHandler
 * @param cameraManager
 * @param revealOptions
 * @param client
 */
export function createRevealManager(
  project: string,
  applicationId: string,
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider,
  annotationProvider: PointCloudStylableObjectProvider,
  pointCloudDMProvider: PointCloudStylableObjectProvider<DMPointCloudDataType>,
  pointClassificationsProvider: IPointClassificationsProvider,
  renderer: THREE.WebGLRenderer,
  sceneHandler: SceneHandler,
  cameraManager: CameraManager,
  revealOptions: RevealOptions = {},
  client: CogniteClient | undefined
): RevealManager {
  MetricsLogger.init(revealOptions.logMetrics !== false, project, applicationId, {
    constructorOptions: revealOptions
  });

  const renderOptions: RenderOptions = revealOptions?.renderOptions ?? {};
  const cadMaterialManager = new CadMaterialManager();
  const pointCloudMaterialManager = new PointCloudMaterialManager();
  const pipelineExecutor = new BasicPipelineExecutor(renderer);
  const defaultRenderPipeline = new DefaultRenderPipelineProvider(
    cadMaterialManager,
    pointCloudMaterialManager,
    sceneHandler,
    renderOptions,
    revealOptions.outputRenderTarget
  );
  const resizeHandler = new ResizeHandler(renderer, cameraManager, {
    renderResolutionThreshold: revealOptions.rendererResolutionThreshold
  });
  const pointCloudManager = createPointCloudManager(
    modelMetadataProvider,
    modelDataProvider,
    annotationProvider,
    pointClassificationsProvider,
    pointCloudDMProvider,
    pointCloudMaterialManager,
    sceneHandler.scene,
    renderer
  );
  const cadManager = createCadManager(modelMetadataProvider, modelDataProvider, cadMaterialManager, {
    ...revealOptions.internal?.cad,
    continuousModelStreaming: revealOptions.continuousModelStreaming
  });
  return new RevealManager(
    cadManager,
    pointCloudManager,
    pipelineExecutor,
    defaultRenderPipeline,
    resizeHandler,
    cameraManager,
    client
  );
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
