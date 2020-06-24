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

  addModelMaterials(modelIdentifier: string, maxTreeIndex: number) {
    const materials = createMaterials(maxTreeIndex + 1, this._renderMode, this._clippingPlanes);
    this.materialsMap.set(modelIdentifier, { materials });
  }

  setNodeAppearanceProvider(modelIdentifier: string, nodeAppearanceProvider?: NodeAppearanceProvider) {
    const wrapper = this.materialsMap.get(modelIdentifier)!;
    const newWrapper: MaterialsWrapper = { ...wrapper, nodeAppearanceProvider };
    this.materialsMap.set(modelIdentifier, newWrapper);
  }

  getModelMaterials(modelIdentifier: string): Materials {
    return this.materialsMap.get(modelIdentifier)!.materials;
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

    this.updateNodeAppearance(appearanceProvider, materials, treeIndices);
  }

  private updateNodeAppearance(
    appearanceProvider: NodeAppearanceProvider | undefined,
    materials: Materials,
    treeIndices: number[]
  ) {
    if (!appearanceProvider || treeIndices.length === 0) {
      return;
    }

    const colorData = materials.overrideColorPerTreeIndex.image.data;
    const visibilityData = materials.overrideVisibilityPerTreeIndex.image.data;

    const count = treeIndices.length;
    for (let i = 0; i < count; ++i) {
      const treeIndex = treeIndices[i];

      // Reset to original style (matches defaults from materials.ts)
      colorData[4 * treeIndex + 0] = 0;
      colorData[4 * treeIndex + 1] = 0;
      colorData[4 * treeIndex + 2] = 0;
      colorData[4 * treeIndex + 3] = 0;
      visibilityData[4 * treeIndex + 0] = 255;
      visibilityData[4 * treeIndex + 1] = 0;
      visibilityData[4 * treeIndex + 2] = 0;
      visibilityData[4 * treeIndex + 3] = 0;

      // Apply overrides
      const style = appearanceProvider.styleNode(treeIndex);

      // Override color
      if (style && style.color !== undefined) {
        colorData[4 * treeIndex] = style.color[0];
        colorData[4 * treeIndex + 1] = style.color[1];
        colorData[4 * treeIndex + 2] = style.color[2];
        colorData[4 * treeIndex + 3] = style.color[3];
      } else {
      }

      // Hide node?
      if (style && style.visible !== undefined) {
        visibilityData[4 * treeIndex] = style.visible ? 255 : 0;
      }

      // Render in front of everything?
      if (style && style.renderInFront !== undefined) {
        visibilityData[4 * treeIndex + 1] = style.renderInFront ? 255 : 0;
      }

      if (style && style.outline !== undefined) {
        throw new Error('Outline is not supported yet');
      }
    }

    // Make sure new textures are uploaded to the GPU
    materials.overrideColorPerTreeIndex.needsUpdate = true;
    materials.overrideVisibilityPerTreeIndex.needsUpdate = true;
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
