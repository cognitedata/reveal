/*!
 * Copyright 2021 Cognite AS
 */

import { CadManager } from './CadManager';
import { InternalRevealCadOptions } from './InternalRevealCadOptions';

import { CadModelUpdateHandler } from './CadModelUpdateHandler';
import { CadMaterialManager } from '@reveal/rendering';
import { ModelDataProvider, ModelMetadataProvider } from '@reveal/data-providers';
import { CadModelFactory } from '@reveal/cad-model';
import { ByScreenSizeSectorCuller } from './sector/culling/ByScreenSizeSectorCuller';
import { SceneHandler } from '@reveal/utilities';

export function createCadManager(
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider,
  materialManager: CadMaterialManager,
  cadOptions: InternalRevealCadOptions & { continuousModelStreaming?: boolean },
  sceneHandler: SceneHandler
): CadManager {
  const cadModelFactory = new CadModelFactory(materialManager, modelMetadataProvider, modelDataProvider);
  const sectorCuller = cadOptions && cadOptions.sectorCuller ? cadOptions.sectorCuller : new ByScreenSizeSectorCuller();
  const cadModelUpdateHandler = new CadModelUpdateHandler(sectorCuller, cadOptions.continuousModelStreaming);
  return new CadManager(materialManager, cadModelFactory, cadModelUpdateHandler, sceneHandler);
}
