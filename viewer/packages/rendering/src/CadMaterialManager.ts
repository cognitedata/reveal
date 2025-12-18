/*!
 * Copyright 2021 Cognite AS
 */

import { Materials, initializeDefinesAndUniforms, forEachMaterial } from './rendering/materials';
import { RenderMode } from './rendering/RenderMode';

import { NodeAppearance, NodeAppearanceProvider, NodeTransformProvider } from '@reveal/cad-styling';
import { IndexSet, EventTrigger, assertNever } from '@reveal/utilities';

import throttle from 'lodash/throttle';
import { type Plane, type RawShaderMaterial, SRGBColorSpace, Texture, Vector4, Vector2 } from 'three';
import { createMaterialsDataWrapper, type MaterialsDataWrapper } from './createMaterialsWrapper';

type MaterialsWrapper = MaterialsDataWrapper & {
  updateMaterialsCallback: () => void;
  updateTransformsCallback: () => void;
};

export class CadMaterialManager {
  private readonly _events = {
    materialsChanged: new EventTrigger<() => void>()
  };

  get clippingPlanes(): Plane[] {
    return this._clippingPlanes;
  }

  set clippingPlanes(clippingPlanes: Plane[]) {
    this._clippingPlanes = clippingPlanes;
    for (const modelIdentifier of this.materialsMap.keys()) {
      this.updateClippingPlanesForModel(modelIdentifier);
    }
    this.triggerMaterialsChanged();
  }

  private _renderMode: RenderMode = RenderMode.Color;
  private readonly materialsMap: Map<symbol, MaterialsWrapper> = new Map();
  // TODO: j-bjorne 29-04-2020: Move into separate cliping manager?
  private _clippingPlanes: Plane[] = [];

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

  addModelMaterials(modelIdentifier: symbol, maxTreeIndex: number): void {
    const materialsWrapper = createMaterialsDataWrapper(maxTreeIndex, this._renderMode, this._clippingPlanes);

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

    materialsWrapper.nodeAppearanceProvider.on('changed', updateMaterialsCallback);
    materialsWrapper.nodeTransformProvider.on('changed', updateTransformsCallback);

    this.materialsMap.set(modelIdentifier, {
      ...materialsWrapper,
      updateMaterialsCallback,
      updateTransformsCallback
    });

    this.updateClippingPlanesForModel(modelIdentifier);
  }

  removeModelMaterials(modelIdentifier: symbol): void {
    const modelData = this.materialsMap.get(modelIdentifier);

    if (modelData === undefined) {
      throw new Error(`Model identifier: ${String(modelIdentifier)} not found`);
    }

    forEachMaterial(modelData.materials, mat => mat.dispose());

    this.materialsMap.delete(modelIdentifier);
    modelData.nodeTransformTextureBuilder.dispose();
    modelData.nodeAppearanceTextureBuilder.dispose();
  }

  addTexturedMeshMaterial(modelIdentifier: symbol, sectorId: number, texture: Texture): RawShaderMaterial {
    const modelData = this.materialsMap.get(modelIdentifier);

    if (modelData === undefined) {
      throw new Error(`Model identifier: ${String(modelIdentifier)} not found`);
    }

    // Refer https://threejs.org/docs/#examples/en/loaders/GLTFLoader under Textures for details on GLTF model texture color information.
    texture.colorSpace = SRGBColorSpace;
    texture.flipY = false;

    const newMaterial = modelData.materials.triangleMesh.clone();
    newMaterial.uniforms.tDiffuse = { value: texture };
    newMaterial.defines.IS_TEXTURED = true;

    initializeDefinesAndUniforms(
      newMaterial,
      modelData.nodeAppearanceTextureBuilder.overrideColorPerTreeIndexTexture,
      modelData.nodeTransformTextureBuilder.overrideTransformIndexTexture,
      modelData.nodeTransformTextureBuilder.transformLookupTexture,
      modelData.matCapTexture,
      this._renderMode
    );

    newMaterial.needsUpdate = true;

    const materialName = toTextureMaterialName(sectorId);

    if (modelData.materials.texturedMaterials[materialName] !== undefined) {
      modelData.materials.texturedMaterials[materialName].dispose();
    }

    modelData.materials.texturedMaterials[materialName] = newMaterial;

    return newMaterial;
  }

  getModelMaterials(modelIdentifier: symbol): Materials {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.materials;
  }

  getModelNodeAppearanceProvider(modelIdentifier: symbol): NodeAppearanceProvider {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeAppearanceProvider;
  }

  getModelNodeTransformProvider(modelIdentifier: symbol): NodeTransformProvider {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeTransformProvider;
  }

  getModelDefaultNodeAppearance(modelIdentifier: symbol): NodeAppearance {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeAppearanceTextureBuilder.getDefaultAppearance();
  }

  getModelClippingPlanes(modelIdentifier: symbol): Plane[] {
    const materialWrapper = this.materialsMap.get(modelIdentifier);
    if (materialWrapper === undefined) {
      throw new Error(
        `Materials for model ${String(modelIdentifier)} has not been added, call ${this.addModelMaterials.name} first`
      );
    }

    return materialWrapper.perModelClippingPlanes;
  }

  setModelClippingPlanes(modelIdentifier: symbol, clippingPlanes: Plane[]): void {
    const materialWrapper = this.materialsMap.get(modelIdentifier);
    if (materialWrapper === undefined) {
      throw new Error(
        `Materials for model ${String(modelIdentifier)} has not been added, call ${this.addModelMaterials.name} first`
      );
    }

    materialWrapper.perModelClippingPlanes = clippingPlanes;
    this.updateClippingPlanesForModel(modelIdentifier);
    this.triggerMaterialsChanged();
  }

  setModelDefaultNodeAppearance(modelIdentifier: symbol, defaultAppearance: NodeAppearance): void {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    wrapper.nodeAppearanceTextureBuilder.setDefaultAppearance(defaultAppearance);
    this.updateMaterials(modelIdentifier);
  }

  getModelBackTreeIndices(modelIdentifier: symbol): IndexSet {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeAppearanceTextureBuilder.regularNodeTreeIndices;
  }

  getModelInFrontTreeIndices(modelIdentifier: symbol): IndexSet {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeAppearanceTextureBuilder.infrontNodeTreeIndices;
  }

  getModelGhostedTreeIndices(modelIdentifier: symbol): IndexSet {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    return wrapper.nodeAppearanceTextureBuilder.ghostedNodeTreeIndices;
  }

  getModelVisibleTreeIndices(modelIdentifier: symbol): IndexSet {
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

  private updateClippingPlanesForModel(modelIdentifier: symbol) {
    const materialWrapper = this.materialsMap.get(modelIdentifier);
    if (materialWrapper === undefined) {
      throw new Error(
        `Materials for model ${String(modelIdentifier)} has not been added, call ${this.addModelMaterials.name} first`
      );
    }

    const clippingPlanes = [...materialWrapper.perModelClippingPlanes, ...this.clippingPlanes];
    const clippingPlanesAsUniform = clippingPlanes.map(
      p => new Vector4(p.normal.x, p.normal.y, p.normal.z, -p.constant)
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

  private updateMaterials(modelIdentifier: symbol) {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    if (wrapper.nodeAppearanceTextureBuilder.needsUpdate) {
      const { nodeAppearanceTextureBuilder } = wrapper;
      nodeAppearanceTextureBuilder.build();
    }
    this.triggerMaterialsChanged();
  }

  private updateTransforms(modelIdentifier: symbol) {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    if (wrapper.nodeTransformTextureBuilder.needsUpdate) {
      const { nodeTransformTextureBuilder, materials } = wrapper;
      nodeTransformTextureBuilder.build();

      const transformsLookupTexture = nodeTransformTextureBuilder.transformLookupTexture;
      const transformsLookupTextureSize = new Vector2(
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

  private getModelMaterialsWrapper(modelIdentifier: symbol): MaterialsWrapper {
    const wrapper = this.materialsMap.get(modelIdentifier);
    if (wrapper === undefined) {
      const errorOptions: ErrorOptions = { cause: 'InvalidModel' };
      throw new Error(
        `Model ${String(modelIdentifier)} has not been added to or no longer exists in CadMaterialManager`,
        errorOptions
      );
    }
    return wrapper;
  }

  private applyToAllMaterials(callback: (material: RawShaderMaterial) => void) {
    for (const materialWrapper of this.materialsMap.values()) {
      const materials = materialWrapper.materials;
      forEachMaterial(materials, callback);
    }
  }

  private triggerMaterialsChanged() {
    this._events.materialsChanged.fire();
  }
}

function toTextureMaterialName(sectorId: number) {
  return `texturedMaterial_${sectorId}`;
}
