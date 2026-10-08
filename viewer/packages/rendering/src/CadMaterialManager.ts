/*!
 * Copyright 2021 Cognite AS
 */

import type { Plane, RawShaderMaterial, Vector3 } from 'three';
import { SRGBColorSpace, Texture, Vector2, Vector4 } from 'three';

import type { Materials } from './rendering/materials';
import { createMaterials, initializeDefinesAndUniforms, forEachMaterial } from './rendering/materials';
import type { RealisticShadows, RealisticTextures } from './rendering/materials';
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

import { getMatCapTextureData } from './rendering/matCapTextureData';

import { assert } from '@reveal/utilities/assert';

export type CadMaterial = {
  materials: Materials;
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
  private _rotationInvariantLighting = false;
  private _realisticShading = false;
  private _realisticTextures: RealisticTextures | undefined;
  private _realisticShadows: RealisticShadows | undefined;
  private _realisticSky: Texture | undefined;
  private _realisticSplashZone = false;
  private _realisticWeather = { overcast: 0, time: 0 };
  private _realisticSun: { direction: Vector3; color: Vector3 } | undefined;
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
    forEachMaterial(materials, material => {
      material.uniforms.renderMode.value = this._renderMode;
      material.uniforms.rotationInvariantLighting.value = this._rotationInvariantLighting;
      material.uniforms.realisticShading.value = this._realisticShading;
      applyRealisticTextures(material, this._realisticTextures);
      applyRealisticShadows(material, this._realisticShadows);
      material.uniforms.realisticSkyEnabled.value = this._realisticSky !== undefined;
      material.uniforms.realisticSkyTexture.value = this._realisticSky ?? null;
      material.uniforms.realisticSplashZone.value = this._realisticSplashZone;
      material.uniforms.realisticOvercast.value = this._realisticWeather.overcast;
      material.uniforms.realisticTime.value = this._realisticWeather.time;
      if (this._realisticSun) {
        material.uniforms.realisticSunDirection.value.copy(this._realisticSun.direction);
        material.uniforms.realisticSunColor.value.copy(this._realisticSun.color);
      }
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
    const colorWrite = mode !== RenderMode.DepthBufferOnly;
    this.applyToAllMaterials(material => {
      material.uniforms.renderMode.value = mode;
      material.colorWrite = colorWrite;
    });
  }

  getRenderMode(): RenderMode {
    return this._renderMode;
  }

  /**
   * Orients CAD lighting by the direction from each surface to the eye instead of the camera's forward axis, so
   * shading doesn't change when the camera rotates in place. Used in WebXR, where the camera follows the head.
   * @param enabled Whether to use rotation invariant lighting.
   */
  setRotationInvariantLighting(enabled: boolean): void {
    this._rotationInvariantLighting = enabled;
    this.applyToAllMaterials(material => {
      material.uniforms.rotationInvariantLighting.value = enabled;
    });
    this._needsRedraw = true;
  }

  get rotationInvariantLighting(): boolean {
    return this._rotationInvariantLighting;
  }

  /**
   * PROTOTYPE: physically based lighting with procedural industrial surface detail instead of the CAD matcap look.
   * @param enabled Whether to use realistic shading.
   */
  setRealisticShading(enabled: boolean): void {
    this._realisticShading = enabled;
    this.applyToAllMaterials(material => {
      material.uniforms.realisticShading.value = enabled;
    });
    this._needsRedraw = true;
  }

  get realisticShading(): boolean {
    return this._realisticShading;
  }

  /**
   * PROTOTYPE: sky texture (equirectangular upper hemisphere) for realistic reflections and ambient light.
   * @param sky The sky texture, or undefined for the analytic sky.
   */
  setRealisticSky(sky: Texture | undefined): void {
    this._realisticSky = sky;
    this.applyToAllMaterials(material => {
      material.uniforms.realisticSkyEnabled.value = sky !== undefined;
      material.uniforms.realisticSkyTexture.value = sky ?? null;
    });
    this._needsRedraw = true;
  }

  /**
   * PROTOTYPE: wet steel and marine growth just above sea level (CDF z = 0), for offshore models shown with an ocean.
   */
  setRealisticSplashZone(enabled: boolean): void {
    this._realisticSplashZone = enabled;
    this.applyToAllMaterials(material => {
      material.uniforms.realisticSplashZone.value = enabled;
    });
    this._needsRedraw = true;
  }

  /**
   * PROTOTYPE: weather for realistic shading.
   * @param overcast 0 = sunny with a few clouds, 1 = heavy rain: dim, grey light and wet surfaces.
   * @param time Seconds, for drifting clouds and cloud shadows.
   */
  setRealisticWeather(overcast: number, time: number): void {
    if (overcast === this._realisticWeather.overcast && time === this._realisticWeather.time) return;
    this._realisticWeather = { overcast, time };
    this.applyToAllMaterials(material => {
      material.uniforms.realisticOvercast.value = overcast;
      material.uniforms.realisticTime.value = time;
    });
    this._needsRedraw = true;
  }

  /**
   * PROTOTYPE: the sun for realistic shading.
   * @param direction World space direction toward the sun.
   * @param color Sun color and intensity, before clouds dim it.
   */
  setRealisticSun(direction: Vector3, color: Vector3): void {
    this._realisticSun = { direction: direction.clone(), color: color.clone() };
    this.applyToAllMaterials(material => {
      material.uniforms.realisticSunDirection.value.copy(direction);
      material.uniforms.realisticSunColor.value.copy(color);
    });
    this._needsRedraw = true;
  }

  /**
   * PROTOTYPE: sun shadow map for realistic shading, rendered by the caller. The map must not be bound while it's being
   * rendered (a WebGL feedback loop), and once one has been set, the materials always need some depth texture: render
   * the map with a placeholder map set rather than undefined.
   * @param shadows The shadow map (a depth texture with compareFunction set), or undefined to turn shadows off.
   */
  setRealisticShadows(shadows: RealisticShadows | undefined): void {
    this._realisticShadows = shadows;
    this.applyToAllMaterials(material => applyRealisticShadows(material, shadows));
    this._needsRedraw = true;
  }

  /**
   * PROTOTYPE: detail textures for realistic shading; without them, procedural detail is used.
   * @param textures Paint, rain streak, deck plate and metal detail textures, or undefined for procedural detail.
   */
  setRealisticTextures(textures: RealisticTextures | undefined): void {
    this._realisticTextures = textures;
    this.applyToAllMaterials(material => applyRealisticTextures(material, textures));
    this._needsRedraw = true;
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
    this._needsRedraw = true;
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
      const materials = materialWrapper.materials;
      forEachMaterial(materials, callback);
    }
  }

  private initializeDefinesAndUniforms(modelIdentifier: symbol, material: RawShaderMaterial) {
    const materialData = this.materialsMap.get(modelIdentifier);

    assert(materialData !== undefined);

    initializeDefinesAndUniforms(
      material,
      materialData.nodeAppearanceTextureBuilder.overrideColorPerTreeIndexTexture,
      materialData.nodeTransformTextureBuilder.overrideTransformIndexTexture,
      materialData.nodeTransformTextureBuilder.transformLookupTexture,
      materialData.matCapTexture,
      this._renderMode,
      this._rotationInvariantLighting,
      this._realisticShading,
      this._realisticTextures
    );
  }
}

function toTextureMaterialName(sectorId: number) {
  return `texturedMaterial_${sectorId}`;
}

export function createCadMaterial(maxTreeIndex: number): CadMaterial {
  const nodeAppearanceProvider = new NodeAppearanceProvider();
  const nodeAppearanceTextureBuilder = new NodeAppearanceTextureBuilder(maxTreeIndex + 1, nodeAppearanceProvider);
  nodeAppearanceTextureBuilder.build();

  const nodeTransformProvider = new NodeTransformProvider();
  const nodeTransformTextureBuilder = new NodeTransformTextureBuilder(maxTreeIndex + 1, nodeTransformProvider);
  nodeTransformTextureBuilder.build();

  const matCapTexture = new Texture(getMatCapTextureData());
  matCapTexture.needsUpdate = true;

  const clippingPlanesProvider = new ClippingPlanesProvider();

  const materials = createMaterials(
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

function applyRealisticTextures(material: RawShaderMaterial, textures: RealisticTextures | undefined): void {
  material.uniforms.realisticTexturesEnabled.value = textures !== undefined;
  material.uniforms.realisticPaintTexture.value = textures?.paint ?? null;
  material.uniforms.realisticStreaksTexture.value = textures?.streaks ?? null;
  material.uniforms.realisticDeckTexture.value = textures?.deck ?? null;
  material.uniforms.realisticMetalTexture.value = textures?.metal ?? null;
}

function applyRealisticShadows(material: RawShaderMaterial, shadows: RealisticShadows | undefined): void {
  material.uniforms.realisticShadowsEnabled.value = shadows !== undefined;
  if (!shadows) {
    // Keep the last map bound: once declared, the shadow sampler must always have a valid depth texture.
    return;
  }
  if (material.defines.REALISTIC_SHADOWS === undefined) {
    material.defines.REALISTIC_SHADOWS = true;
    material.needsUpdate = true;
  }
  material.uniforms.realisticShadowMap.value = shadows.texture;
  material.uniforms.realisticShadowMatrix.value.copy(shadows.matrix);
  material.uniforms.realisticShadowTexelSize.value = shadows.texelSize;
  material.uniforms.realisticShadowWorldTexel.value = shadows.worldTexel;
}
