/*!
 * Copyright 2021 Cognite AS
 */

import { CadManager } from './CadManager';
import { CadMetadataParser } from './parsers/CadMetadataParser';
import { CadModelMetadataRepository } from './CadModelMetadataRepository';
import { CadModelFactory } from './CadModelFactory';

import { MaterialManager } from './MaterialManager';
import { CadSectorParser } from './sector/CadSectorParser';

import { ByVisibilityGpuSectorCuller } from './sector/culling/ByVisibilityGpuSectorCuller';
import { LocalModelDataClient } from '../../utilities/networking/LocalModelDataClient';
import { CdfModelDataClient } from '../../utilities/networking/CdfModelDataClient';
import { LocalModelIdentifier, CdfModelIdentifier, ModelDataClient } from '../../utilities/networking/types';
import { RevealOptions } from '../../public/types';

export function createLocalCadManager(
  client: LocalModelDataClient,
  options: RevealOptions = {}
): CadManager<LocalModelIdentifier> {
  return createCadManager(client, options);
}
export function createCdfCadManager(
  client: CdfModelDataClient,
  options: RevealOptions = {}
): CadManager<CdfModelIdentifier> {
  return createCadManager(client, options);
}

export function createCadManager<T>(client: ModelDataClient<T>, options: RevealOptions): CadManager<T> {
  const cadMetadataParser = new CadMetadataParser();
  const cadModelMetadataRepository = new CadModelMetadataRepository(client, cadMetadataParser);
  const materialManager = new MaterialManager();
  const cadModelFactory = new CadModelFactory(materialManager);
  const modelDataParser = new CadSectorParser();
  const { internal } = options;
  const sectorCuller = internal && internal.sectorCuller ? internal.sectorCuller : new ByVisibilityGpuSectorCuller();
  return new CadManager(
    materialManager,
    cadModelMetadataRepository,
    cadModelFactory,
    sectorCuller,
    client,
    modelDataParser
  );
}
