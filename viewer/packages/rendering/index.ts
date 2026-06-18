/**
 * Copyright 2021 Cognite AS
 */

export type { CadMaterial } from './src/CadMaterialManager';
export { CadMaterialManager, createCadMaterial } from './src/CadMaterialManager';
export { PointCloudMaterialManager } from './src/PointCloudMaterialManager';

export type { RenderOptions, SsaoParameters, EdlOptions } from './src/rendering/types';
export { defaultRenderOptions, SsaoSampleQuality, AntiAliasingMode } from './src/rendering/types';

export * from './src/pointcloud-rendering/constants';
export * from './src/pointcloud-rendering/enums';
export * from './src/pointcloud-rendering/types';
export * from './src/pointcloud-rendering/PointCloudObjectIdMaps';
export { DEFAULT_CLASSIFICATION } from './src/pointcloud-rendering/classification';

export { RenderMode } from './src/rendering/RenderMode';
export { RenderLayer, setModelRenderLayers } from './src/utilities/renderUtilities';
export type { StyledTreeIndexSets } from './src/utilities/types';

export { type Materials, initializeDefinesAndUniforms, forEachMaterial } from './src/rendering/materials';
export { createCadMaterialsForBackend, isNodeMaterials, type CadMaterials } from './src/rendering/cadMaterialFactory';
export { type MaterialBackend } from './src/rendering/materialBackend';
export { createRevealRenderer, isWebGPURenderer, type RevealRenderer } from './src/rendering/RevealRenderer';
export { createNodeMaterials, forEachNodeMaterial, setNodeMaterialsRenderMode, type NodeMaterials } from './src/tsl/nodeMaterials';
export type { OctreeMaterialParams } from './src/pointcloud-rendering';
export { PointCloudMaterial } from './src/pointcloud-rendering';

export { DefaultRenderPipelineProvider } from './src/render-pipeline-providers/DefaultRenderPipelineProvider';
export { CadGeometryRenderModePipelineProvider } from './src/render-pipeline-providers/CadGeometryRenderModePipelineProvider';

export { BasicPipelineExecutor } from './src/pipeline-executors/BasicPipelineExecutor';
export type { RenderPipelineExecutor } from './src/RenderPipelineExecutor';
export type { RenderPipelineProvider } from './src/RenderPipelineProvider';
export { RevealRendererStateHelper } from './src/utilities/RevealRendererStateHelper';
export { ResizeHandler } from './src/ResizeHandler';
export type { SettableRenderTarget } from './src/rendering/SettableRenderTarget';
