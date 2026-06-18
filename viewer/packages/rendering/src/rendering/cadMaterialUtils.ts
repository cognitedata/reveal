/*!
 * Copyright 2026 Cognite AS
 */

import type { DataTexture, Material, Plane, RawShaderMaterial, Texture } from 'three';
import { Vector2, Vector4 } from 'three';
import type { NodeMaterial } from 'three/webgpu';

import { forEachMaterial, initializeDefinesAndUniforms, type Materials } from './materials';
import { RenderMode } from './RenderMode';
import type { CadMaterials } from './cadMaterialFactory';
import { isNodeMaterials } from './cadMaterialFactory';
import { forEachNodeMaterial, setNodeMaterialsRenderMode, type NodeMaterials } from '../tsl/nodeMaterials';
import { setCadSharedRenderMode, updateCadSharedTextureUniforms, type CadSharedUniformNodes } from '../tsl/CadSharedUniforms';
import type { CadNodeMaterial } from '../tsl/CadNodeMaterial';

export function forEachCadMaterial(materials: CadMaterials, callback: (material: Material) => void): void {
  if (isNodeMaterials(materials)) {
    forEachNodeMaterial(materials, callback);
    return;
  }
  forEachMaterial(materials, callback as (material: RawShaderMaterial) => void);
}

export function setCadMaterialsRenderMode(materials: CadMaterials, renderMode: RenderMode): void {
  if (isNodeMaterials(materials)) {
    setNodeMaterialsRenderMode(materials, renderMode);
    return;
  }
  const colorWrite = renderMode !== RenderMode.DepthBufferOnly;
  forEachMaterial(materials, material => {
    material.uniforms.renderMode.value = renderMode;
    material.colorWrite = colorWrite;
  });
}

export function setCadMaterialsClipping(materials: CadMaterials, clippingPlanes: Plane[]): void {
  forEachCadMaterial(materials, material => {
    material.clipping = clippingPlanes.length > 0;
    material.clipIntersection = false;
    material.clippingPlanes = clippingPlanes;
    if (!isNodeMaterial(material)) {
      const rawMaterial = material as RawShaderMaterial;
      rawMaterial.defines = {
        ...rawMaterial.defines,
        NUM_CLIPPING_PLANES: clippingPlanes.length,
        UNION_CLIPPING_PLANES: 0
      };
      rawMaterial.needsUpdate = true;
    }
  });
}

export function updateCadMaterialsTransformTextures(
  materials: CadMaterials,
  transformLookupTexture: DataTexture,
  transformOverrideIndexTexture: DataTexture,
  overrideColorPerTreeIndex: DataTexture
): void {
  if (isNodeMaterials(materials)) {
    forEachNodeMaterial(materials, material => {
      const cadMaterial = material as CadNodeMaterial;
      updateCadSharedTextureUniforms(
        cadMaterial.sharedUniforms,
        overrideColorPerTreeIndex,
        transformOverrideIndexTexture,
        transformLookupTexture
      );
    });
    return;
  }

  const transformsLookupTextureSize = new Vector2(
    transformLookupTexture.image.width,
    transformLookupTexture.image.height
  );
  forEachMaterial(materials, material => {
    material.uniforms.transformOverrideTexture.value = transformLookupTexture;
    material.uniforms.transformOverrideTextureSize.value = transformsLookupTextureSize;
  });
}

export function initializeCadMaterialUniforms(
  materials: CadMaterials,
  overrideColorPerTreeIndex: DataTexture,
  transformOverrideIndexTexture: DataTexture,
  transformLookupTexture: DataTexture,
  matCapTexture: Texture,
  renderMode: RenderMode,
  material?: Material
): void {
  if (material !== undefined && isNodeMaterial(material)) {
    updateCadSharedTextureUniforms(
      (material as CadNodeMaterial).sharedUniforms,
      overrideColorPerTreeIndex,
      transformOverrideIndexTexture,
      transformLookupTexture
    );
    setCadSharedRenderMode((material as CadNodeMaterial).sharedUniforms, renderMode);
    return;
  }

  if (material !== undefined) {
    initializeDefinesAndUniforms(
      material as RawShaderMaterial,
      overrideColorPerTreeIndex,
      transformOverrideIndexTexture,
      transformLookupTexture,
      matCapTexture,
      renderMode
    );
  }
}

export function isNodeMaterial(material: Material): material is NodeMaterial {
  return 'isNodeMaterial' in material && material.isNodeMaterial === true;
}

export function getCadNodeSharedUniforms(material: Material): CadSharedUniformNodes | undefined {
  if (isNodeMaterial(material) && 'sharedUniforms' in material) {
    return (material as CadNodeMaterial).sharedUniforms;
  }
  return undefined;
}

export type { Materials, NodeMaterials };
