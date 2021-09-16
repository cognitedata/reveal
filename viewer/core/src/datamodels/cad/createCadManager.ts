/*!
 * Copyright 2021 Cognite AS
 */

import { ModelDataClient, CadMetadataParser, CadModelMetadataRepository, CadSectorParser } from '@reveal/cad-parsers';

import { CadManager } from './CadManager';
import { CadModelFactory } from './CadModelFactory';

import {
  CadModelUpdateHandler,
  CadMaterialManager,
  CachedRepository,
  SimpleAndDetailedToSector3D,
  createDefaultSectorCuller,
  OccludingGeometryProvider
} from '@reveal/cad-geometry-loaders';

import { LocalModelDataClient } from '../../utilities/networking/LocalModelDataClient';
import { CdfModelDataClient } from '../../utilities/networking/CdfModelDataClient';
import { LocalModelIdentifier, CdfModelIdentifier } from '../../utilities/networking/types';
import { RevealOptions } from '../../public/types';

export function createLocalCadManager(
  client: LocalModelDataClient,
  renderer: THREE.WebGLRenderer,
  materialManager: CadMaterialManager,
  alreadyLoadedGeometryProvider: OccludingGeometryProvider,
  options: RevealOptions = {}
): CadManager<LocalModelIdentifier> {
  return createCadManager(client, renderer, materialManager, alreadyLoadedGeometryProvider, options);
}
export function createCdfCadManager(
  client: CdfModelDataClient,
  renderer: THREE.WebGLRenderer,
  materialManager: CadMaterialManager,
  alreadyLoadedGeometryProvider: OccludingGeometryProvider,
  options: RevealOptions = {}
): CadManager<CdfModelIdentifier> {
  return createCadManager(client, renderer, materialManager, alreadyLoadedGeometryProvider, options);
}

export function createCadManager<T>(
  client: ModelDataClient<T>,
  renderer: THREE.WebGLRenderer,
  materialManager: CadMaterialManager,
  occludingGeometryProvider: OccludingGeometryProvider,
  options: RevealOptions
): CadManager<T> {
  const cadMetadataParser = new CadMetadataParser();
  const cadModelMetadataRepository = new CadModelMetadataRepository(client, cadMetadataParser);
  const cadModelFactory = new CadModelFactory(materialManager);
  const modelDataParser = new CadSectorParser();
  const modelDataTransformer = new SimpleAndDetailedToSector3D(materialManager);
  const cachedSectorRepository = new CachedRepository(client, modelDataParser, modelDataTransformer);
  const { internal } = options;
  const sectorCuller =
    internal && internal.sectorCuller
      ? internal.sectorCuller
      : createDefaultSectorCuller(renderer, occludingGeometryProvider);
  const cadModelUpdateHandler = new CadModelUpdateHandler(cachedSectorRepository, sectorCuller);
  return new CadManager(materialManager, cadModelMetadataRepository, cadModelFactory, cadModelUpdateHandler);
}
