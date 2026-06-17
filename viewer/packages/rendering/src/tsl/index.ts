/*!
 * Copyright 2026 Cognite AS
 */

export { createRevealRenderer, isWebGPURenderer, type RevealRenderer } from '../rendering/RevealRenderer';
export { type MaterialBackend } from '../rendering/materialBackend';
export { CadNodeMaterial } from './CadNodeMaterial';
export {
  createCadSharedUniformNodes,
  setCadSharedRenderMode,
  setCameraPosition,
  setInverseModelMatrix,
  updateCadSharedTextureUniforms,
  type CadSharedUniformNodes
} from './CadSharedUniforms';
export {
  createNodeMaterials,
  forEachNodeMaterial,
  setNodeMaterialsRenderMode,
  type NodeMaterials
} from './nodeMaterials';
