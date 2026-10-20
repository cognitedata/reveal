/*!
 * Copyright 2026 Cognite AS
 */

import type { Blending, Camera, ColorRepresentation, Side, Texture, WebGLRenderer, Scene } from 'three';
import {
  BackSide,
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
 * Up-facing custom object, such as a ground plane. Each effect is included only while its define is set.
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
   * Installs this material on up-facing planes. Variation keeps it while shadows are off.
   * @internal
   */
  public static adoptReceivers(
    owner: object,
    customObjects: ICustomObject[],
    install = true,
    textureVariation = false
  ): void {
    for (const customObject of customObjects) {
      const receivesShadow = customObject.receiveShadow !== false;
      if (!receivesShadow && !textureVariation) continue;
      customObject.object.updateMatrixWorld(true);
      customObject.object.traverse(node => {
        if (!isSurfaceMesh(node) || !isUpFacingPlane(node)) return;
        rememberSurfaces(owner, node, { install, receivesShadow, textureVariation });
      });
    }
  }

  /**
   * Restores the original materials of the custom objects and forgets their receivers.
   * @internal
   */
  public static releaseReceivers(owner: object, customObjects: ICustomObject[]): void {
    const meshes = new Set<object>();
    for (const customObject of customObjects) {
      customObject.object.traverse(node => {
        if (isSurfaceMesh(node)) meshes.add(node);
      });
    }
    forgetSurfaces(owner, meshes);
  }

  /**
   * Restores the original materials of every receiver the owner adopted.
   * @internal
   */
  public static releaseOwner(owner: object): void {
    forgetSurfaces(owner, undefined);
  }

  /**
   * Swaps this material with the original as shadows turn on and off. Pinned planes stay.
   * @internal
   */
  public static setShadowMaterialsVisible(owner: object, visible: boolean): void {
    for (const replacement of replacements) {
      if (replacement.owner !== owner) continue;
      const current = materialAt(replacement.mesh, replacement.slot);
      if (current !== replacement.receiver && current !== replacement.original) continue;
      const showReceiver = visible || replacement.pinned;
      assignMaterial(replacement.mesh, replacement.slot, showReceiver ? replacement.receiver : replacement.original);
    }
  }

  constructor(color: ColorRepresentation = '#ffffff', map: Texture | null = null) {
    super({
      vertexShader: effectVertexShader,
      fragmentShader: effectFragmentShader,
      uniforms: {
        tReceiver: { value: map },
        tReceiverTransform: { value: new Matrix3() },
        receiverColor: { value: new Color(color) },
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
      defines: {
        [CUSTOM_OBJECT_EFFECT.cadShadow]: ''
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
    this.uniforms.tReceiver.value = map;
    if (map === null) {
      delete this.defines.USE_MAP;
    } else {
      this.defines.USE_MAP = '';
    }
    this.needsUpdate = true;
    this.refreshMapTransform();
  }

  public setTextureVariation(enabled: boolean): void {
    if (enabled) this.fitTextureVariationToMap();
    this.setEffectEnabled(CUSTOM_OBJECT_EFFECT.textureVariation, enabled);
  }

  private fitTextureVariationToMap(): void {
    const map = this.uniforms.tReceiver.value as Texture | null;
    const params = this.uniforms.hexTilingParams.value as Vector3;
    if (map === null) return;
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

  /** @internal */
  public setReceivesShadow(receivesShadow: boolean): void {
    this.setEffectEnabled(CUSTOM_OBJECT_EFFECT.cadShadow, receivesShadow);
    if (!receivesShadow) this.disableShadows();
  }

  private get cadShadow(): boolean {
    return this.defines[CUSTOM_OBJECT_EFFECT.cadShadow] !== undefined;
  }

  public setColor(color: ColorRepresentation): void {
    (this.uniforms.receiverColor.value as Color).set(color);
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
    const map = this.uniforms.tReceiver.value as Texture | null;
    const transform = this.uniforms.tReceiverTransform.value as Matrix3;
    if (map === null) {
      transform.identity();
      return;
    }
    if (map.matrixAutoUpdate === true) map.updateMatrix();
    transform.copy(map.matrix);
  }
}

const size = new Vector3();
const axis = new Vector3();
const replacements: Replacement[] = [];

// x: rotation, y: luminance falloff, z: blend exponent.
const HEX_TILING_REPEATED = new Vector3(0.3, 0.6, 7.0);
const HEX_TILING_STRETCHED = new Vector3(0.0, 0.0, 1.5);
// Tile count below which the texture is treated as stretched.
const HEX_TILING_FEW_TILES = 3;

type Replacement = {
  owner: object;
  mesh: SurfaceMesh;
  slot: number | undefined;
  original: object;
  receiver: CustomObjectEffectMaterial;
  /** Stays installed while shadows are off. */
  pinned: boolean;
};

type SurfaceMesh = {
  isMesh: true;
  geometry: {
    boundingBox: { getSize: (target: Vector3) => Vector3 } | null;
    computeBoundingBox: () => void;
  };
  matrixWorld: Matrix4;
  material: object | object[];
};

function isSurfaceMesh(node: object): node is SurfaceMesh {
  return (node as { isMesh?: boolean }).isMesh === true;
}

function isUpFacingPlane(mesh: SurfaceMesh): boolean {
  const { geometry } = mesh;
  if (geometry.boundingBox === null) geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (box === null) return false;

  box.getSize(size);
  const thin = Math.min(size.x, size.y, size.z);
  const broad = Math.max(size.x, size.y, size.z);
  if (broad <= 1e-4 || thin > Math.max(broad * 0.25, 1e-4)) return false;

  if (size.x === thin) axis.set(1, 0, 0);
  else if (size.y === thin) axis.set(0, 1, 0);
  else axis.set(0, 0, 1);
  axis.transformDirection(mesh.matrixWorld);
  return axis.y > 0.75;
}

type AdoptOptions = {
  install: boolean;
  receivesShadow: boolean;
  textureVariation: boolean;
};

function rememberSurfaces(owner: object, mesh: SurfaceMesh, options: AdoptOptions): void {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const next = materials.map((material, index) => rememberSurface(owner, mesh, material, index, options));
  if (next.every((material, index) => material === materials[index])) return;
  mesh.material = Array.isArray(mesh.material) ? next : next[0];
}

function rememberSurface(
  owner: object,
  mesh: SurfaceMesh,
  material: object,
  index: number,
  options: AdoptOptions
): object {
  if (sideOf(material) === BackSide) return material;
  const slot = Array.isArray(mesh.material) ? index : undefined;
  const existing = findReplacement(owner, mesh, slot);
  if (existing !== undefined) return applyTextureVariation(existing, options);
  if (material instanceof CustomObjectEffectMaterial) return material;
  const map = mapOf(material);
  const pinned = options.textureVariation && map !== null;
  if (!options.receivesShadow && !pinned) return material;
  if (pinned && map !== null) ensureRepeatWrapping(map);

  const receiver = new CustomObjectEffectMaterial(colorOf(material), map);
  copyDrawState(material, receiver);
  receiver.setTextureVariation(pinned);
  receiver.setReceivesShadow(options.receivesShadow);
  replacements.push({
    owner,
    mesh,
    slot,
    original: material,
    receiver,
    pinned
  });
  return options.install || pinned ? receiver : material;
}

function findReplacement(owner: object, mesh: SurfaceMesh, slot: number | undefined): Replacement | undefined {
  return replacements.find(
    replacement => replacement.owner === owner && replacement.mesh === mesh && replacement.slot === slot
  );
}

function applyTextureVariation(replacement: Replacement, options: AdoptOptions): object {
  const map = mapOf(replacement.original);
  const pinned = options.textureVariation && map !== null;
  if (pinned && map !== null) ensureRepeatWrapping(map);
  replacement.receiver.setTextureVariation(pinned);
  replacement.receiver.setReceivesShadow(options.receivesShadow);
  replacement.pinned = pinned;
  return options.install || pinned ? replacement.receiver : replacement.original;
}

function ensureRepeatWrapping(map: Texture): void {
  const tilesAcross = Math.max(Math.abs(map.repeat.x), Math.abs(map.repeat.y));
  const wrapping = tilesAcross < HEX_TILING_FEW_TILES ? MirroredRepeatWrapping : RepeatWrapping;
  if (map.wrapS === wrapping && map.wrapT === wrapping) return;
  map.wrapS = wrapping;
  map.wrapT = wrapping;
  map.needsUpdate = true;
}

function forgetSurfaces(owner: object, meshes: Set<object> | undefined): void {
  for (let index = replacements.length - 1; index >= 0; index--) {
    const replacement = replacements[index];
    if (replacement.owner !== owner) continue;
    if (meshes !== undefined && !meshes.has(replacement.mesh)) continue;
    if (materialAt(replacement.mesh, replacement.slot) === replacement.receiver) {
      assignMaterial(replacement.mesh, replacement.slot, replacement.original);
    }
    replacement.receiver.dispose();
    replacements.splice(index, 1);
  }
}

function materialAt(mesh: SurfaceMesh, slot: number | undefined): object {
  if (slot === undefined) return mesh.material as object;
  return (mesh.material as object[])[slot];
}

function assignMaterial(mesh: SurfaceMesh, slot: number | undefined, material: object): void {
  if (materialAt(mesh, slot) === material) return;
  if (slot === undefined) {
    mesh.material = material;
    return;
  }
  const materials = mesh.material as object[];
  materials[slot] = material;
  mesh.material = materials;
}

function sideOf(material: object): number | undefined {
  const side = (material as { side?: number }).side;
  return typeof side === 'number' ? side : undefined;
}

function colorOf(material: object): ColorRepresentation {
  const color = (material as { color?: { r?: number; g?: number; b?: number } }).color;
  if (typeof color?.r !== 'number' || typeof color.g !== 'number' || typeof color.b !== 'number') return '#ffffff';
  return new Color(color.r, color.g, color.b);
}

function mapOf(material: object): Texture | null {
  const map = (material as { map?: Texture | null }).map;
  if (map !== null && map !== undefined && map.isTexture === true) return map;
  return null;
}

function copyDrawState(source: object, receiver: CustomObjectEffectMaterial): void {
  const state = source as {
    transparent?: boolean;
    opacity?: number;
    depthTest?: boolean;
    depthWrite?: boolean;
    side?: Side;
    blending?: Blending;
    visible?: boolean;
    polygonOffset?: boolean;
    polygonOffsetFactor?: number;
    polygonOffsetUnits?: number;
  };
  if (typeof state.blending === 'number') receiver.blending = state.blending;
  if (typeof state.visible === 'boolean') receiver.visible = state.visible;
  if (typeof state.polygonOffset === 'boolean') receiver.polygonOffset = state.polygonOffset;
  if (typeof state.polygonOffsetFactor === 'number') receiver.polygonOffsetFactor = state.polygonOffsetFactor;
  if (typeof state.polygonOffsetUnits === 'number') receiver.polygonOffsetUnits = state.polygonOffsetUnits;
  if (typeof state.transparent === 'boolean') receiver.transparent = state.transparent;
  if (typeof state.opacity === 'number') receiver.opacity = state.opacity;
  if (typeof state.depthTest === 'boolean') receiver.depthTest = state.depthTest;
  if (typeof state.depthWrite === 'boolean') receiver.depthWrite = state.depthWrite;
  if (typeof state.side === 'number') receiver.side = state.side;
}
