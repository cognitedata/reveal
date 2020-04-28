/*!
 * Copyright 2020 Cognite AS
 */

import { createMaterials, Materials } from './materials';
import { ModelVisibilityDelegate, ModelColorDelegate, ModelNodeAppearance } from '../../common/cad/ModelNodeAppearance';
import { RenderMode } from '../materials';
import {
  GlobalNodeAppearance,
  GlobalColorDelegate,
  GlobalVisibilityDelegate
} from '../../common/cad/GlobalNodeAppearance';

function updateColors(getColor: ModelColorDelegate, materials: Materials, treeIndices: number[]) {
  for (const treeIndex of treeIndices) {
    const color = getColor(treeIndex) || [0, 0, 0, 0];
    materials.overrideColorPerTreeIndex.image.data[4 * treeIndex] = color[0];
    materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 1] = color[1];
    materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 2] = color[2];
    materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 3] = color[3];
  }
}

function updateGlobalColors(
  modelIdentifier: string,
  getColor: GlobalColorDelegate,
  materials: Materials,
  treeIndices: number[]
) {
  for (const treeIndex of treeIndices) {
    const color = getColor(modelIdentifier, treeIndex) || [0, 0, 0, 0];
    materials.overrideColorPerTreeIndex.image.data[4 * treeIndex] = color[0];
    materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 1] = color[1];
    materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 2] = color[2];
    materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 3] = color[3];
  }
}

function updateVisibility(visible: ModelVisibilityDelegate, materials: Materials, treeIndices: number[]) {
  for (const treeIndex of treeIndices) {
    materials.overrideVisibilityPerTreeIndex.image.data[4 * treeIndex] = visible(treeIndex) ? 255 : 0;
  }
}

function updateGlobalVisibility(
  modelIdentifier: string,
  visible: GlobalVisibilityDelegate,
  materials: Materials,
  treeIndices: number[]
) {
  for (const treeIndex of treeIndices) {
    materials.overrideVisibilityPerTreeIndex.image.data[4 * treeIndex] = visible(modelIdentifier, treeIndex) ? 255 : 0;
  }
}

interface MaterialsWrapper {
  materials: Materials;
  nodeAppearance?: ModelNodeAppearance;
}

export class MaterialManager {
  private _renderMode: RenderMode = RenderMode.Color;
  private readonly materialsMap: Map<string, MaterialsWrapper> = new Map();
  private _globalAppearance?: GlobalNodeAppearance;

  constructor(globalAppearance?: GlobalNodeAppearance) {
    this._globalAppearance = globalAppearance;
  }

  addModelMaterials(modelIdentifier: string, maxTreeIndex: number, nodeAppearance?: ModelNodeAppearance) {
    const materials = createMaterials(maxTreeIndex + 1, this._renderMode);
    this.materialsMap.set(modelIdentifier, { materials, nodeAppearance });
    const indices = [];
    for (let i = 0; i < maxTreeIndex; i++) {
      indices.push(i);
    }
    this.updateModelNodes(modelIdentifier, indices);
  }

  getModelMaterials(modelIdentifier: string): Materials {
    return this.materialsMap.get(modelIdentifier)!.materials;
  }

  updateGlobalAppearance(nodeAppearance: GlobalNodeAppearance) {
    this._globalAppearance = nodeAppearance;
  }

  updateLocalAppearance(modelIdentifier: string, nodeAppearance: ModelNodeAppearance) {
    const materialWrapper = this.materialsMap.get(modelIdentifier)!;
    materialWrapper.nodeAppearance = nodeAppearance;
    this.materialsMap.set(modelIdentifier, materialWrapper);
  }

  setRenderMode(mode: RenderMode) {
    this._renderMode = mode;
    for (const materialsWrapper of this.materialsMap.values()) {
      const materials = materialsWrapper.materials;
      materials.box.uniforms.renderMode.value = mode;
      materials.circle.uniforms.renderMode.value = mode;
      materials.generalRing.uniforms.renderMode.value = mode;
      materials.nut.uniforms.renderMode.value = mode;
      materials.quad.uniforms.renderMode.value = mode;
      materials.cone.uniforms.renderMode.value = mode;
      materials.eccentricCone.uniforms.renderMode.value = mode;
      materials.sphericalSegment.uniforms.renderMode.value = mode;
      materials.torusSegment.uniforms.renderMode.value = mode;
      materials.generalCylinder.uniforms.renderMode.value = mode;
      materials.trapezium.uniforms.renderMode.value = mode;
      materials.ellipsoidSegment.uniforms.renderMode.value = mode;
      materials.instancedMesh.uniforms.renderMode.value = mode;
      materials.triangleMesh.uniforms.renderMode.value = mode;
      materials.simple.uniforms.renderMode.value = mode;
    }
  }

  getRenderMode(): RenderMode {
    return this._renderMode;
  }

  updateModelNodes(modelIdentifier: string, treeIndices: number[]) {
    const materialsWrapper = this.materialsMap.get(modelIdentifier);
    const materials = materialsWrapper!.materials;
    const localAppearance = materialsWrapper!.nodeAppearance;
    if (!localAppearance && !this._globalAppearance) {
      return;
    }
    if (treeIndices.length === 0) {
      return;
    }
    if (localAppearance && localAppearance.color !== undefined) {
      updateColors(localAppearance.color, materials, treeIndices);
      materials.overrideColorPerTreeIndex.needsUpdate = true;
    }
    if (localAppearance && localAppearance.visible !== undefined) {
      updateVisibility(localAppearance.visible, materials, treeIndices);
      materials.overrideVisibilityPerTreeIndex.needsUpdate = true;
    }

    if (this._globalAppearance && this._globalAppearance.color !== undefined) {
      updateGlobalColors(modelIdentifier, this._globalAppearance.color, materials, treeIndices);
      materials.overrideColorPerTreeIndex.needsUpdate = true;
    }
    if (this._globalAppearance && this._globalAppearance.visible !== undefined) {
      updateGlobalVisibility(modelIdentifier, this._globalAppearance.visible, materials, treeIndices);
      materials.overrideVisibilityPerTreeIndex.needsUpdate = true;
    }
  }
}
