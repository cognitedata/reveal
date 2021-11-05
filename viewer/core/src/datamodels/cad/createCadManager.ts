/*!
 * Copyright 2021 Cognite AS
 */

import { CadManager } from './CadManager';
import { CadModelFactory } from './CadModelFactory';

import {
  CadModelUpdateHandler,
  createDefaultSectorCuller,
  OccludingGeometryProvider
} from '@reveal/cad-geometry-loaders';

import { CadMaterialManager } from '@reveal/rendering';

import { RevealOptions } from '../../public/types';

import { ModelDataProvider, ModelMetadataProvider } from '@reveal/modeldata-api';

export function createCadManager(
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider,
  renderer: THREE.WebGLRenderer,
  materialManager: CadMaterialManager,
  occludingGeometryProvider: OccludingGeometryProvider,
  options: RevealOptions
): CadManager {
  const cadModelFactory = new CadModelFactory(materialManager, modelMetadataProvider, modelDataProvider);
  const { internal } = options;
  const sectorCuller =
    internal && internal.sectorCuller
      ? internal.sectorCuller
      : createDefaultSectorCuller(renderer, occludingGeometryProvider);
  const cadModelUpdateHandler = new CadModelUpdateHandler(sectorCuller);
  return new CadManager(materialManager, cadModelFactory, cadModelUpdateHandler);
}
