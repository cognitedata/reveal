/*!
 * Copyright 2026 Cognite AS
 */

import { CustomBlending, OneFactor, ZeroFactor } from 'three';
import { attribute, Discard, Fn, float, positionGeometry, varying, vec2, vec3 } from 'three/tsl';

import { nodeAppearanceFromTexel, determineColor } from '../base/cadAppearance';
import { GeometryTypeTriangleMesh } from '../base/geometryTypes';
import { updateFragmentColor } from '../base/updateFragmentColor';
import { unpackTreeIndex } from '../base/treeIndexPacking';
import { CadNodeMaterial } from '../CadNodeMaterial';
import type { CadSharedUniformNodes } from '../CadSharedUniforms';
import { derivateNormal } from '../math/derivateNormal';
import { createCadVertexContext } from './cadVertexContext';

export class TriangleMeshNodeMaterial extends CadNodeMaterial {
  constructor(sharedUniforms: CadSharedUniformNodes, isTextured = false) {
    super(sharedUniforms, isTextured ? 'Triangle meshes (WebGPU)' : 'Triangle meshes (WebGPU)');

    const colorAttr = isTextured ? undefined : attribute('color', 'vec3');
    const uvAttr = isTextured ? attribute('uv', 'vec2') : undefined;
    const treeIndexAttr = attribute('treeIndex', 'float');

    const { vViewPosition, vNodeAppearanceTexel, vTreeIndexPacked, setupVertex } = createCadVertexContext(
      sharedUniforms,
      'treeIndex'
    );

    const vColor = isTextured ? undefined : varying(vec3(), 'v_color');
    const vUv = isTextured ? varying(vec2(), 'v_uv') : undefined;

    if (!isTextured && vColor !== undefined && colorAttr !== undefined) {
      const originalSetup = setupVertex;
      this.positionNode = Fn(() => {
        vColor.assign(colorAttr);
        if (isTextured && vUv !== undefined && uvAttr !== undefined) {
          vUv.assign(uvAttr);
        }
        return originalSetup();
      })();
    } else if (isTextured && vUv !== undefined && uvAttr !== undefined) {
      const originalSetup = setupVertex;
      this.positionNode = Fn(() => {
        vUv.assign(uvAttr);
        return originalSetup();
      })();
    } else {
      this.positionNode = setupVertex();
    }

    this.fragmentNode = Fn(() => {
      const treeIndex = unpackTreeIndex(vTreeIndexPacked);
      const appearance = nodeAppearanceFromTexel(vNodeAppearanceTexel);
      const normal = derivateNormal(vViewPosition);

      const color = isTextured
        ? determineColor(vec3(1, 1, 1), appearance)
        : determineColor(vColor, appearance);

      return updateFragmentColor(
        sharedUniforms.renderMode,
        color,
        treeIndex,
        normal,
        positionGeometry.z,
        sharedUniforms.matCapTexture,
        float(GeometryTypeTriangleMesh),
        float(isTextured ? 1 : 0)
      );
    })();

    this.blending = CustomBlending;
    this.blendDst = ZeroFactor;
    this.blendDstAlpha = OneFactor;
    this.blendSrc = OneFactor;
    this.blendSrcAlpha = ZeroFactor;
  }
}

export function createTriangleMeshNodeMaterial(sharedUniforms: CadSharedUniformNodes): TriangleMeshNodeMaterial {
  return new TriangleMeshNodeMaterial(sharedUniforms, false);
}

export function createTexturedTriangleMeshNodeMaterial(sharedUniforms: CadSharedUniformNodes): TriangleMeshNodeMaterial {
  return new TriangleMeshNodeMaterial(sharedUniforms, true);
}
