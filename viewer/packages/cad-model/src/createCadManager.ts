/*!
 * Copyright 2021 Cognite AS
 */

import { CadManager } from './CadManager';
import { CadModelFactory } from './CadModelFactory';

import { CadModelUpdateHandler, createV8SectorCuller } from '@reveal/cad-geometry-loaders';

import { CadMaterialManager, EffectRenderManager } from '@reveal/rendering';

import { RevealOptions } from '../../../core/src/public/types';

import { ModelDataProvider, ModelMetadataProvider } from '@reveal/modeldata-api';

export function createCadManager(
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider,
  renderer: THREE.WebGLRenderer,
  materialManager: CadMaterialManager,
  renderManager: EffectRenderManager,
  options: RevealOptions
): CadManager {
  const cadModelFactory = new CadModelFactory(materialManager, modelMetadataProvider, modelDataProvider);
  const { internal } = options;
  const sectorCuller =
    internal && internal.sectorCuller ? internal.sectorCuller : createV8SectorCuller(renderer, renderManager);
  const cadModelUpdateHandler = new CadModelUpdateHandler(sectorCuller, options.continuousModelStreaming);
  return new CadManager(materialManager, cadModelFactory, cadModelUpdateHandler);
}
