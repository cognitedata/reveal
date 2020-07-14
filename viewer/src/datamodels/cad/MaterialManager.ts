/*!
 * Copyright 2020 Cognite AS
 */

import { createMaterials, Materials } from './rendering/materials';
import { RenderMode } from './rendering/RenderMode';
import { NodeAppearanceProvider } from './NodeAppearance';

interface MaterialsWrapper {
  materials: Materials;
  nodeAppearanceProvider?: NodeAppearanceProvider;
}

export class MaterialManager {
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
  private _renderMode: RenderMode = RenderMode.Color;
  private readonly materialsMap: Map<string, MaterialsWrapper> = new Map();
  // TODO: j-bjorne 29-04-2020: Move into separate cliping manager?
  private _clippingPlanes: THREE.Plane[] = [];
  private _clipIntersection: boolean = false;

  private readonly _inFrontTreeIndices = new Map<string, Set<number>>();

  addModelMaterials(modelIdentifier: string, maxTreeIndex: number) {
    const materials = createMaterials(maxTreeIndex + 1, this._renderMode, this._clippingPlanes);
    this.materialsMap.set(modelIdentifier, { materials });

    this._inFrontTreeIndices.set(modelIdentifier, new Set());
  }

  setNodeAppearanceProvider(modelIdentifier: string, nodeAppearanceProvider?: NodeAppearanceProvider) {
    const wrapper = this.materialsMap.get(modelIdentifier)!;
    const newWrapper: MaterialsWrapper = { ...wrapper, nodeAppearanceProvider };
    this.materialsMap.set(modelIdentifier, newWrapper);
  }

  getModelMaterials(modelIdentifier: string): Materials {
    return this.materialsMap.get(modelIdentifier)!.materials;
  }

  getModelNodeAppearanceProvider(modelIdentifier: string): NodeAppearanceProvider | undefined {
    return this.materialsMap.get(modelIdentifier)!.nodeAppearanceProvider;
  }

  getModelInFrontTreeIndices(modelIdentifier: string): Set<number> | undefined {
    return this._inFrontTreeIndices.get(modelIdentifier);
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
    const appearanceProvider = materialsWrapper!.nodeAppearanceProvider;
    if (!appearanceProvider) {
      return;
    }
    if (treeIndices.length === 0) {
      return;
    }

    this.updateNodeAppearance(appearanceProvider, materials, treeIndices, modelIdentifier);
  }

  private updateNodeAppearance(
    appearanceProvider: NodeAppearanceProvider | undefined,
    materials: Materials,
    treeIndices: number[],
    modelIdentifier: string
  ) {
    if (!appearanceProvider) {
      return;
    }

    const count = treeIndices.length;
    const inFrontSet = this._inFrontTreeIndices.get(modelIdentifier)!;
    for (let i = 0; i < count; ++i) {
      const treeIndex = treeIndices[i];
      const style = appearanceProvider.styleNode(treeIndex) || {};

      // Override color
      materials.overrideColorPerTreeIndex.image.data[4 * treeIndex] = style.color ? style.color[0] : 0;
      materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 1] = style.color ? style.color[1] : 0;
      materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 2] = style.color ? style.color[2] : 0;
      materials.overrideColorPerTreeIndex.needsUpdate = true;

      if (style.renderInFront) {
        inFrontSet.add(treeIndex);
      } else if (inFrontSet.has(treeIndex)) {
        inFrontSet.delete(treeIndex);
      }

      const visible = style!.visible === undefined ? true : style.visible;
      materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 3] =
        (visible ? 1 << 0 : 0) +
        (style.renderInFront ? 1 << 1 : 0) +
        (style.outlineColor ? style.outlineColor << 2 : 0);
      materials.overrideColorPerTreeIndex.needsUpdate = true;
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
