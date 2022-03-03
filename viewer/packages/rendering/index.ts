/**
 * Copyright 2021 Cognite AS
 */

export { CadMaterialManager } from './src/CadMaterialManager';

export { createSimpleGeometryMesh } from './src/rendering/createSimpleGeometryMesh';

export { NodeAppearanceTextureBuilder } from './src/rendering/NodeAppearanceTextureBuilder';
export { NodeTransformTextureBuilder } from './src/transform/NodeTransformTextureBuilder';
export { NodeTransformProvider } from './src/transform/NodeTransformProvider';

export { CogniteColors, RevealColors } from './src/utilities/types';

export {
  RenderOptions,
  defaultRenderOptions,
  SsaoParameters,
  SsaoSampleQuality,
  AntiAliasingMode
} from './src/rendering/types';

export { EffectRenderManager } from './src/rendering/EffectRenderManager';
export { InstancedMeshManager } from './src/InstancedMeshManager';

export { RenderMode } from './src/rendering/RenderMode';
export { coverageShaders } from './src/rendering/shaders';

export { Materials, createMaterials } from './src/rendering/materials';
export { createPrimitives } from './src/rendering/primitives';

export { SceneComponentsProvider, NodeTypeExistences } from './src/sector/SceneComponentsProvider';
