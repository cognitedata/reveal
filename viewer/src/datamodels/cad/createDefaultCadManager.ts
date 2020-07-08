/*!
 * Copyright 2020 Cognite AS
 */

import { CadManager } from './CadManager';
import { CadMetadataParser } from './parsers/CadMetadataParser';
import { CadModelMetadataRepository } from './CadModelMetadataRepository';
import { CadModelFactory } from './CadModelFactory';
import { CadModelUpdateHandler } from './CadModelUpdateHandler';
import { DefaultCadTransformation } from './DefaultCadTransformation';
import { MaterialManager } from './MaterialManager';
import { CadSectorParser } from './sector/CadSectorParser';
import { CachedRepository } from './sector/CachedRepository';
import { SimpleAndDetailedToSector3D } from './sector/SimpleAndDetailedToSector3D';
import { ByVisibilityGpuSectorCuller } from './sector/culling/ByVisibilityGpuSectorCuller';
import { File3dFormat } from '@/utilities/types';
import { LocalModelDataClient } from '@/utilities/networking/LocalModelDataClient';
import { CdfModelDataClient } from '@/utilities/networking/CdfModelDataClient';

export function createDefaultCadManager(client: LocalModelDataClient): CadManager<{ fileName: string }>;
export function createDefaultCadManager(
  client: CdfModelDataClient
): CadManager<{ modelId: number; revisionId: number; format: File3dFormat }>;
export function createDefaultCadManager(
  client: LocalModelDataClient | CdfModelDataClient
): CadManager<{ fileName: string }> | CadManager<{ modelId: number; revisionId: number; format: File3dFormat }> {
  const cadModelTransformationProvider = new DefaultCadTransformation();
  const cadMetadataParser = new CadMetadataParser();
  let cadModelMetadataRepository: CadModelMetadataRepository<unknown>;
  if (client instanceof CdfModelDataClient) {
    cadModelMetadataRepository = new CadModelMetadataRepository(
      client,
      cadModelTransformationProvider,
      cadMetadataParser
    );
  } else if (client instanceof LocalModelDataClient) {
    cadModelMetadataRepository = new CadModelMetadataRepository(
      client,
      cadModelTransformationProvider,
      cadMetadataParser
    );
  } else {
    throw new Error('Client type not supported');
  }
  const materialManager = new MaterialManager();
  const cadModelFactory = new CadModelFactory(materialManager);
  const modelDataParser = new CadSectorParser();
  const modelDataTransformer = new SimpleAndDetailedToSector3D(materialManager);
  const cachedSectorRepository = new CachedRepository(client, modelDataParser, modelDataTransformer);
  const sectorCuller = new ByVisibilityGpuSectorCuller();
  const cadModelUpdateHandler = new CadModelUpdateHandler(cachedSectorRepository, sectorCuller);
  return new CadManager(materialManager, cadModelMetadataRepository, cadModelFactory, cadModelUpdateHandler);
}
