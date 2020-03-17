/*!
 * Copyright 2020 Cognite AS
 */

import { createMaterials, Materials } from './materials';
import {
  VisibilityDelegate,
  ColorDelegate,
  NodeAppearance
} from '../../common/cad/NodeAppearance';

function updateColors(getColor: ColorDelegate, materials: Materials, treeIndices: number[]) {
  for (const treeIndex of treeIndices) {
    const color = getColor(treeIndex) || [0, 0, 0, 0];
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

export class MaterialManager {
  public readonly materials: Materials;
  private readonly _options?: NodeAppearance;

  constructor(options?: NodeAppearance) {
    this.materials = createMaterials();
    this._options = options;
  }

  updateNodes(treeIndices: number[]) {
    const options = this._options;
    const materials = this.materials;
    if (!options) {
      return;
    }
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
  }
}
