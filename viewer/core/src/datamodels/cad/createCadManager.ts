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

import {
  LocalModelDataClient,
  LocalModelMetadataProvider,
  CdfModelDataClient,
  CdfModelMetadataProvider,
  LocalModelIdentifier,
  CdfModelIdentifier,
  ModelDataClient,
  ModelMetadataProvider
} from '@reveal/modeldata-api';

export function createLocalCadManager(
  modelMetadataProvider: LocalModelMetadataProvider,
  modelDataClient: LocalModelDataClient,
  renderer: THREE.WebGLRenderer,
  materialManager: CadMaterialManager,
  alreadyLoadedGeometryProvider: OccludingGeometryProvider,
  options: RevealOptions = {}
): CadManager<LocalModelIdentifier> {
  return createCadManager(
    modelMetadataProvider,
    modelDataClient,
    renderer,
    materialManager,
    alreadyLoadedGeometryProvider,
    options
  );
}
export function createCdfCadManager(
  modelMetadataProvider: CdfModelMetadataProvider,
  modelDataClient: CdfModelDataClient,
  renderer: THREE.WebGLRenderer,
  materialManager: CadMaterialManager,
  alreadyLoadedGeometryProvider: OccludingGeometryProvider,
  options: RevealOptions = {}
): CadManager<CdfModelIdentifier> {
  return createCadManager(
    modelMetadataProvider,
    modelDataClient,
    renderer,
    materialManager,
    alreadyLoadedGeometryProvider,
    options
  );
}

export function createCadManager<T>(
  modelMetadataProvider: ModelMetadataProvider<T>,
  modelDataClient: ModelDataClient,
  renderer: THREE.WebGLRenderer,
  materialManager: CadMaterialManager,
  occludingGeometryProvider: OccludingGeometryProvider,
  options: RevealOptions
): CadManager<T> {
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
