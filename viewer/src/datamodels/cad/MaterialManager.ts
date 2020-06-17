/*!
 * Copyright 2020 Cognite AS
 */

import { createMaterials, Materials } from './rendering/materials';
import { RenderMode } from './rendering/RenderMode';
import { GlobalNodeAppearance } from './GlobalNodeAppearance';
import { NodeAppearanceProvider } from './NodeAppearance';

// function updateColors(getColor: ModelColorDelegate, materials: Materials, treeIndices: number[]) {
//   for (const treeIndex of treeIndices) {
//     const color = getColor(treeIndex) || [0, 0, 0, 0];
//     materials.overrideColorPerTreeIndex.image.data[4 * treeIndex] = color[0];
//     materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 1] = color[1];
//     materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 2] = color[2];
//     materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 3] = color[3];
//   }
// }

// function updateGlobalColors(
//   modelIdentifier: string,
//   getColor: GlobalColorDelegate,
//   materials: Materials,
//   treeIndices: number[]
// ) {
//   for (const treeIndex of treeIndices) {
//     const color = getColor(modelIdentifier, treeIndex) || [0, 0, 0, 0];
//     materials.overrideColorPerTreeIndex.image.data[4 * treeIndex] = color[0];
//     materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 1] = color[1];
//     materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 2] = color[2];
//     materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 3] = color[3];
//   }
// }

// function updateVisibility(visible: ModelVisibilityDelegate, materials: Materials, treeIndices: number[]) {
//   for (const treeIndex of treeIndices) {
//     materials.overrideVisibilityPerTreeIndex.image.data[4 * treeIndex] = visible(treeIndex) ? 255 : 0;
//   }
// }

// function updateGlobalVisibility(
//   modelIdentifier: string,
//   visible: GlobalVisibilityDelegate,
//   materials: Materials,
//   treeIndices: number[]
// ) {
//   for (const treeIndex of treeIndices) {
//     materials.overrideVisibilityPerTreeIndex.image.data[4 * treeIndex] = visible(modelIdentifier, treeIndex) ? 255 : 0;
//   }
// }

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

  setNodeAppearanceProvider(modelIdentifier: string, nodeAppearanceProvider?: NodeAppearanceProvider) {
    const wrapper = this.materialsMap.get(modelIdentifier)!;
    const newWrapper: MaterialsWrapper = { ...wrapper, nodeAppearanceProvider };
    console.log(newWrapper);
    this.materialsMap.set(modelIdentifier, newWrapper);
  }

  getModelMaterials(modelIdentifier: string): Materials {
    return this.materialsMap.get(modelIdentifier)!.materials;
  }

  updateGlobalAppearance(nodeAppearance: GlobalNodeAppearance) {
    this._globalAppearance = nodeAppearance;
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
    if (!appearanceProvider && !this._globalAppearance) {
      return;
    }
    if (treeIndices.length === 0) {
      return;
    }

    this.updateNodeAppearance(appearanceProvider, materials, treeIndices);
    // this.updateRenderEffectBuffers(appearanceProvider, materials, treeIndices);
    // this.updateGlobalNodeAppearance(modelIdentifier, materials, treeIndices);
  }

  // private updateRenderEffectBuffers(
  //   appearanceProvider: NodeApperanceProvider | undefined,
  //   materials: Materials,
  //   treeIndices: number[]
  // ) {
  //   if (!renderAppearance || renderAppearance.renderInFront === undefined) {
  //     return;
  //   }

  //   for (const treeIndex of treeIndices) {
  //     materials.overrideVisibilityPerTreeIndex.image.data[4 * treeIndex + 1] = renderAppearance.renderInFront(treeIndex)
  //       ? 255
  //       : 0;
  //   }
  //   materials.overrideVisibilityPerTreeIndex.needsUpdate = true;
  // }

  // private updateGlobalNodeAppearance(modelIdentifier: string, materials: Materials, treeIndices: number[]) {
  //   if (this._globalAppearance && this._globalAppearance.color !== undefined) {
  //     updateGlobalColors(modelIdentifier, this._globalAppearance.color, materials, treeIndices);
  //     materials.overrideColorPerTreeIndex.needsUpdate = true;
  //   }
  //   if (this._globalAppearance && this._globalAppearance.visible !== undefined) {
  //     updateGlobalVisibility(modelIdentifier, this._globalAppearance.visible, materials, treeIndices);
  //     materials.overrideVisibilityPerTreeIndex.needsUpdate = true;
  //   }
  // }

  private updateNodeAppearance(
    appearanceProvider: NodeAppearanceProvider | undefined,
    materials: Materials,
    treeIndices: number[]
  ) {
    if (!appearanceProvider) {
      return;
    }
    console.log(appearanceProvider);

    const count = treeIndices.length;
    for (let i = 0; i < count; ++i) {
      const treeIndex = treeIndices[i];
      const style = appearanceProvider.styleNode(treeIndex);

      // Override color
      if (style && style.color !== undefined) {
        materials.overrideColorPerTreeIndex.image.data[4 * treeIndex] = style.color[0];
        materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 1] = style.color[1];
        materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 2] = style.color[2];
        materials.overrideColorPerTreeIndex.image.data[4 * treeIndex + 3] = style.color[3];
        materials.overrideColorPerTreeIndex.needsUpdate = true;
      }

      // Hide node?
      if (style && style.visible !== undefined) {
        materials.overrideVisibilityPerTreeIndex.image.data[4 * treeIndex] = style.visible ? 255 : 0;
        materials.overrideVisibilityPerTreeIndex.needsUpdate = true;
      }

      // Render in front of everything (i.e. skip depth testing)?
      if (style && style.renderInFront !== undefined) {
        console.log(treeIndex);
        materials.overrideVisibilityPerTreeIndex.image.data[4 * treeIndex + 1] = style.renderInFront ? 255 : 0;
        materials.overrideVisibilityPerTreeIndex.needsUpdate = true;
      }

      if (style && style.outline !== undefined) {
        throw new Error('Outline is not supported yet');
      }
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
