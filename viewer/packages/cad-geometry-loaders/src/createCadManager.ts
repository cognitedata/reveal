/*!
 * Copyright 2021 Cognite AS
 */

import { CadManager } from './CadManager';
import { InternalRevealCadOptions } from './InternalRevealCadOptions';

import { CadModelUpdateHandler } from '@reveal/cad-geometry-loaders';
import { CadMaterialManager } from '@reveal/rendering';
import { ModelDataProvider, ModelMetadataProvider } from '@reveal/modeldata-api';
import { CadModelFactory } from '@reveal/cad-model';
import { ByScreenSizeSectorCuller } from './sector/culling/ByScreenSizeSectorCuller';

export function createCadManager(
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider,
  materialManager: CadMaterialManager,
  cadOptions: InternalRevealCadOptions & { continuousModelStreaming?: boolean }
): CadManager {
  const cadModelFactory = new CadModelFactory(materialManager, modelMetadataProvider, modelDataProvider);
  const sectorCuller = cadOptions && cadOptions.sectorCuller ? cadOptions.sectorCuller : new ByScreenSizeSectorCuller();
  const cadModelUpdateHandler = new CadModelUpdateHandler(sectorCuller, cadOptions.continuousModelStreaming);
  return new CadManager(materialManager, cadModelFactory, cadModelUpdateHandler);
}
