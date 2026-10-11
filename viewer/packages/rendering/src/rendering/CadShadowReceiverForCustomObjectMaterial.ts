/*!
 * Copyright 2026 Cognite AS
 */

import type { Blending, Camera, ColorRepresentation, Side, Texture, WebGLRenderer, Scene } from 'three';
import { BackSide, Color, GLSL3, Matrix3, Matrix4, RawShaderMaterial, Vector3 } from 'three';
import type { ICustomObject } from '@reveal/utilities';
import type { CadShadowMap } from '../render-pipeline-providers/types';
import { CAD_LIGHT_WORLD, CAD_SHADOW_STRENGTH } from './cadLighting';
import receiverFragmentShader from '../glsl/post-processing/cad-shadow-receiver-for-custom-object.frag';
import receiverVertexShader from '../glsl/post-processing/cad-shadow-receiver-for-custom-object.vert';

/**
 * Surface on a custom object that samples a color or texture and receives CAD shadows.
 * The viewer creates one for each up-facing plane that receives shadows.
 * A skybox stays on its own material when `receiveShadow` is false.
 * @public
 */
export class CadShadowReceiverForCustomObjectMaterial extends RawShaderMaterial {
  private static frameShadowMap: CadShadowMap | undefined;

  /**
   * Shadow data for the receiver materials drawn in this frame.
   * Each material copies it in `onBeforeRender`, when the mesh is drawn.
   * @internal
   */
  public static setFrameShadowMap(shadowMap: CadShadowMap | undefined): void {
    CadShadowReceiverForCustomObjectMaterial.frameShadowMap = shadowMap;
  }

  /**
   * Replaces up-facing plane surfaces with this material while shadows are on.
   * The original material stays on the mesh while shadows are off.
   * @internal
   */
  public static adoptReceivers(owner: object, customObjects: ICustomObject[], install = true): void {
    for (const customObject of customObjects) {
      if (customObject.receiveShadow === false) continue;
      customObject.object.updateMatrixWorld(true);
      customObject.object.traverse(node => {
        if (!isSurfaceMesh(node) || !isUpFacingPlane(node)) return;
        rememberSurfaces(owner, node, install);
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

  /** @internal */
  public static setShadowMaterialsVisible(owner: object, visible: boolean): void {
    for (const replacement of replacements) {
      if (replacement.owner !== owner) continue;
      const current = materialAt(replacement.mesh, replacement.slot);
      if (current !== replacement.receiver && current !== replacement.original) continue;
      assignMaterial(replacement.mesh, replacement.slot, visible ? replacement.receiver : replacement.original);
    }
  }

  constructor(color: ColorRepresentation = '#ffffff', map: Texture | null = null) {
    super({
      vertexShader: receiverVertexShader,
      fragmentShader: receiverFragmentShader,
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
        cadShadowDepthRange: { value: 1 },
        cadShadowStrength: { value: CAD_SHADOW_STRENGTH },
        cadShadowTerminatorFade: { value: 0 }
      },
      glslVersion: GLSL3
    });
    this.setMap(map);
    this.type = 'CadShadowReceiverForCustomObjectMaterial';
  }

  public override onBeforeRender(
    _renderer: WebGLRenderer,
    _scene: Scene,
    camera: Camera,
    _geometry: unknown,
    _object: unknown,
    _group: unknown
  ): void {
    const shadowMap = CadShadowReceiverForCustomObjectMaterial.frameShadowMap;
    if (shadowMap === undefined) {
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

type Replacement = {
  owner: object;
  mesh: SurfaceMesh;
  slot: number | undefined;
  original: object;
  receiver: CadShadowReceiverForCustomObjectMaterial;
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

function rememberSurfaces(owner: object, mesh: SurfaceMesh, install: boolean): void {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const next = materials.map((material, index) => rememberSurface(owner, mesh, material, index, install));
  if (!install) return;
  mesh.material = Array.isArray(mesh.material) ? next : next[0];
}

function rememberSurface(
  owner: object,
  mesh: SurfaceMesh,
  material: object,
  index: number,
  install: boolean
): object {
  if (material instanceof CadShadowReceiverForCustomObjectMaterial || sideOf(material) === BackSide) return material;
  const receiver = new CadShadowReceiverForCustomObjectMaterial(colorOf(material), mapOf(material));
  copyDrawState(material, receiver);
  replacements.push({
    owner,
    mesh,
    slot: Array.isArray(mesh.material) ? index : undefined,
    original: material,
    receiver
  });
  return install ? receiver : material;
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

function copyDrawState(source: object, receiver: CadShadowReceiverForCustomObjectMaterial): void {
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
