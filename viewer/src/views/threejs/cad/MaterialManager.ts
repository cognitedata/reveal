/*!
 * Copyright 2020 Cognite AS
 */

import { createMaterials, Materials } from './materials';
import { VisibilityDelegate, ColorDelegate, NodeAppearance } from '../../common/cad/NodeAppearance';
import { RenderMode } from '../materials';

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
  public readonly materials: Readonly<Materials>;
  private readonly _options?: NodeAppearance;

  constructor(options?: NodeAppearance) {
    this.materials = createMaterials();
    this._options = options;
    this.setRenderMode(RenderMode.Color);
  }

  setRenderMode(mode: RenderMode) {
    this.materials.box.uniforms.renderMode.value = mode;
    this.materials.circle.uniforms.renderMode.value = mode;
    this.materials.generalRing.uniforms.renderMode.value = mode;
    this.materials.nut.uniforms.renderMode.value = mode;
    this.materials.quad.uniforms.renderMode.value = mode;
    this.materials.cone.uniforms.renderMode.value = mode;
    this.materials.eccentricCone.uniforms.renderMode.value = mode;
    this.materials.sphericalSegment.uniforms.renderMode.value = mode;
    this.materials.torusSegment.uniforms.renderMode.value = mode;
    this.materials.generalCylinder.uniforms.renderMode.value = mode;
    this.materials.trapezium.uniforms.renderMode.value = mode;
    this.materials.ellipsoidSegment.uniforms.renderMode.value = mode;
    this.materials.instancedMesh.uniforms.renderMode.value = mode;
    this.materials.triangleMesh.uniforms.renderMode.value = mode;
    this.materials.simple.uniforms.renderMode.value = mode;
  }

  getRenderMode(): RenderMode {
    return this.materials.box.uniforms.renderMode.value;
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
