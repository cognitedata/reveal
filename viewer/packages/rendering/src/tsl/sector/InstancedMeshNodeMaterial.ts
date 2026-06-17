/*!
 * Copyright 2026 Cognite AS
 */

import { CustomBlending, OneFactor, ZeroFactor } from 'three';
import { Discard, Fn, float, positionGeometry } from 'three/tsl';

import { nodeAppearanceFromTexel, determineColor } from '../base/cadAppearance';
import { GeometryTypeInstancedMesh } from '../base/geometryTypes';
import { updateFragmentColor } from '../base/updateFragmentColor';
import { unpackTreeIndex } from '../base/treeIndexPacking';
import { CadNodeMaterial } from '../CadNodeMaterial';
import type { CadSharedUniformNodes } from '../CadSharedUniforms';
import { derivateNormal } from '../math/derivateNormal';
import { createInstancedCadVertexContext } from './cadVertexContext';

export class InstancedMeshNodeMaterial extends CadNodeMaterial {
  constructor(sharedUniforms: CadSharedUniformNodes, name: string) {
    super(sharedUniforms, name);

    const { vViewPosition, vNodeAppearanceTexel, vTreeIndexPacked, vColor, setupVertex } =
      createInstancedCadVertexContext(sharedUniforms);

    this.positionNode = setupVertex();

    this.fragmentNode = Fn(() => {
      const treeIndex = unpackTreeIndex(vTreeIndexPacked);
      const appearance = nodeAppearanceFromTexel(vNodeAppearanceTexel);
      const color = determineColor(vColor, appearance);
      const normal = derivateNormal(vViewPosition);

      return updateFragmentColor(
        sharedUniforms.renderMode,
        color,
        treeIndex,
        normal,
        positionGeometry.z,
        sharedUniforms.matCapTexture,
        float(GeometryTypeInstancedMesh),
        float(0)
      );
    })();

    this.blending = CustomBlending;
    this.blendDst = ZeroFactor;
    this.blendDstAlpha = OneFactor;
    this.blendSrc = OneFactor;
    this.blendSrcAlpha = ZeroFactor;
  }
}

export function createInstancedMeshNodeMaterial(sharedUniforms: CadSharedUniformNodes): InstancedMeshNodeMaterial {
  return new InstancedMeshNodeMaterial(sharedUniforms, 'Instanced meshes (WebGPU)');
}

export function createBoxNodeMaterial(sharedUniforms: CadSharedUniformNodes): InstancedMeshNodeMaterial {
  return new InstancedMeshNodeMaterial(sharedUniforms, 'Primitives (Box) (WebGPU)');
}

export function createNutNodeMaterial(sharedUniforms: CadSharedUniformNodes): InstancedMeshNodeMaterial {
  return new InstancedMeshNodeMaterial(sharedUniforms, 'Primitives (Nuts) (WebGPU)');
}

export function createQuadNodeMaterial(sharedUniforms: CadSharedUniformNodes): InstancedMeshNodeMaterial {
  return new InstancedMeshNodeMaterial(sharedUniforms, 'Primitives (Quads) (WebGPU)');
}
