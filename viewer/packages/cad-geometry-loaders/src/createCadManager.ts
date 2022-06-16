/*!
 * Copyright 2021 Cognite AS
 */

import { CadManager } from './CadManager';
import { InternalRevealCadOptions } from './InternalRevealCadOptions';

import { CadModelUpdateHandler, createV8SectorCuller } from '@reveal/cad-geometry-loaders';
import { CadMaterialManager, CadGeometryRenderModePipelineProvider } from '@reveal/rendering';
import { ModelDataProvider, ModelMetadataProvider } from '@reveal/modeldata-api';
import { CadModelFactory } from '@reveal/cad-model';

export function createCadManager(
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider,
  renderer: THREE.WebGLRenderer,
  materialManager: CadMaterialManager,
  depthOnlyRenderPipeline: CadGeometryRenderModePipelineProvider,
  cadOptions: InternalRevealCadOptions & { continuousModelStreaming?: boolean }
): CadManager {
  const cadModelFactory = new CadModelFactory(materialManager, modelMetadataProvider, modelDataProvider);
  const sectorCuller =
    cadOptions && cadOptions.sectorCuller
      ? cadOptions.sectorCuller
      : createV8SectorCuller(renderer, depthOnlyRenderPipeline);
  const cadModelUpdateHandler = new CadModelUpdateHandler(sectorCuller, cadOptions.continuousModelStreaming);
  return new CadManager(materialManager, cadModelFactory, cadModelUpdateHandler);
}
