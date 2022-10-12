/**
 * Copyright 2021 Cognite AS
 */

export { CadMaterialManager } from './src/CadMaterialManager';
export { PointCloudMaterialManager } from './src/PointCloudMaterialManager';

export { NodeTransformProvider } from './src/transform/NodeTransformProvider';

export {
  RenderOptions,
  defaultRenderOptions,
  SsaoParameters,
  SsaoSampleQuality,
  AntiAliasingMode
} from './src/rendering/types';

export * from './src/pointcloud-rendering/constants';
export * from './src/pointcloud-rendering/enums';
export * from './src/pointcloud-rendering/types';
export { DEFAULT_CLASSIFICATION } from './src/pointcloud-rendering/classification';

export {
  CompletePointCloudAppearance,
  PointCloudAppearance,
  DefaultPointCloudAppearance,
  applyDefaultsToPointCloudAppearance
} from './src/pointcloud-rendering/styling/PointCloudAppearance';
export { StyledPointCloudObjectCollection } from './src/pointcloud-rendering/styling/StyledPointCloudObjectCollection';
export { PointCloudObjectCollection } from './src/pointcloud-rendering/styling/PointCloudObjectCollection';
export { AnnotationIdPointCloudObjectCollection } from './src/pointcloud-rendering/styling/AnnotationIdPointCloudObjectCollection';

export { RenderMode } from './src/rendering/RenderMode';
export { RenderLayer } from './src/utilities/renderUtilities';
export { coverageShaders } from './src/rendering/shaders';

export { Materials } from './src/rendering/materials';
export { PointCloudMaterial, OctreeMaterialParams } from './src/pointcloud-rendering';

export { DefaultRenderPipelineProvider } from './src/render-pipeline-providers/DefaultRenderPipelineProvider';
export { CadGeometryRenderModePipelineProvider } from './src/render-pipeline-providers/CadGeometryRenderModePipelineProvider';
export { BasicPipelineExecutor } from './src/pipeline-executors/BasicPipelineExecutor';
export { RenderPipelineExecutor } from './src/RenderPipelineExecutor';
export { RenderPipelineProvider } from './src/RenderPipelineProvider';
