/**
 * Copyright 2021 Cognite AS
 */

export { CadMaterialManager, createCadMaterial, CadMaterial } from './src/CadMaterialManager';
export { PointCloudMaterialManager } from './src/PointCloudMaterialManager';

export {
  RenderOptions,
  defaultRenderOptions,
  SsaoParameters,
  SsaoSampleQuality,
  AntiAliasingMode,
  EdlOptions
} from './src/rendering/types';

export * from './src/pointcloud-rendering/constants';
export * from './src/pointcloud-rendering/enums';
export * from './src/pointcloud-rendering/types';
export * from './src/pointcloud-rendering/PointCloudObjectIdMaps';
export { DEFAULT_CLASSIFICATION } from './src/pointcloud-rendering/classification';

export { RenderMode } from './src/rendering/RenderMode';
export { RenderLayer, setModelRenderLayers } from './src/utilities/renderUtilities';
export { StyledTreeIndexSets } from './src/utilities/types';

export { Materials } from './src/rendering/materials';
export { PointCloudMaterial, OctreeMaterialParams } from './src/pointcloud-rendering';

export { DefaultRenderPipelineProvider } from './src/render-pipeline-providers/DefaultRenderPipelineProvider';
export { CadGeometryRenderModePipelineProvider } from './src/render-pipeline-providers/CadGeometryRenderModePipelineProvider';

export { BasicPipelineExecutor } from './src/pipeline-executors/BasicPipelineExecutor';
export { RenderPipelineExecutor } from './src/RenderPipelineExecutor';
export { RenderPipelineProvider } from './src/RenderPipelineProvider';
export { ResizeHandler } from './src/ResizeHandler';
export { SettableRenderTarget } from './src/rendering/SettableRenderTarget';
