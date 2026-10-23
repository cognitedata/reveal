/*!
 * Copyright 2026 Cognite AS
 */

import type { Camera, ColorRepresentation, Texture, WebGLRenderer, Scene } from 'three';
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

// Define name in custom-object-effect.frag for each effect.
const CUSTOM_OBJECT_EFFECT = {
  cadShadow: 'CAD_SHADOW',
  textureVariation: 'HEX_TILING_TEXTURE_VARIATION'
} as const;

/**
 * Opt-in material for up-facing custom objects, such as a ground plane. Reveal applies its
 * effects only to planes that use it; each effect is included only while its define is set.
 * @public
 */
export class CustomObjectEffectMaterial extends RawShaderMaterial {
  private static frameShadowMap: CadShadowMap | undefined;

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
        hexTilingParams: { value: HEX_TILING_REPEATED.clone() }
      },
      glslVersion: GLSL3
    });
    this.setMap(map);
    this.type = 'CustomObjectEffectMaterial';
  }

  public override onBeforeRender(
    _renderer: WebGLRenderer,
    _scene: Scene,
    camera: Camera,
    _geometry: unknown,
    _object: unknown,
    _group: unknown
  ): void {
    const shadowMap = CustomObjectEffectMaterial.frameShadowMap;
    if (shadowMap === undefined || !this.cadShadow) {
      this.disableShadows();
      return;
    }
    this.update(shadowMap, camera);
  }

  public setMap(map: Texture | null): void {
    this.uniforms.tDiffuse.value = map;
    if (map === null) {
      delete this.defines.USE_DIFFUSE_TEXTURE;
    } else {
      this.defines.USE_DIFFUSE_TEXTURE = '';
    }
    this.needsUpdate = true;
    this.refreshMapTransform();
  }

  public setTextureVariation(enabled: boolean): void {
    const map = this.uniforms.tDiffuse.value as Texture | null;
    if (enabled && map !== null) {
      ensureRepeatWrapping(map);
      this.fitTextureVariationToMap(map);
    }
    this.setEffectEnabled(CUSTOM_OBJECT_EFFECT.textureVariation, enabled && map !== null);
  }

  private fitTextureVariationToMap(map: Texture): void {
    const params = this.uniforms.hexTilingParams.value as Vector3;
    const tilesAcross = Math.max(Math.abs(map.repeat.x), Math.abs(map.repeat.y));
    params.copy(tilesAcross < HEX_TILING_FEW_TILES ? HEX_TILING_STRETCHED : HEX_TILING_REPEATED);
  }

  public get textureVariation(): boolean {
    return this.defines[CUSTOM_OBJECT_EFFECT.textureVariation] !== undefined;
  }

  private setEffectEnabled(define: string, enabled: boolean): void {
    const isEnabled = this.defines[define] !== undefined;
    if (isEnabled === enabled) return;
    if (enabled) this.defines[define] = '';
    else delete this.defines[define];
    this.needsUpdate = true;
  }

  public setReceivesShadow(receivesShadow: boolean): void {
    this.setEffectEnabled(CUSTOM_OBJECT_EFFECT.cadShadow, receivesShadow);
    if (!receivesShadow) this.disableShadows();
  }

  public get receivesShadow(): boolean {
    return this.cadShadow;
  }

  private get cadShadow(): boolean {
    return this.defines[CUSTOM_OBJECT_EFFECT.cadShadow] !== undefined;
  }

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
    this.refreshMapTransform();
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

const adoptedSurfaces: AdoptedSurface[] = [];

// x: rotation, y: luminance falloff, z: blend exponent.
const HEX_TILING_REPEATED = new Vector3(0.3, 0.6, 7.0);
const HEX_TILING_STRETCHED = new Vector3(0.0, 0.0, 1.5);
// Tile count below which the texture is treated as stretched.
const HEX_TILING_FEW_TILES = 3;

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

function ensureRepeatWrapping(map: Texture): void {
  const tilesAcross = Math.max(Math.abs(map.repeat.x), Math.abs(map.repeat.y));
  const wrapping = tilesAcross < HEX_TILING_FEW_TILES ? MirroredRepeatWrapping : RepeatWrapping;
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
