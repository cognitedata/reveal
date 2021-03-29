/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { LocalModelIdentifier, CdfModelIdentifier, ModelDataClient } from '../utilities/networking/types';
import { CdfModelDataClient } from '../utilities/networking/CdfModelDataClient';
import { CogniteClient } from '@cognite/sdk';
import { createCadManager } from '../datamodels/cad/createCadManager';
import { createPointCloudManager } from '../datamodels/pointcloud/createPointCloudManager';
import { RevealManager } from './RevealManager';
import { LocalModelDataClient } from '../utilities/networking/LocalModelDataClient';
import { RevealOptions } from './types';
import { initMetrics } from '../utilities/metrics';
import { RenderOptions } from '..';
import { EffectRenderManager } from '../datamodels/cad/rendering/EffectRenderManager';
import { CadMaterialManager } from '../datamodels/cad/CadMaterialManager';
import { AlreadyLoadedGeometryDepthTextureProvider } from '../datamodels/cad/sector/culling/AlreadyLoadedGeometryTextureProvider';

/**
 * Used to create an instance of reveal manager that works with localhost.
 * @param renderer
 * @param revealOptions
 * @returns RevealManager instance.
 */
export function createLocalRevealManager(
  renderer: THREE.WebGLRenderer,
  revealOptions: RevealOptions = {}
): RevealManager<LocalModelIdentifier> {
  const modelDataClient = new LocalModelDataClient();
  return createRevealManager('local', modelDataClient, renderer, revealOptions);
}

/**
 * Used to create an instance of reveal manager that works with the CDF.
 * @param client
 * @param renderer
 * @param revealOptions
 */
export function createCdfRevealManager(
  client: CogniteClient,
  renderer: THREE.WebGLRenderer,
  revealOptions: RevealOptions = {}
): RevealManager<CdfModelIdentifier> {
  const modelDataClient = new CdfModelDataClient(client);
  return createRevealManager(client.project, modelDataClient, renderer, revealOptions);
}

class DepthTextureProvider implements AlreadyLoadedGeometryDepthTextureProvider {
  private readonly _renderManager: EffectRenderManager;

  constructor(renderManager: EffectRenderManager) {
    this._renderManager = renderManager;
  }

  provideAlreadyLoadedDepthTexture(): THREE.DepthTexture {
    return new THREE.DepthTexture(100, 100);
  }
}

/**
 * Used to create an instance of reveal manager.
 * @internal
 * @param project
 * @param client
 * @param renderer
 * @param revealOptions
 */
export function createRevealManager<T>(
  project: string,
  client: ModelDataClient<T>,
  renderer: THREE.WebGLRenderer,
  revealOptions: RevealOptions = {}
): RevealManager<T> {
  const applicationId = client.getApplicationIdentifier();
  initMetrics(revealOptions.logMetrics !== false, project, applicationId, {
    moduleName: 'createRevealManager',
    methodName: 'createRevealManager',
    constructorOptions: revealOptions
  });

  const renderOptions: RenderOptions = revealOptions.renderOptions || {};
  const materialManager = new CadMaterialManager();
  const renderManager = new EffectRenderManager(renderer, materialManager, renderOptions);
  const alreadyLoadedProvider = new DepthTextureProvider(renderManager);
  const cadManager = createCadManager(client, renderer, materialManager, alreadyLoadedProvider, revealOptions);
  const pointCloudManager = createPointCloudManager(client);
  return new RevealManager(cadManager, renderManager, pointCloudManager);
}
