/*!
 * Copyright 2026 Cognite AS
 */

import type { Camera, Material, Object3D, Mesh } from 'three';
import { Matrix4 } from 'three';
import type { ICustomObject } from '@reveal/utilities';
import type { CadShadowMap } from '../render-pipeline-providers/types';
import { CAD_LIGHT_WORLD, CAD_SHADOW_STRENGTH } from './cadLighting';
import receiverShader from '../glsl/post-processing/cadShadowReceiver.glsl';

/**
 * Material hooks as `this`-bound function properties, so they can be stored detached from the
 * material and the compiler enforces that they are invoked with a `Material` as `this`.
 */
type MaterialHooks = {
  onBeforeCompile: (this: Material, ...args: Parameters<Material['onBeforeCompile']>) => void;
  customProgramCacheKey: (this: Material) => string;
};

const supportedMaterialTypes = new Set([
  'MeshBasicMaterial',
  'MeshLambertMaterial',
  'MeshPhongMaterial',
  'MeshStandardMaterial',
  'MeshPhysicalMaterial',
  'MeshToonMaterial',
  'MeshMatcapMaterial'
]);

export class CadShadowReceiverMaterials {
  private readonly _materials = new Map<Material, { original: MaterialHooks; installed: MaterialHooks }>();
  private readonly _receivers = new Map<Mesh, boolean>();
  private readonly _unsupportedMaterials = new WeakSet<Material>();
  private readonly _uniforms;

  constructor(private readonly _shadowMap: CadShadowMap) {
    this._uniforms = {
      tCadShadowMap: { value: _shadowMap.depthTexture },
      cadShadowMatrix: { value: new Matrix4() },
      cadCameraMatrixWorld: { value: new Matrix4() },
      cadShadowLightDirection: { value: CAD_LIGHT_WORLD },
      cadShadowTexelWorld: { value: 1 },
      cadShadowDepthRange: { value: 1 },
      cadShadowStrength: { value: CAD_SHADOW_STRENGTH }
    };
  }

  public update(customObjects: ICustomObject[], camera: Camera): void {
    this._uniforms.tCadShadowMap.value = this._shadowMap.depthTexture;
    this._uniforms.cadShadowMatrix.value.copy(this._shadowMap.matrix);
    this._uniforms.cadCameraMatrixWorld.value.copy(camera.matrixWorld);
    this._uniforms.cadShadowTexelWorld.value = this._shadowMap.texelWorldSize;
    this._uniforms.cadShadowDepthRange.value = this._shadowMap.depthRange;

    const activeMaterials = new Set<Material>();
    const activeReceivers = new Set<Mesh>();
    for (const { object } of customObjects) {
      object.traverse(node => {
        if (!isMesh(node)) return;
        activeReceivers.add(node);
        if (!this._receivers.has(node)) this._receivers.set(node, node.receiveShadow);
        node.receiveShadow = true;
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        for (const material of materials) {
          activeMaterials.add(material);
          if (!this._materials.has(material)) this.install(material);
        }
      });
    }

    for (const [mesh, receiveShadow] of this._receivers) {
      if (!activeReceivers.has(mesh)) {
        mesh.receiveShadow = receiveShadow;
        this._receivers.delete(mesh);
      }
    }

    for (const material of this._materials.keys()) {
      if (!activeMaterials.has(material)) this.restore(material);
    }
  }

  public disable(): void {
    if (this._materials.size === 0 && this._receivers.size === 0) {
      return;
    }

    for (const [mesh, receiveShadow] of this._receivers) mesh.receiveShadow = receiveShadow;
    this._receivers.clear();
    for (const material of this._materials.keys()) this.restore(material);
  }

  public dispose(): void {
    this.disable();
  }

  private install(material: Material): void {
    if (!supportedMaterialTypes.has(material.type)) {
      if (!this._unsupportedMaterials.has(material)) {
        console.warn(`CAD mesh shadows do not support ${material.type}; use a built-in mesh color material.`);
        this._unsupportedMaterials.add(material);
      }
      return;
    }

    const hooks: MaterialHooks = material;
    const original: MaterialHooks = {
      onBeforeCompile: hooks.onBeforeCompile,
      customProgramCacheKey: hooks.customProgramCacheKey
    };
    const uniforms = this._uniforms;
    const installed: MaterialHooks = {
      onBeforeCompile(shader, renderer) {
        original.onBeforeCompile.call(this, shader, renderer);
        if (
          !shader.vertexShader.includes('#include <project_vertex>') ||
          !/void\s+main\s*\(\s*\)\s*\{/.test(shader.fragmentShader) ||
          !shader.fragmentShader.includes('#include <opaque_fragment>')
        ) {
          throw new Error(`CAD mesh shadows: ${material.type} is missing the required Three.js shader chunks.`);
        }

        Object.assign(shader.uniforms, uniforms);
        shader.vertexShader =
          'uniform mat4 cadCameraMatrixWorld;\nvarying vec3 vCadReceiverWorldPosition;\n' +
          shader.vertexShader.replace(
            '#include <project_vertex>',
            '#include <project_vertex>\nvCadReceiverWorldPosition = (cadCameraMatrixWorld * mvPosition).xyz;'
          );

        // Lit materials already declare receiveShadow in lights_pars_begin.
        const receiveShadowUniform = shader.fragmentShader.includes('#include <lights_pars_begin>')
          ? ''
          : 'uniform bool receiveShadow;\n';
        shader.fragmentShader = shader.fragmentShader
          .replace(/void\s+main\s*\(\s*\)\s*\{/, `${receiveShadowUniform}${receiverShader}\n$&`)
          .replace('#include <opaque_fragment>', 'outgoingLight *= cadReceiverLit();\n#include <opaque_fragment>');
      },
      customProgramCacheKey() {
        return `${original.customProgramCacheKey.call(this)}|cad-mesh-shadow-v1|${original.onBeforeCompile.toString()}`;
      }
    };

    this._materials.set(material, { original, installed });
    material.onBeforeCompile = installed.onBeforeCompile;
    material.customProgramCacheKey = installed.customProgramCacheKey;
    material.needsUpdate = true;
  }

  private restore(material: Material): void {
    const hooks = this._materials.get(material)!;
    if (material.onBeforeCompile === hooks.installed.onBeforeCompile) {
      material.onBeforeCompile = hooks.original.onBeforeCompile;
    }
    if (material.customProgramCacheKey === hooks.installed.customProgramCacheKey) {
      material.customProgramCacheKey = hooks.original.customProgramCacheKey;
    }
    material.needsUpdate = true;
    this._materials.delete(material);
  }
}

function isMesh(object: Object3D): object is Mesh {
  return 'isMesh' in object && object.isMesh === true;
}
