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
  // TODO: j-bjorne 29-04-2020: Move into separate cliping manager?
  private _clippingPlanes: THREE.Plane[] = [];
  private _clipIntersection: boolean = false;

  constructor(globalAppearance?: GlobalNodeAppearance) {
    this._globalAppearance = globalAppearance;
  }

  addModelMaterials(modelIdentifier: string, maxTreeIndex: number, nodeAppearance?: ModelNodeAppearance) {
    const materials = createMaterials(maxTreeIndex + 1, this._renderMode, this._clippingPlanes);
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

  get clippingPlanes(): THREE.Plane[] {
    return this._clippingPlanes;
  }

  set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._clippingPlanes = clippingPlanes;
    this.applyToAllMaterials(material => {
      material.clippingPlanes = clippingPlanes;
      // console.log('Setting', material, clippingPlanes);
    });
  }

  get clipIntersection(): boolean {
    return this._clipIntersection;
  }

  set clipIntersection(intersection: boolean) {
    this._clipIntersection = intersection;
    this.applyToAllMaterials(material => {
      material.clipIntersection = intersection;
    });
  }

  setRenderMode(mode: RenderMode) {
    this._renderMode = mode;
    this.applyToAllMaterials(material => {
      material.uniforms.renderMode.value = mode;
    });
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

  private applyToAllMaterials(callback: (material: THREE.ShaderMaterial) => void) {
    for (const materialWrapper of this.materialsMap.values()) {
      const materials = materialWrapper.materials;
      callback(materials.box);
      callback(materials.circle);
      callback(materials.generalRing);
      callback(materials.nut);
      callback(materials.quad);
      callback(materials.cone);
      callback(materials.eccentricCone);
      callback(materials.sphericalSegment);
      callback(materials.torusSegment);
      callback(materials.generalCylinder);
      callback(materials.trapezium);
      callback(materials.ellipsoidSegment);
      callback(materials.instancedMesh);
      callback(materials.triangleMesh);
      callback(materials.simple);
    }
  }
}
