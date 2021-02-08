/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { createMaterials, Materials } from './rendering/materials';
import { RenderMode } from './rendering/RenderMode';
import { IndexSet } from '../../utilities/IndexSet';

import { NodeStyleProvider } from './styling/NodeStyleProvider';
import { NodeStyleTextureBuilder } from './styling/NodeStyleTextureBuilder';

interface MaterialsWrapper {
  materials: Materials;
  nodeAppearanceProvider: NodeStyleProvider;
  textureBuilder: NodeStyleTextureBuilder;
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
    const nodeAppearanceProvider = new NodeStyleProvider();
    const textureBuilder = new NodeStyleTextureBuilder(maxTreeIndex + 1, nodeAppearanceProvider);
    textureBuilder.build();

    nodeAppearanceProvider.on('changed', () => {
      this.updateMaterials(modelIdentifier);
    });

    const materials = createMaterials(
      this._renderMode,
      this._clippingPlanes,
      textureBuilder.overrideColorPerTreeIndexTexture,
      textureBuilder.overrideTransformPerTreeIndexTexture,
      textureBuilder.transformsLookupTexture
    );
    this.materialsMap.set(modelIdentifier, { materials, nodeAppearanceProvider, textureBuilder });
  }

  getModelMaterials(modelIdentifier: string): Materials {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.materials;
  }

  getModelNodeAppearanceProvider(modelIdentifier: string): NodeStyleProvider {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeAppearanceProvider;
  }

  getModelBackTreeIndices(modelIdentifier: string): IndexSet {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.textureBuilder.regularNodeTreeIndices;
  }

  getModelInFrontTreeIndices(modelIdentifier: string): IndexSet {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.textureBuilder.infrontNodeTreeIndices;
  }

  getModelGhostedTreeIndices(modelIdentifier: string): IndexSet {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.textureBuilder.ghostedNodeTreeIndices;
  }

  setRenderMode(mode: RenderMode) {
    this._renderMode = mode;
    const transparent = mode === RenderMode.Ghost;
    this.applyToAllMaterials(material => {
      material.uniforms.renderMode.value = mode;
      material.transparent = transparent;
      material.side = THREE.DoubleSide;
    });
  }

  getRenderMode(): RenderMode {
    return this._renderMode;
  }

  updateMaterials(modelIdentifier: string) {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    if (wrapper.textureBuilder.needsUpdate) {
      const start = performance.now();
      const { textureBuilder, materials } = wrapper;
      textureBuilder.build();

      const transformsLookupTexture = textureBuilder.transformsLookupTexture;
      const transformsLookupTextureSize = new THREE.Vector2(
        transformsLookupTexture.image.width,
        transformsLookupTexture.image.height
      );
      applyToModelMaterials(materials, material => {
        material.uniforms.transformOverrideTexture.value = transformsLookupTexture;
        material.uniforms.transformOverrideTextureSize.value = transformsLookupTextureSize;
      });
      console.log('Updating materials for ', modelIdentifier, 'took', performance.now() - start, 'ms');
    }
  }

  private getModelMaterialsWrapper(modelIdentifier: string): MaterialsWrapper {
    const wrapper = this.materialsMap.get(modelIdentifier);
    if (wrapper === undefined) {
      throw new Error(`Model ${modelIdentifier} has not been added to MaterialManager`);
    }
    return wrapper;
  }

  private applyToAllMaterials(callback: (material: THREE.ShaderMaterial) => void) {
    for (const materialWrapper of this.materialsMap.values()) {
      const materials = materialWrapper.materials;
      applyToModelMaterials(materials, callback);
    }
  }
}

function applyToModelMaterials(materials: Materials, callback: (material: THREE.ShaderMaterial) => void) {
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
