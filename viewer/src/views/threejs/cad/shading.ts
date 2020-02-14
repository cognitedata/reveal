/*!
 * Copyright 2020 Cognite AS
 */

import { createMaterials, Materials } from './materials';

export interface Shading {
  materials: Materials;
  updateNodes: (treeIndices: number[]) => void;
}

export interface DefaultShadingOptions {
  color: (treeIndex: number) => number[] | undefined;
}

export function createDefaultShading(options: DefaultShadingOptions) {
  const materials = createMaterials();
  const updateNodes = (treeIndices: number[]) => {
    if (treeIndices.length === 0) {
      return;
    }
    for (const treeIndex of treeIndices) {
      const colorOrUndefined = options.color(treeIndex);
      const color = colorOrUndefined ? colorOrUndefined : [0, 0, 0, 0];
      materials.colorDataTexture.image.data[4 * treeIndex] = color[0];
      materials.colorDataTexture.image.data[4 * treeIndex + 1] = color[1];
      materials.colorDataTexture.image.data[4 * treeIndex + 2] = color[2];
      materials.colorDataTexture.image.data[4 * treeIndex + 3] = color[3];
    }
    materials.colorDataTexture.needsUpdate = true;
  };

  return {
    materials,
    updateNodes
  };
}
