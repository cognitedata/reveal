/*!
 * Copyright 2021 Cognite AS
 */

import { CadManager } from './CadManager';
import type { InternalRevealCadOptions } from './InternalRevealCadOptions';

import { CadModelUpdateHandler } from './CadModelUpdateHandler';
import type { CadMaterialManager } from '@reveal/rendering';
import type { ModelDataProvider, ModelMetadataProvider } from '@reveal/data-providers';
import { CadModelFactory } from '@reveal/cad-model';
import type { PickCacheInvalidator } from '@reveal/utilities';
import { ByScreenSizeSectorCuller } from './sector/culling/ByScreenSizeSectorCuller';

export function createCadManager(
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider,
  materialManager: CadMaterialManager,
  cadOptions: InternalRevealCadOptions & { continuousModelStreaming?: boolean },
  pickCacheInvalidator: PickCacheInvalidator
): CadManager {
  const cadModelFactory = new CadModelFactory(
    materialManager,
    modelMetadataProvider,
    modelDataProvider,
    pickCacheInvalidator
  );
  const sectorCuller = cadOptions && cadOptions.sectorCuller ? cadOptions.sectorCuller : new ByScreenSizeSectorCuller();
  const cadModelUpdateHandler = new CadModelUpdateHandler(sectorCuller, cadOptions.continuousModelStreaming);
  return new CadManager(materialManager, cadModelFactory, cadModelUpdateHandler, pickCacheInvalidator);
}
