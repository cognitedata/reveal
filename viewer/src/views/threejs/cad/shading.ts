/*!
 * Copyright 2020 Cognite AS
 */

import { createMaterials, Materials } from './materials';

export interface Shading {
  materials: Materials;
  updateNodes: (treeIndices: number[]) => void;
}

type ColorDelegate = (treeIndex: number) => [number, number, number, number] | undefined;
type VisibilityDelegate = (treeIndex: number) => boolean;

export interface DefaultShadingOptions {
  color?: ColorDelegate;
  visible?: VisibilityDelegate;
}

function updateColors(getColor: ColorDelegate, materials: Materials, treeIndices: number[]) {
  for (const treeIndex of treeIndices) {
    const colorOrUndefined = getColor(treeIndex);
    const color = colorOrUndefined ? colorOrUndefined : [0, 0, 0, 0];
    materials.overrideColorPerTreeIndex.image.data[4 * treeIndex] = color[0];
    materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 1] = color[1];
    materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 2] = color[2];
    materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 3] = color[3];
  }
}

function updateVisibility(visible: VisibilityDelegate, materials: Materials, treeIndices: number[]) {
  for (const treeIndex of treeIndices) {
    materials.overrideVisibilityPerTreeIndex.image.data[4 * treeIndex] = visible(treeIndex) ? 255 : 0;
  }
}

export function createDefaultShading(options: DefaultShadingOptions): Shading {
  const materials = createMaterials();
  const updateNodes = (treeIndices: number[]) => {
    if (treeIndices.length === 0) {
      return;
    }
    if (options.color !== undefined) {
      updateColors(options.color, materials, treeIndices);
      materials.overrideColorPerTreeIndex.needsUpdate = true;
    }
    if (options.visible !== undefined) {
      updateVisibility(options.visible, materials, treeIndices);
      materials.overrideVisibilityPerTreeIndex.needsUpdate = true;
    }
  };

  return {
    materials,
    updateNodes
  };
}
