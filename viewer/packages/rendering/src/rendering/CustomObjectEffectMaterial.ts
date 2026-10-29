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
enum CustomObjectEffect {
  CadShadow = 'CAD_SHADOW',
  HexTiling = 'HEX_TILING_TEXTURE_VARIATION',
  WaterTiling = 'WATER_TILING_TEXTURE_VARIATION'
}

// Effect compiled for each texture variation technique.
const TEXTURE_VARIATION_EFFECT: Record<Exclude<TextureVariationType, 'none'>, CustomObjectEffect> = {
  hexTiling: CustomObjectEffect.HexTiling,
  waterTiling: CustomObjectEffect.WaterTiling
};

// Shadow map of the current frame per viewer scene. A WeakMap so a disposed viewer's scene takes
// its entry with it, and so no value is ever shared between viewers.
const frameShadowMaps = new WeakMap<Scene, CadShadowMap>();

// x: rotation, y: luminance falloff, z: blend exponent.
const HEX_TILING_REPEATED = new Vector3(0.3, 0.6, 7.0);
const HEX_TILING_STRETCHED = new Vector3(0.0, 0.0, 1.5);
// x: blend exponent, y: scale of the second layer, z: strength of the slow brightness change.
const WATER_TILING = new Vector3(2.0, 0.41, 0.06);
// Tile count below which the texture is treated as stretched.
const TEXTURE_VARIATION_FEW_TILES = 3;

/**
 * Opt-in material for custom objects: an effect is compiled into the shader only while requested.
 *
 * {@link CustomObjectEffectMaterial.setReceivesShadow} requests the CAD shadow; the shader recompiles whenever the
 * viewer's shadow map appears or disappears, so give each viewer its own material if shadow state can differ.
 *
 * Only the methods declared here are supported; inherited `RawShaderMaterial` internals may change.
 * @public
 */
export class CustomObjectEffectMaterial extends RawShaderMaterial {
  // If this material instance should receive shadows.
  private _receivesShadow = false;
  // Texture variation this material instance should use. Only drawn while it has a texture.
  private _textureVariation: TextureVariationType = 'none';

  /**
   * White and no texture when omitted. Effects are requested afterwards through their setters.
   * @param color - Diffuse color.
   * @param diffuseTexture - Diffuse texture.
   */
  constructor(color: ColorRepresentation = '#ffffff', diffuseTexture?: Texture | null) {
    super({
      vertexShader: effectVertexShader,
      fragmentShader: effectFragmentShader,
      uniforms: {
        tDiffuse: { value: diffuseTexture ?? null },
        tDiffuseTransform: { value: new Matrix3() },
        diffuseColor: { value: new Color(color) },
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
    this.setDiffuseTexture(diffuseTexture ?? null);
    this.type = 'CustomObjectEffectMaterial';
  }

  /** Whether this material requested the CAD shadow. */
  public get receivesShadow(): boolean {
    return this._receivesShadow;
  }

  /**
   * Shadow map the viewer drew for this frame, keyed by its scene so viewers never share one; each material copies
   * it in `onBeforeRender`. Pass undefined when there is none.
   * @internal
   */
  public static setFrameShadowMap(scene: Scene, shadowMap: CadShadowMap | undefined): void {
    if (shadowMap === undefined) frameShadowMaps.delete(scene);
    else frameShadowMaps.set(scene, shadowMap);
  }

  /**
   * Prepares this draw: includes the CAD shadow only when it was requested and the viewer has a
   * shadow map, and follows changes to the texture transform. Called by Three.js.
   * @internal
   */
  public override onBeforeRender(
    _renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    _geometry: unknown,
    _object: unknown,
    _group: unknown
  ): void {
    const shadowMap = this._receivesShadow ? frameShadowMaps.get(scene) : undefined;
    // Three.js picks the shader program after this call, so this define change applies to this draw: leaving the
    // shadow out when there is no shadow map keeps the shader as cheap as one without shadows, with no runtime branch.
    this.setEffectEnabled(CustomObjectEffect.CadShadow, shadowMap !== undefined);
    if (shadowMap === undefined) {
      this.clearShadowUniforms();
    } else {
      this.updateShadowUniforms(shadowMap, camera);
    }
    this.refreshMapTransform();
  }

  /**
   * Sets the diffuse texture. Pass null to clear it. A requested texture variation follows the
   * new texture.
   */
  public setDiffuseTexture(texture: Texture | null): void {
    this.uniforms.tDiffuse.value = texture;
    if (texture === null) {
      delete this.defines.USE_DIFFUSE_TEXTURE;
    } else {
      this.defines.USE_DIFFUSE_TEXTURE = '';
    }
    this.needsUpdate = true;
    this.refreshMapTransform();
    this.applyTextureVariation();
  }

  /**
   * Sets the diffuse texture.
   * @deprecated Use {@link CustomObjectEffectMaterial.setDiffuseTexture}.
   */
  public setMap(map: Texture | null): void {
    this.setDiffuseTexture(map);
  }

  /**
   * Chooses the technique that hides the repeat of the texture. It is drawn only while the material has a
   * texture; the choice itself is kept, so it may be made before or after the texture is set.
   */
  public setTextureVariation(type: TextureVariationType): void {
    this._textureVariation = type;
    this.applyTextureVariation();
  }

  /** The texture variation this material requested. */
  public get textureVariation(): TextureVariationType {
    return this._textureVariation;
  }

  // The shader includes the requested technique only while there is a texture to vary.
  private applyTextureVariation(): void {
    const texture = this.uniforms.tDiffuse.value as Texture | null;
    const applied = texture === null ? 'none' : this._textureVariation;
    if (texture !== null && applied === 'hexTiling') {
      // A stretched texture mirrors so its edges meet, and blends softly instead of rotating.
      const stretched = isStretched(texture);
      ensureWrapping(texture, stretched ? MirroredRepeatWrapping : RepeatWrapping);
      (this.uniforms.hexTilingParams.value as Vector3).copy(stretched ? HEX_TILING_STRETCHED : HEX_TILING_REPEATED);
    }
    if (texture !== null && applied === 'waterTiling') {
      // Mirroring would flip the wave direction.
      ensureWrapping(texture, RepeatWrapping);
    }
    for (const [type, effect] of Object.entries(TEXTURE_VARIATION_EFFECT)) {
      this.setEffectEnabled(effect, type === applied);
    }
  }

  private setEffectEnabled(effect: CustomObjectEffect, enabled: boolean): void {
    const isEnabled = this.defines[effect] !== undefined;
    if (isEnabled === enabled) return;
    if (enabled) this.defines[effect] = '';
    else delete this.defines[effect];
    this.needsUpdate = true;
  }

  /**
   * Requests or drops the CAD shadow for this material; the request is kept and drawn only while the viewer has
   * shadows enabled (`Cognite3DViewer.shadowsEnabled`), taking effect on the next draw.
   */
  public setReceivesShadow(receivesShadow: boolean): void {
    this._receivesShadow = receivesShadow;
  }

  /**
   * Sets the diffuse color. With a texture, the color multiplies it: white leaves the texture
   * unchanged and any other color tints it.
   */
  public setColor(color: ColorRepresentation): void {
    (this.uniforms.diffuseColor.value as Color).set(color);
  }

  private updateShadowUniforms(shadowMap: CadShadowMap, camera: Camera): void {
    const uniforms = this.uniforms;
    uniforms.tCadShadowMap.value = shadowMap.depthTexture;
    uniforms.cadShadowMatrix.value.copy(shadowMap.matrix);
    uniforms.cadCameraMatrixWorld.value.copy(camera.matrixWorld);
    uniforms.cadShadowTexelWorld.value = shadowMap.texelWorldSize;
    uniforms.cadShadowStableTexelWorld.value = shadowMap.stableTexelWorldSize;
    uniforms.cadShadowDepthRange.value = shadowMap.depthRange;
  }

  // Drops the reference to the viewer's shadow map so it is not kept alive by this material.
  private clearShadowUniforms(): void {
    this.uniforms.tCadShadowMap.value = null;
  }

  private refreshMapTransform(): void {
    const texture = this.uniforms.tDiffuse.value as Texture | null;
    const transform = this.uniforms.tDiffuseTransform.value as Matrix3;
    if (texture === null) {
      transform.identity();
      return;
    }
    if (texture.matrixAutoUpdate === true) texture.updateMatrix();
    transform.copy(texture.matrix);
  }
}

function isStretched(texture: Texture): boolean {
  const tilesAcross = Math.max(Math.abs(texture.repeat.x), Math.abs(texture.repeat.y));
  return tilesAcross < TEXTURE_VARIATION_FEW_TILES;
}

function ensureWrapping(texture: Texture, wrapping: Wrapping): void {
  if (texture.wrapS === wrapping && texture.wrapT === wrapping) return;
  texture.wrapS = wrapping;
  texture.wrapT = wrapping;
  texture.needsUpdate = true;
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
