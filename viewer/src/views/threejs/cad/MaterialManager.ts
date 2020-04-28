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
  private _clippingPlanes: THREE.Plane[] = [];
  private _clipIntersection: boolean = false;

  constructor(treeIndexCount: number, options?: NodeAppearance) {
    this.materials = createMaterials(treeIndexCount);
    this._options = options;
    this.setRenderMode(RenderMode.Color);
  }

  get clippingPlanes(): THREE.Plane[] {
    return this._clippingPlanes;
  }

  set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._clippingPlanes = clippingPlanes;
    this.applyToAllMaterials(material => {
      material.clippingPlanes = clippingPlanes;
      console.log('Setting', material, clippingPlanes);
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
    this.applyToAllMaterials(material => {
      material.uniforms.renderMode.value = mode;
    });
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

  private applyToAllMaterials(callback: (material: THREE.ShaderMaterial) => void) {
    callback(this.materials.box);
    callback(this.materials.circle);
    callback(this.materials.generalRing);
    callback(this.materials.nut);
    callback(this.materials.quad);
    callback(this.materials.cone);
    callback(this.materials.eccentricCone);
    callback(this.materials.sphericalSegment);
    callback(this.materials.torusSegment);
    callback(this.materials.generalCylinder);
    callback(this.materials.trapezium);
    callback(this.materials.ellipsoidSegment);
    callback(this.materials.instancedMesh);
    callback(this.materials.triangleMesh);
    callback(this.materials.simple);
  }
}
