/*!
 * Copyright 2021 Cognite AS
 */

import type { Plane, RawShaderMaterial } from 'three';
import { SRGBColorSpace, Texture, Vector2, Vector4 } from 'three';

import type { CadMaterials } from './rendering/cadMaterialFactory';
import { createCadMaterialsForBackend } from './rendering/cadMaterialFactory';
import type { MaterialBackend } from './rendering/materialBackend';
import {
  initializeCadMaterialUniforms,
  isNodeMaterial,
  setCadMaterialsClipping,
  setCadMaterialsRenderMode,
  updateCadMaterialsTransformTextures,
  forEachCadMaterial
} from './rendering/cadMaterialUtils';
import { forEachMaterial, initializeDefinesAndUniforms, type Materials } from './rendering/materials';
import { RenderMode } from './rendering/RenderMode';

import type { NodeAppearance } from '@reveal/cad-styling';
import {
  ClippingPlanesProvider,
  NodeAppearanceProvider,
  NodeAppearanceTextureBuilder,
  NodeTransformProvider,
  NodeTransformTextureBuilder
} from '@reveal/cad-styling';
import type { IndexSet } from '@reveal/utilities';

import { createMatCapTexture } from './rendering/matCapTextureData';

import { assert } from '@reveal/utilities/assert';

export type CadMaterial = {
  materials: CadMaterials;
  nodeAppearanceProvider: NodeAppearanceProvider;
  nodeTransformProvider: NodeTransformProvider;
  nodeAppearanceTextureBuilder: NodeAppearanceTextureBuilder;
  nodeTransformTextureBuilder: NodeTransformTextureBuilder;
  matCapTexture: Texture;
  clippingPlanesProvider: ClippingPlanesProvider;
};

type MaterialsWrapper = CadMaterial & {
  updateTransformsCallback: () => void;
};

export class CadMaterialManager {
  get clippingPlanes(): Plane[] {
    return this._clippingPlanes;
  }

  set clippingPlanes(clippingPlanes: Plane[]) {
    this._clippingPlanes = clippingPlanes;
    for (const modelIdentifier of this.materialsMap.keys()) {
      this.updateClippingPlanesForModel(modelIdentifier);
    }
    this._needsRedraw = true;
  }

  get needsRedraw(): boolean {
    return this._needsRedraw;
  }

  private _renderMode: RenderMode = RenderMode.Color;
  private readonly materialsMap: Map<symbol, MaterialsWrapper> = new Map();
  // TODO: j-bjorne 29-04-2020: Move into separate cliping manager?
  private _clippingPlanes: Plane[] = [];
  private _needsRedraw: boolean = false;

  addModelMaterials(modelIdentifier: symbol, cadMaterial: CadMaterial): void {
    const {
      materials,
      matCapTexture,
      nodeAppearanceProvider,
      nodeAppearanceTextureBuilder,
      nodeTransformProvider,
      nodeTransformTextureBuilder,
      clippingPlanesProvider
    } = cadMaterial;

    const updateTransformsCallback = () => this.updateTransforms(modelIdentifier);

    nodeTransformProvider.on('changed', updateTransformsCallback);

    this.materialsMap.set(modelIdentifier, {
      materials,
      nodeAppearanceProvider,
      nodeTransformProvider,
      nodeAppearanceTextureBuilder,
      nodeTransformTextureBuilder,
      updateTransformsCallback,
      matCapTexture,
      clippingPlanesProvider
    });

    clippingPlanesProvider.on('changed', () => {
      this.updateClippingPlanesForModel(modelIdentifier);
      this._needsRedraw = true;
    });

    const colorWrite = this._renderMode !== RenderMode.DepthBufferOnly;
    setCadMaterialsRenderMode(materials, this._renderMode);
    forEachCadMaterial(materials, material => {
      material.colorWrite = colorWrite;
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

    this.initializeDefinesAndUniforms(modelIdentifier, newMaterial);

    newMaterial.needsUpdate = true;

    const materialName = toTextureMaterialName(sectorId);

    if (modelData.materials.texturedMaterials[materialName] !== undefined) {
      modelData.materials.texturedMaterials[materialName].dispose();
    }

    modelData.materials.texturedMaterials[materialName] = newMaterial;

    return newMaterial;
  }

  getModelMaterials(modelIdentifier: symbol): CadMaterials {
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

    return materialWrapper.clippingPlanesProvider.getClippingPlanes();
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
    for (const materialWrapper of this.materialsMap.values()) {
      setCadMaterialsRenderMode(materialWrapper.materials, mode);
    }
  }

  getRenderMode(): RenderMode {
    return this._renderMode;
  }

  resetRedraw(): void {
    this._needsRedraw = false;
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

    const clippingPlanes = [...materialWrapper.clippingPlanesProvider.getClippingPlanes(), ...this.clippingPlanes];
    setCadMaterialsClipping(materialWrapper.materials, clippingPlanes);
  }

  private updateMaterials(modelIdentifier: symbol) {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    if (wrapper.nodeAppearanceTextureBuilder.needsUpdate) {
      const { nodeAppearanceTextureBuilder } = wrapper;
      nodeAppearanceTextureBuilder.build();
    }
    this._needsRedraw = true;
  }

  private updateTransforms(modelIdentifier: symbol) {
    const wrapper = this.getModelMaterialsWrapper(modelIdentifier);
    if (wrapper.nodeTransformTextureBuilder.needsUpdate) {
      const { nodeTransformTextureBuilder, materials } = wrapper;
      nodeTransformTextureBuilder.build();

      updateCadMaterialsTransformTextures(
        materials,
        nodeTransformTextureBuilder.transformLookupTexture,
        nodeTransformTextureBuilder.overrideTransformIndexTexture,
        wrapper.nodeAppearanceTextureBuilder.overrideColorPerTreeIndexTexture
      );
    }
    this._needsRedraw = true;
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
      forEachCadMaterial(materialWrapper.materials, material => {
        if (!isNodeMaterial(material)) {
          callback(material as RawShaderMaterial);
        }
      });
    }
  }

  private initializeDefinesAndUniforms(modelIdentifier: symbol, material: RawShaderMaterial) {
    const materialData = this.materialsMap.get(modelIdentifier);

    assert(materialData !== undefined);

    initializeCadMaterialUniforms(
      materialData.materials,
      materialData.nodeAppearanceTextureBuilder.overrideColorPerTreeIndexTexture,
      materialData.nodeTransformTextureBuilder.overrideTransformIndexTexture,
      materialData.nodeTransformTextureBuilder.transformLookupTexture,
      materialData.matCapTexture,
      this._renderMode,
      material
    );
  }
}

function toTextureMaterialName(sectorId: number) {
  return `texturedMaterial_${sectorId}`;
}

export function createCadMaterial(maxTreeIndex: number, backend: MaterialBackend = 'webgpu'): CadMaterial {
  const nodeAppearanceProvider = new NodeAppearanceProvider();
  const nodeAppearanceTextureBuilder = new NodeAppearanceTextureBuilder(maxTreeIndex + 1, nodeAppearanceProvider);
  nodeAppearanceTextureBuilder.build();

  const nodeTransformProvider = new NodeTransformProvider();
  const nodeTransformTextureBuilder = new NodeTransformTextureBuilder(maxTreeIndex + 1, nodeTransformProvider);
  nodeTransformTextureBuilder.build();

  const matCapTexture = createMatCapTexture();

  const clippingPlanesProvider = new ClippingPlanesProvider();

  const materials = createCadMaterialsForBackend(
    backend,
    nodeAppearanceTextureBuilder.overrideColorPerTreeIndexTexture,
    nodeTransformTextureBuilder.overrideTransformIndexTexture,
    nodeTransformTextureBuilder.transformLookupTexture,
    matCapTexture
  );

  return {
    materials,
    nodeAppearanceProvider,
    nodeTransformProvider,
    nodeAppearanceTextureBuilder,
    nodeTransformTextureBuilder,
    matCapTexture,
    clippingPlanesProvider
  };
}
