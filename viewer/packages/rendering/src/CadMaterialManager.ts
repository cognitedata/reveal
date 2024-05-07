/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { NodeAppearanceTextureBuilder } from './rendering/NodeAppearanceTextureBuilder';
import { NodeTransformTextureBuilder } from './transform/NodeTransformTextureBuilder';
import { NodeTransformProvider } from './transform/NodeTransformProvider';
import { createMaterials, Materials, initializeDefinesAndUniforms, forEachMaterial } from './rendering/materials';
import { RenderMode } from './rendering/RenderMode';

import { NodeAppearance, NodeAppearanceProvider } from '@reveal/cad-styling';
import { IndexSet, EventTrigger, assertNever } from '@reveal/utilities';

import matCapTextureImage from './rendering/matCapTextureData';

import throttle from 'lodash/throttle';
import assert from 'assert';

interface MaterialsWrapper {
  materials: Materials;
  matCapTexture: THREE.Texture;
  perModelClippingPlanes: THREE.Plane[];
  nodeAppearanceProvider: NodeAppearanceProvider;
  nodeTransformProvider: NodeTransformProvider;
  nodeAppearanceTextureBuilder: NodeAppearanceTextureBuilder;
  nodeTransformTextureBuilder: NodeTransformTextureBuilder;
  updateMaterialsCallback: () => void;
  updateTransformsCallback: () => void;
}

export class CadMaterialManager {
  private readonly _events = {
    materialsChanged: new EventTrigger<() => void>()
  };

  get clippingPlanes(): THREE.Plane[] {
    return this._clippingPlanes;
  }

  set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._clippingPlanes = clippingPlanes;
    for (const modelIdentifier of this.materialsMap.keys()) {
      this.updateClippingPlanesForModel(modelIdentifier);
    }
    this.triggerMaterialsChanged();
  }

  private _renderMode: RenderMode = RenderMode.Color;
  private readonly materialsMap: Map<string, MaterialsWrapper> = new Map();
  // TODO: j-bjorne 29-04-2020: Move into separate cliping manager?
  private _clippingPlanes: THREE.Plane[] = [];

  public on(event: 'materialsChanged', listener: () => void): void {
    switch (event) {
      case 'materialsChanged':
        this._events.materialsChanged.subscribe(listener);
        break;

      default:
        assertNever(event, `Unexpected event '${event}`);
    }
  }

  public off(event: 'materialsChanged', listener: () => void): void {
    switch (event) {
      case 'materialsChanged':
        this._events.materialsChanged.unsubscribe(listener);
        break;

      default:
        assertNever(event, `Unexpected event '${event}`);
    }
  }

  addModelMaterials(modelIdentifier: string, maxTreeIndex: number): void {
    const nodeAppearanceProvider = new NodeAppearanceProvider();
    const nodeAppearanceTextureBuilder = new NodeAppearanceTextureBuilder(maxTreeIndex + 1, nodeAppearanceProvider);
    nodeAppearanceTextureBuilder.build();

    const nodeTransformProvider = new NodeTransformProvider();
    const nodeTransformTextureBuilder = new NodeTransformTextureBuilder(maxTreeIndex + 1, nodeTransformProvider);
    nodeTransformTextureBuilder.build();

    const materialUpdateThrottleDelay = 75;
    const updateMaterialsCallback: () => void = throttle(
      () => this.updateMaterials(modelIdentifier),
      materialUpdateThrottleDelay,
      {
        leading: true,
        trailing: true
      }
    );
    const updateTransformsCallback = () => this.updateTransforms(modelIdentifier);

    nodeAppearanceProvider.on('changed', updateMaterialsCallback);
    nodeTransformProvider.on('changed', updateTransformsCallback);

    const matCapTexture = new THREE.Texture(matCapTextureImage);
    matCapTexture.needsUpdate = true;

    const materials = createMaterials(
      this._renderMode,
      this._clippingPlanes,
      nodeAppearanceTextureBuilder.overrideColorPerTreeIndexTexture,
      nodeTransformTextureBuilder.overrideTransformIndexTexture,
      nodeTransformTextureBuilder.transformLookupTexture,
      matCapTexture
    );

    this.materialsMap.set(modelIdentifier, {
      materials,
      perModelClippingPlanes: [],
      nodeAppearanceProvider,
      nodeTransformProvider,
      nodeAppearanceTextureBuilder,
      nodeTransformTextureBuilder,
      updateMaterialsCallback,
      updateTransformsCallback,
      matCapTexture
    });

    this.updateClippingPlanesForModel(modelIdentifier);
  }

  removeModelMaterials(modelIdentifier: string): void {
    const modelData = this.materialsMap.get(modelIdentifier);

    if (modelData === undefined) {
      throw new Error(`Model identifier: ${modelIdentifier} not found`);
    }

    forEachMaterial(modelData.materials, mat => mat.dispose());

    this.materialsMap.delete(modelIdentifier);
    modelData.nodeTransformTextureBuilder.dispose();
    modelData.nodeAppearanceTextureBuilder.dispose();
  }

  addTexturedMeshMaterial(modelIdentifier: string, sectorId: number, texture: THREE.Texture): THREE.RawShaderMaterial {
    const modelData = this.materialsMap.get(modelIdentifier);

    if (modelData === undefined) {
      throw new Error(`Model identifier: ${modelIdentifier} not found`);
    }

    // Refer https://threejs.org/docs/#examples/en/loaders/GLTFLoader under Textures for details on GLTF model texture color information.
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;

    const newMaterial = modelData.materials.triangleMesh.clone();
    newMaterial.uniforms.tDiffuse = { value: texture };
    newMaterial.defines.IS_TEXTURED = true;

    this.initializeDefinesAndUniforms(modelIdentifier, newMaterial);

    newMaterial.needsUpdate = true;

    const materialName = toTextureMaterialName(sectorId);
    modelData.materials.texturedMaterials[materialName] = newMaterial;

    return newMaterial;
  }

  removeTexturedMeshMaterial(modelIdentifier: string, sectorId: number): void {
    const modelData = this.materialsMap.get(modelIdentifier);
    if (modelData === undefined) {
      return;
    }

    const materialName = toTextureMaterialName(sectorId);

    if (!(materialName in modelData.materials.texturedMaterials)) {
      return;
    }

    modelData.materials.texturedMaterials[materialName].uniforms.tDiffuse.value.dispose();
    modelData.materials.texturedMaterials[materialName].dispose();
    delete modelData.materials.texturedMaterials[toTextureMaterialName(sectorId)];
  }

  getModelMaterials(modelIdentifier: string): Materials {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.materials;
  }

  getModelNodeAppearanceProvider(modelIdentifier: string): NodeAppearanceProvider {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeAppearanceProvider;
  }

  getModelNodeTransformProvider(modelIdentifier: string): NodeTransformProvider {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeTransformProvider;
  }

  getModelDefaultNodeAppearance(modelIdentifier: string): NodeAppearance {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeAppearanceTextureBuilder.getDefaultAppearance();
  }

  getModelClippingPlanes(modelIdentifier: string): THREE.Plane[] {
    const materialWrapper = this.materialsMap.get(modelIdentifier);
    if (materialWrapper === undefined) {
      throw new Error(
        `Materials for model ${modelIdentifier} has not been added, call ${this.addModelMaterials.name} first`
      );
    }

    return materialWrapper.perModelClippingPlanes;
  }

  setModelClippingPlanes(modelIdentifier: string, clippingPlanes: THREE.Plane[]): void {
    const materialWrapper = this.materialsMap.get(modelIdentifier);
    if (materialWrapper === undefined) {
      throw new Error(
        `Materials for model ${modelIdentifier} has not been added, call ${this.addModelMaterials.name} first`
      );
    }

    materialWrapper.perModelClippingPlanes = clippingPlanes;
    this.updateClippingPlanesForModel(modelIdentifier);
    this.triggerMaterialsChanged();
  }

  setModelDefaultNodeAppearance(modelIdentifier: string, defaultAppearance: NodeAppearance): void {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    wrapper.nodeAppearanceTextureBuilder.setDefaultAppearance(defaultAppearance);
    this.updateMaterials(modelIdentifier);
  }

  getModelBackTreeIndices(modelIdentifier: string): IndexSet {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeAppearanceTextureBuilder.regularNodeTreeIndices;
  }

  getModelInFrontTreeIndices(modelIdentifier: string): IndexSet {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeAppearanceTextureBuilder.infrontNodeTreeIndices;
  }

  getModelGhostedTreeIndices(modelIdentifier: string): IndexSet {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeAppearanceTextureBuilder.ghostedNodeTreeIndices;
  }

  getModelVisibleTreeIndices(modelIdentifier: string): IndexSet {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeAppearanceTextureBuilder.visibleNodeTreeIndices;
  }

  setRenderMode(mode: RenderMode): void {
    this._renderMode = mode;
    const colorWrite = mode !== RenderMode.DepthBufferOnly;
    this.applyToAllMaterials(material => {
      material.uniforms.renderMode.value = mode;
      material.colorWrite = colorWrite;
    });
  }

  getRenderMode(): RenderMode {
    return this._renderMode;
  }

  dispose(): void {
    for (const [_, wrapper] of this.materialsMap) {
      wrapper.nodeAppearanceTextureBuilder.dispose();
      wrapper.nodeTransformTextureBuilder.dispose();
      wrapper.nodeAppearanceProvider.dispose();
    }
  }

  private updateClippingPlanesForModel(modelIdentifier: string) {
    const materialWrapper = this.materialsMap.get(modelIdentifier);
    if (materialWrapper === undefined) {
      throw new Error(
        `Materials for model ${modelIdentifier} has not been added, call ${this.addModelMaterials.name} first`
      );
    }

    const clippingPlanes = [...materialWrapper.perModelClippingPlanes, ...this.clippingPlanes];
    const clippingPlanesAsUniform = clippingPlanes.map(
      p => new THREE.Vector4(p.normal.x, p.normal.y, p.normal.z, -p.constant)
    );

    forEachMaterial(materialWrapper.materials, m => {
      m.clipping = clippingPlanes.length > 0;
      m.clipIntersection = false;
      m.clippingPlanes = clippingPlanes;
      m.defines = {
        ...m.defines,
        NUM_CLIPPING_PLANES: clippingPlanesAsUniform.length,
        UNION_CLIPPING_PLANES: 0
      };
      m.needsUpdate = true;
    });
  }

  private updateMaterials(modelIdentifier: string) {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    if (wrapper.nodeAppearanceTextureBuilder.needsUpdate) {
      const { nodeAppearanceTextureBuilder } = wrapper;
      nodeAppearanceTextureBuilder.build();
    }
    this.triggerMaterialsChanged();
  }

  private updateTransforms(modelIdentifier: string) {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    if (wrapper.nodeTransformTextureBuilder.needsUpdate) {
      const { nodeTransformTextureBuilder, materials } = wrapper;
      nodeTransformTextureBuilder.build();

      const transformsLookupTexture = nodeTransformTextureBuilder.transformLookupTexture;
      const transformsLookupTextureSize = new THREE.Vector2(
        transformsLookupTexture.image.width,
        transformsLookupTexture.image.height
      );
      forEachMaterial(materials, material => {
        material.uniforms.transformOverrideTexture.value = transformsLookupTexture;
        material.uniforms.transformOverrideTextureSize.value = transformsLookupTextureSize;
      });
    }
    this.triggerMaterialsChanged();
  }

  private getModelMaterialsWrapper(modelIdentifier: string): MaterialsWrapper {
    const wrapper = this.materialsMap.get(modelIdentifier);
    if (wrapper === undefined) {
      const errorOptions: ErrorOptions = { cause: 'InvalidModel' };
      throw new Error(
        `Model ${modelIdentifier} has not been added to or no longer exists in CadMaterialManager`,
        errorOptions
      );
    }
    return wrapper;
  }

  private applyToAllMaterials(callback: (material: THREE.RawShaderMaterial) => void) {
    for (const materialWrapper of this.materialsMap.values()) {
      const materials = materialWrapper.materials;
      forEachMaterial(materials, callback);
    }
  }

  private triggerMaterialsChanged() {
    this._events.materialsChanged.fire();
  }

  private initializeDefinesAndUniforms(modelIdentifier: string, material: THREE.RawShaderMaterial) {
    const materialData = this.materialsMap.get(modelIdentifier);

    assert(materialData !== undefined);

    initializeDefinesAndUniforms(
      material,
      materialData.nodeAppearanceTextureBuilder.overrideColorPerTreeIndexTexture,
      materialData.nodeTransformTextureBuilder.overrideTransformIndexTexture,
      materialData.nodeTransformTextureBuilder.transformLookupTexture,
      materialData.matCapTexture,
      this._renderMode
    );
  }
}

function toTextureMaterialName(sectorId: number) {
  return `texturedMaterial_${sectorId}`;
}
