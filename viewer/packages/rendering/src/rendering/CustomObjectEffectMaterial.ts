/*!
 * Copyright 2026 Cognite AS
 */

import type { Camera, ColorRepresentation, Texture, WebGLRenderer, Scene, Wrapping } from 'three';
import {
  Color,
  GLSL3,
  Matrix3,
  Matrix4,
  MirroredRepeatWrapping,
  RawShaderMaterial,
  RepeatWrapping,
  Vector3
} from 'three';
import type { ICustomObject } from '@reveal/utilities';
import type { CadShadowMap } from '../render-pipeline-providers/types';
import { CAD_LIGHT_WORLD, CAD_SHADOW_STRENGTH } from './cadLighting';
import effectFragmentShader from '../glsl/post-processing/custom-object-effect.frag';
import effectVertexShader from '../glsl/post-processing/custom-object-effect.vert';

/**
 * Technique that hides the repeat of a tiled texture.
 * - `'none'`: the texture is sampled as is.
 * - `'hexTiling'`: cells rotate and shift the texture. Suits ground such as concrete, gravel and grass.
 * - `'waterTiling'`: cells shift the texture without rotating it, so waves keep their direction.
 * A second, larger copy of the texture is blended in and the contrast is kept. Suits water and ocean.
 * @public
 */
export type TextureVariationType = 'none' | 'hexTiling' | 'waterTiling';

// Define name in custom-object-effect.frag for each effect.
const CAD_SHADOW_DEFINE = 'CAD_SHADOW';
const TEXTURE_VARIATION_DEFINE: Record<Exclude<TextureVariationType, 'none'>, string> = {
  hexTiling: 'HEX_TILING_TEXTURE_VARIATION',
  waterTiling: 'WATER_TILING_TEXTURE_VARIATION'
};

/**
 * Opt-in material for custom objects. Reveal applies CAD shadows and texture variation only to
 * meshes that use it. Each effect is included only while its define is set.
 * @public
 */
export class CustomObjectEffectMaterial extends RawShaderMaterial {
  private static frameShadowMap: CadShadowMap | undefined;
  private _textureVariation: TextureVariationType = 'none';

  /**
   * Shadow map for this frame, copied in `onBeforeRender`.
   * @internal
   */
  public static setFrameShadowMap(shadowMap: CadShadowMap | undefined): void {
    CustomObjectEffectMaterial.frameShadowMap = shadowMap;
  }

  /**
   * Registers one material the caller has already chosen and applies the current shadow effect.
   * @internal
   */
  public static registerEffect(
    owner: object,
    mesh: SurfaceMesh,
    material: CustomObjectEffectMaterial,
    slot: number | undefined,
    install: boolean,
    receivesShadow: boolean
  ): void {
    let surface = findSurface(owner, mesh, slot);
    if (surface === undefined) {
      surface = { owner, mesh, slot, material, receivesShadow: false };
      adoptedSurfaces.push(surface);
    }
    surface.material = material;
    surface.receivesShadow = receivesShadow;
    material.setReceivesShadow(install && receivesShadow);
  }

  /**
   * Forgets the planes of the custom objects. Their materials are left as they are.
   * @internal
   */
  public static releaseEffects(owner: object, customObjects: ICustomObject[]): void {
    const meshes = new Set<object>();
    for (const customObject of customObjects) {
      customObject.object.traverse(node => {
        if (isSurfaceMesh(node)) meshes.add(node);
      });
    }
    unregisterSurfaces(owner, meshes);
  }

  /**
   * Forgets every plane the owner adopted.
   * @internal
   */
  public static releaseOwner(owner: object): void {
    unregisterSurfaces(owner, undefined);
  }

  /**
   * Turns the CAD shadow on and off for the owner's planes that receive shadow.
   * @internal
   */
  public static setShadowMaterialsVisible(owner: object, visible: boolean): void {
    for (const surface of adoptedSurfaces) {
      if (surface.owner !== owner) continue;
      surface.material.setReceivesShadow(visible && surface.receivesShadow);
    }
  }

  /**
   * White and no texture when omitted. Without a texture, texture variation stays off.
   */
  constructor(color: ColorRepresentation = '#ffffff', map: Texture | null = null) {
    super({
      vertexShader: effectVertexShader,
      fragmentShader: effectFragmentShader,
      uniforms: {
        tDiffuse: { value: map },
        tDiffuseTransform: { value: new Matrix3() },
        diffuseColor: { value: new Color(color) },
        cadShadowApply: { value: 0 },
        tCadShadowMap: { value: null },
        inverseProjectionMatrix: { value: new Matrix4() },
        cadCameraMatrixWorld: { value: new Matrix4() },
        cadShadowMatrix: { value: new Matrix4() },
        cadShadowLightDirection: { value: CAD_LIGHT_WORLD.clone() },
        cadShadowTexelWorld: { value: 1 },
        cadShadowStableTexelWorld: { value: 1 },
        cadShadowDepthRange: { value: 1 },
        cadShadowStrength: { value: CAD_SHADOW_STRENGTH },
        cadShadowTerminatorFade: { value: 0 },
        hexTilingParams: { value: HEX_TILING_REPEATED.clone() },
        waterTilingParams: { value: WATER_TILING.clone() }
      },
      glslVersion: GLSL3
    });
    this.setMap(map);
    this.type = 'CustomObjectEffectMaterial';
  }

  /**
   * Copies this frame's CAD shadow map and the texture transform. Called by Three.js.
   * @internal
   */
  public override onBeforeRender(
    _renderer: WebGLRenderer,
    _scene: Scene,
    camera: Camera,
    _geometry: unknown,
    _object: unknown,
    _group: unknown
  ): void {
    // Refreshed every frame so an animated texture offset shows with or without shadows.
    this.refreshMapTransform();
    const shadowMap = CustomObjectEffectMaterial.frameShadowMap;
    if (shadowMap === undefined || !this.cadShadow) {
      this.disableShadows();
      return;
    }
    this.update(shadowMap, camera);
  }

  /** Sets the diffuse texture. Pass null to clear it. The texture variation follows the new texture. */
  public setMap(map: Texture | null): void {
    this.uniforms.tDiffuse.value = map;
    if (map === null) {
      delete this.defines.USE_DIFFUSE_TEXTURE;
    } else {
      this.defines.USE_DIFFUSE_TEXTURE = '';
    }
    this.needsUpdate = true;
    this.refreshMapTransform();
    this.applyTextureVariation();
  }

  /**
   * Chooses the technique that hides the repeat of the texture.
   * Stays off while the material has no texture, and starts once a texture is set.
   */
  public setTextureVariation(type: TextureVariationType): void {
    this._textureVariation = type;
    this.applyTextureVariation();
  }

  /** The texture variation in use. `'none'` while the material has no texture. */
  public get textureVariation(): TextureVariationType {
    for (const type of TEXTURE_VARIATION_TYPES) {
      if (this.defines[TEXTURE_VARIATION_DEFINE[type]] !== undefined) return type;
    }
    return 'none';
  }

  private applyTextureVariation(): void {
    const map = this.uniforms.tDiffuse.value as Texture | null;
    const type = map === null ? 'none' : this._textureVariation;
    if (map !== null && type === 'hexTiling') {
      // A stretched texture mirrors so its edges meet, and blends softly instead of rotating.
      const stretched = isStretched(map);
      ensureWrapping(map, stretched ? MirroredRepeatWrapping : RepeatWrapping);
      (this.uniforms.hexTilingParams.value as Vector3).copy(stretched ? HEX_TILING_STRETCHED : HEX_TILING_REPEATED);
    }
    if (map !== null && type === 'waterTiling') {
      // Mirroring would flip the wave direction.
      ensureWrapping(map, RepeatWrapping);
    }
    for (const candidate of TEXTURE_VARIATION_TYPES) {
      this.setEffectEnabled(TEXTURE_VARIATION_DEFINE[candidate], candidate === type);
    }
  }

  private setEffectEnabled(define: string, enabled: boolean): void {
    const isEnabled = this.defines[define] !== undefined;
    if (isEnabled === enabled) return;
    if (enabled) this.defines[define] = '';
    else delete this.defines[define];
    this.needsUpdate = true;
  }

  /** Turns the CAD shadow effect on or off for this material. */
  public setReceivesShadow(receivesShadow: boolean): void {
    this.setEffectEnabled(CAD_SHADOW_DEFINE, receivesShadow);
    if (!receivesShadow) this.disableShadows();
  }

  /** Whether the CAD shadow effect is enabled. */
  public get receivesShadow(): boolean {
    return this.cadShadow;
  }

  private get cadShadow(): boolean {
    return this.defines[CAD_SHADOW_DEFINE] !== undefined;
  }

  /** Sets the diffuse color. */
  public setColor(color: ColorRepresentation): void {
    (this.uniforms.diffuseColor.value as Color).set(color);
  }

  /** @internal */
  public update(shadowMap: CadShadowMap, camera: Camera): void {
    const uniforms = this.uniforms;
    uniforms.cadShadowApply.value = 1;
    uniforms.tCadShadowMap.value = shadowMap.depthTexture;
    uniforms.cadShadowMatrix.value.copy(shadowMap.matrix);
    uniforms.cadCameraMatrixWorld.value.copy(camera.matrixWorld);
    uniforms.cadShadowTexelWorld.value = shadowMap.texelWorldSize;
    uniforms.cadShadowStableTexelWorld.value = shadowMap.stableTexelWorldSize;
    uniforms.cadShadowDepthRange.value = shadowMap.depthRange;
  }

  /** @internal */
  public disableShadows(): void {
    this.uniforms.cadShadowApply.value = 0;
    this.uniforms.tCadShadowMap.value = null;
  }

  private refreshMapTransform(): void {
    const map = this.uniforms.tDiffuse.value as Texture | null;
    const transform = this.uniforms.tDiffuseTransform.value as Matrix3;
    if (map === null) {
      transform.identity();
      return;
    }
    if (map.matrixAutoUpdate === true) map.updateMatrix();
    transform.copy(map.matrix);
  }
}

/**
 * Alias for {@link CustomObjectEffectMaterial}.
 * @deprecated Use {@link CustomObjectEffectMaterial}.
 * @public
 */
export const CadShadowReceiverForCustomObjectMaterial = CustomObjectEffectMaterial;

/**
 * Alias for {@link CustomObjectEffectMaterial}, so the old name still works as a type.
 * @deprecated Use {@link CustomObjectEffectMaterial}.
 * @public
 */
export type CadShadowReceiverForCustomObjectMaterial = CustomObjectEffectMaterial;

const adoptedSurfaces: AdoptedSurface[] = [];

const TEXTURE_VARIATION_TYPES = ['hexTiling', 'waterTiling'] as const;

// x: rotation, y: luminance falloff, z: blend exponent.
const HEX_TILING_REPEATED = new Vector3(0.3, 0.6, 7.0);
const HEX_TILING_STRETCHED = new Vector3(0.0, 0.0, 1.5);
// x: blend exponent, y: scale of the second layer, z: strength of the slow brightness change.
const WATER_TILING = new Vector3(2.0, 0.41, 0.06);
// Tile count below which the texture is treated as stretched.
const TEXTURE_VARIATION_FEW_TILES = 3;

type AdoptedSurface = {
  owner: object;
  mesh: SurfaceMesh;
  slot: number | undefined;
  material: CustomObjectEffectMaterial;
  receivesShadow: boolean;
};

type SurfaceMesh = {
  isMesh: true;
  material: object | object[];
};

function isSurfaceMesh(node: object): node is SurfaceMesh {
  return (node as { isMesh?: boolean }).isMesh === true;
}

function findSurface(owner: object, mesh: SurfaceMesh, slot: number | undefined): AdoptedSurface | undefined {
  return adoptedSurfaces.find(surface => surface.owner === owner && surface.mesh === mesh && surface.slot === slot);
}

function isStretched(map: Texture): boolean {
  const tilesAcross = Math.max(Math.abs(map.repeat.x), Math.abs(map.repeat.y));
  return tilesAcross < TEXTURE_VARIATION_FEW_TILES;
}

function ensureWrapping(map: Texture, wrapping: Wrapping): void {
  if (map.wrapS === wrapping && map.wrapT === wrapping) return;
  map.wrapS = wrapping;
  map.wrapT = wrapping;
  map.needsUpdate = true;
}

function unregisterSurfaces(owner: object, meshes: Set<object> | undefined): void {
  for (let index = adoptedSurfaces.length - 1; index >= 0; index--) {
    const surface = adoptedSurfaces[index];
    if (surface.owner !== owner) continue;
    if (meshes !== undefined && !meshes.has(surface.mesh)) continue;
    adoptedSurfaces.splice(index, 1);
  }
}
