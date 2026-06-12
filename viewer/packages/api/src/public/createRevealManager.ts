/*!
 * Copyright 2021 Cognite AS
 */
import type { WebGLRenderer } from 'three';

import type { RevealOptions } from './RevealOptions';
import { RevealManager } from './RevealManager';

import { MetricsLogger } from '@reveal/metrics';
import type { RenderOptions } from '@reveal/rendering';
import {
  CadMaterialManager,
  PointCloudMaterialManager,
  BasicPipelineExecutor,
  DefaultRenderPipelineProvider,
  ResizeHandler
} from '@reveal/rendering';
import type { PointCloudStylableObjectProvider, DMDataSourceType } from '@reveal/data-providers';
import {
  CdfPointCloudStylableObjectProvider,
  DummyPointCloudStylableObjectProvider,
  CdfPointCloudDMStylableObjectProvider,
  DummyPointCloudDMStylableObjectProvider,
  CachedModelDataProvider
} from '@reveal/data-providers';
import { createPointCloudManager } from '@reveal/pointclouds';
import type { ModelMetadataProvider, ModelDataProvider } from '@reveal/data-providers';
import {
  CdfModelMetadataProvider,
  LocalModelMetadataProvider,
  LocalModelDataProvider,
  CdfModelDataProvider
} from '@reveal/data-providers';

import type { CogniteClient } from '@cognite/sdk';
import type { SceneHandler } from '@reveal/utilities';
import { BINARY_FILES_CACHE_NAME, DataFileCacheManager } from '@reveal/utilities';
import { createCadManager } from '@reveal/cad-geometry-loaders';
import type { IPointClassificationsProvider } from '@reveal/pointclouds';
import { LocalPointClassificationsProvider, UrlPointClassificationsProvider } from '@reveal/pointclouds';
import type { CameraManager } from '@reveal/camera-manager';

/**
 * Used to create an instance of reveal manager that works with localhost.
 * @param renderer
 * @param sceneHandler
 * @param cameraManager
 * @param revealOptions
 * @returns RevealManager instance.
 */
export function createLocalRevealManager(
  renderer: WebGLRenderer,
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
  renderer: WebGLRenderer,
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
 * @param pointCloudDMProvider
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
  pointCloudDMProvider: PointCloudStylableObjectProvider<DMDataSourceType>,
  pointClassificationsProvider: IPointClassificationsProvider,
  renderer: WebGLRenderer,
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
  const binaryFileCacheManager = new DataFileCacheManager(
    {
      cacheName: BINARY_FILES_CACHE_NAME,
      maxCacheSize: Infinity,
      maxAge: Infinity
    },
    window.caches
  );
  const cachedProvider = new CachedModelDataProvider(modelDataProvider, binaryFileCacheManager.cacheConfig);
  const pointCloudManager = createPointCloudManager(
    modelMetadataProvider,
    annotationProvider,
    pointClassificationsProvider,
    pointCloudDMProvider,
    pointCloudMaterialManager,
    cachedProvider,
    sceneHandler.scene,
    renderer
  );
  const cadManager = createCadManager(modelMetadataProvider, cachedProvider, cadMaterialManager, {
    ...revealOptions.internal?.cad,
    continuousModelStreaming: revealOptions.continuousModelStreaming
  });
  return new RevealManager(
    cadManager,
    pointCloudManager,
    pipelineExecutor,
    defaultRenderPipeline,
    resizeHandler,
    cameraManager
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
