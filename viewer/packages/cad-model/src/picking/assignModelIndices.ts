/*!
 * Copyright 2026 Cognite AS
 */

import { forEachMaterial } from '@reveal/rendering';
import type { CadNode } from '../wrappers/CadNode';

// The model a hit belongs to is encoded as `modelIndex + 1` in the alpha byte of the tree index pass
// (0 = no hit), so at most 255 models can be picked in one combined pass.
export const MAX_COMBINED_PICK_MODELS = 255;

/**
 * Gives each model its position in the list as model index, which the tree index pass writes to the alpha byte.
 */
export function assignModelIndices(cadNodes: CadNode[]): void {
  cadNodes.forEach((cadNode, index) => {
    forEachMaterial(cadNode.cadMaterial.materials, material => {
      if (material.uniforms.modelIndex === undefined) {
        throw new Error('CAD material has no modelIndex uniform, cannot pick the models in one pass');
      }
      material.uniforms.modelIndex.value = index;
    });
  });
}
