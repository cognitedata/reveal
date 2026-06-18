/*!
 * Copyright 2026 Cognite AS
 */

import type { MaterialBackend } from './materialBackend';
import type { Materials } from './materials';
import { createMaterials } from './materials';
import type { NodeMaterials } from '../tsl/nodeMaterials';
import { createNodeMaterials } from '../tsl/nodeMaterials';

import type { DataTexture, Texture } from 'three';
import { RenderMode } from './RenderMode';

export type CadMaterials = Materials | NodeMaterials;

export function isNodeMaterials(materials: CadMaterials): materials is NodeMaterials {
  return 'isNodeMaterial' in materials.triangleMesh && materials.triangleMesh.isNodeMaterial === true;
}

export function createCadMaterialsForBackend(
  backend: MaterialBackend,
  overrideColorPerTreeIndex: DataTexture,
  transformOverrideIndexTexture: DataTexture,
  transformOverrideLookupTexture: DataTexture,
  matCapTexture: Texture,
  renderMode: RenderMode = RenderMode.Color
): CadMaterials {
  if (backend === 'webgpu') {
    return createNodeMaterials(
      overrideColorPerTreeIndex,
      transformOverrideIndexTexture,
      transformOverrideLookupTexture,
      matCapTexture,
      renderMode
    );
  }

  return createMaterials(
    overrideColorPerTreeIndex,
    transformOverrideIndexTexture,
    transformOverrideLookupTexture,
    matCapTexture
  );
}
