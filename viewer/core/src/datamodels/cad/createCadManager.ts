/*!
 * Copyright 2021 Cognite AS
 */

import { CadManager } from './CadManager';
import { CadMetadataParser } from './parsers/CadMetadataParser';
import { CadModelMetadataRepository } from './CadModelMetadataRepository';
import { CadModelFactory } from './CadModelFactory';
import { CadModelUpdateHandler } from './CadModelUpdateHandler';
import { CadMaterialManager } from './CadMaterialManager';
import { CadSectorParser } from './sector/CadSectorParser';
import { CachedRepository } from './sector/CachedRepository';
import { SimpleAndDetailedToSector3D } from './sector/SimpleAndDetailedToSector3D';
import { createDefaultSectorCuller } from './sector/culling/ByVisibilityGpuSectorCuller';
import { RevealOptions } from '../../public/types';
import { OccludingGeometryProvider } from './sector/culling/OccludingGeometryProvider';

import { ModelDataClient, ModelMetadataProvider } from '@reveal/modeldata-api';

export function createCadManager(
  modelMetadataProvider: ModelMetadataProvider,
  modelDataClient: ModelDataClient,
  renderer: THREE.WebGLRenderer,
  materialManager: CadMaterialManager,
  occludingGeometryProvider: OccludingGeometryProvider,
  options: RevealOptions
): CadManager {
  const cadMetadataParser = new CadMetadataParser();
  const cadModelMetadataRepository = new CadModelMetadataRepository(
    modelMetadataProvider,
    modelDataClient,
    cadMetadataParser
  );
  const cadModelFactory = new CadModelFactory(materialManager);
  const modelDataParser = new CadSectorParser();
  const modelDataTransformer = new SimpleAndDetailedToSector3D(materialManager);
  const cachedSectorRepository = new CachedRepository(modelDataClient, modelDataParser, modelDataTransformer);
  const { internal } = options;
  const sectorCuller =
    internal && internal.sectorCuller
      ? internal.sectorCuller
      : createDefaultSectorCuller(renderer, occludingGeometryProvider);
  const cadModelUpdateHandler = new CadModelUpdateHandler(cachedSectorRepository, sectorCuller);
  return new CadManager(materialManager, cadModelMetadataRepository, cadModelFactory, cadModelUpdateHandler);
}
