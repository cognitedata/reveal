/*!
 * Copyright 2025 Cognite AS
 */

import {
  NodeAppearanceProvider,
  NodeAppearanceTextureBuilder,
  NodeTransformProvider,
  NodeTransformTextureBuilder
} from '@reveal/cad-styling';
import { type Plane, Texture } from 'three';
import { getMatCapTextureData } from './rendering/matCapTextureData';
import { createMaterials, type Materials } from './rendering/materials';
import type { RenderMode } from './rendering/RenderMode';

export type MaterialsDataWrapper = {
  materials: Materials;
  matCapTexture: Texture;
  perModelClippingPlanes: Plane[];
  nodeAppearanceProvider: NodeAppearanceProvider;
  nodeTransformProvider: NodeTransformProvider;
  nodeAppearanceTextureBuilder: NodeAppearanceTextureBuilder;
  nodeTransformTextureBuilder: NodeTransformTextureBuilder;
};

export function createMaterialsDataWrapper(
  maxTreeIndex: number,
  initialRenderMode: RenderMode,
  clippingPlanes: Plane[]
): MaterialsDataWrapper {
  const nodeAppearanceProvider = new NodeAppearanceProvider();
  const nodeAppearanceTextureBuilder = new NodeAppearanceTextureBuilder(maxTreeIndex + 1, nodeAppearanceProvider);
  nodeAppearanceTextureBuilder.build();

  const nodeTransformProvider = new NodeTransformProvider();
  const nodeTransformTextureBuilder = new NodeTransformTextureBuilder(maxTreeIndex + 1, nodeTransformProvider);
  nodeTransformTextureBuilder.build();

  const matCapTexture = new Texture(getMatCapTextureData());
  matCapTexture.needsUpdate = true;

  const materials = createMaterials(
    initialRenderMode,
    clippingPlanes,
    nodeAppearanceTextureBuilder.overrideColorPerTreeIndexTexture,
    nodeTransformTextureBuilder.overrideTransformIndexTexture,
    nodeTransformTextureBuilder.transformLookupTexture,
    matCapTexture
  );

  return {
    nodeAppearanceProvider,
    nodeAppearanceTextureBuilder,
    nodeTransformProvider,
    nodeTransformTextureBuilder,
    matCapTexture,
    materials,
    perModelClippingPlanes: []
  };
}
