/*!
 * Copyright 2021 Cognite AS
 */

import { CadMetadataParser, CadModelMetadataRepository, CadSectorParser } from '@reveal/cad-parsers';

import { CadManager } from './CadManager';
import { CadModelFactory } from './CadModelFactory';

import {
  CadModelUpdateHandler,
  CachedRepository,
  SimpleAndDetailedToSector3D,
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
  const cadMetadataParser = new CadMetadataParser();
  const cadModelMetadataRepository = new CadModelMetadataRepository(
    modelMetadataProvider,
    modelDataProvider,
    cadMetadataParser
  );
  const cadModelFactory = new CadModelFactory(materialManager);
  const modelDataParser = new CadSectorParser();
  const modelDataTransformer = new SimpleAndDetailedToSector3D(materialManager);
  const cachedSectorRepository = new CachedRepository(modelDataProvider, modelDataParser, modelDataTransformer);
  const { internal } = options;
  const sectorCuller =
    internal && internal.sectorCuller
      ? internal.sectorCuller
      : createDefaultSectorCuller(renderer, occludingGeometryProvider);
  const cadModelUpdateHandler = new CadModelUpdateHandler(cachedSectorRepository, sectorCuller);
  return new CadManager(materialManager, cadModelMetadataRepository, cadModelFactory, cadModelUpdateHandler);
}
