/*!
 * Copyright 2020 Cognite AS
 */

import { createMaterials, Materials } from './rendering/materials';
import { ModelVisibilityDelegate, ModelColorDelegate, ModelNodeAppearance } from './ModelNodeAppearance';
import { RenderMode } from './rendering/RenderMode';
import { GlobalColorDelegate, GlobalVisibilityDelegate, GlobalNodeAppearance } from './GlobalNodeAppearance';
import { ModelRenderAppearance } from './ModelRenderAppearance';
import { toThreeJsBox3 } from '@/utilities';

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
  renderAppearance?: ModelRenderAppearance;
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

  addModelMaterials(modelIdentifier: string, maxTreeIndex: number) {
    const materials = createMaterials(maxTreeIndex + 1, this._renderMode, this._clippingPlanes);
    this.materialsMap.set(modelIdentifier, { materials });
  }

  setNodeAppearance(modelIdentifier: string, nodeAppearance: ModelNodeAppearance) {
    const wrapper = this.materialsMap.get(modelIdentifier)!;
    const newWrapper: MaterialsWrapper = { ...wrapper, nodeAppearance };
    this.materialsMap.set(modelIdentifier, newWrapper);
  }

  setRenderAppearance(modelIdentifier: string, renderAppearance: ModelRenderAppearance) {
    const wrapper: MaterialsWrapper = this.materialsMap.get(modelIdentifier)!;
    const newWrapper: MaterialsWrapper = { ...wrapper, renderAppearance };
    this.materialsMap.set(modelIdentifier, newWrapper);
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
    const localNodeAppearance = materialsWrapper!.nodeAppearance;
    const renderAppearance = materialsWrapper!.renderAppearance;
    // TODO Set visibility green channel with renderAppearance
    if (!localNodeAppearance && !this._globalAppearance) {
      return;
    }
    if (treeIndices.length === 0) {
      return;
    }

    this.updateLocalNodeAppearance(localNodeAppearance, materials, treeIndices);
    this.updateRenderAppearance(renderAppearance, materials, treeIndices);
    this.updateGlobalNodeAppearance(modelIdentifier, materials, treeIndices);
  }

  private updateRenderAppearance(
    renderAppearance: ModelRenderAppearance | undefined,
    materials: Materials,
    treeIndices: number[]
  ) {
    if (!renderAppearance || renderAppearance.renderInFront === undefined) {
      return;
    }

    for (const treeIndex of treeIndices) {
      materials.overrideVisibilityPerTreeIndex.image.data[4 * treeIndex + 1] = renderAppearance.renderInFront(treeIndex)
        ? 255
        : 0;
    }
    materials.overrideVisibilityPerTreeIndex.needsUpdate = true;
  }

  private updateGlobalNodeAppearance(modelIdentifier: string, materials: Materials, treeIndices: number[]) {
    if (this._globalAppearance && this._globalAppearance.color !== undefined) {
      updateGlobalColors(modelIdentifier, this._globalAppearance.color, materials, treeIndices);
      materials.overrideColorPerTreeIndex.needsUpdate = true;
    }
    if (this._globalAppearance && this._globalAppearance.visible !== undefined) {
      updateGlobalVisibility(modelIdentifier, this._globalAppearance.visible, materials, treeIndices);
      materials.overrideVisibilityPerTreeIndex.needsUpdate = true;
    }
  }

  private updateLocalNodeAppearance(
    localAppearance: ModelNodeAppearance | undefined,
    materials: Materials,
    treeIndices: number[]
  ) {
    if (localAppearance && localAppearance.color !== undefined) {
      updateColors(localAppearance.color, materials, treeIndices);
      materials.overrideColorPerTreeIndex.needsUpdate = true;
    }
    if (localAppearance && localAppearance.visible !== undefined) {
      updateVisibility(localAppearance.visible, materials, treeIndices);
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
