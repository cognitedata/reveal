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

export function createCadManager<TModelIdentifier>(
  modelMetadataProvider: ModelMetadataProvider<TModelIdentifier>,
  modelDataClient: ModelDataClient,
  renderer: THREE.WebGLRenderer,
  materialManager: CadMaterialManager,
  occludingGeometryProvider: OccludingGeometryProvider,
  options: RevealOptions
): CadManager<TModelIdentifier> {
  const cadModelFactory = new CadModelFactory<TModelIdentifier>(
    materialManager,
    modelMetadataProvider,
    modelDataClient
  );
  const { internal } = options;
  const sectorCuller =
    internal && internal.sectorCuller
      ? internal.sectorCuller
      : createDefaultSectorCuller(renderer, occludingGeometryProvider);
  const cadModelUpdateHandler = new CadModelUpdateHandler(sectorCuller);
  return new CadManager(materialManager, cadModelFactory, cadModelUpdateHandler);
}
