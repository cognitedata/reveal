/*!
 * Copyright 2026 Cognite AS
 */

import {
  attribute,
  cameraProjectionMatrix,
  Discard,
  float,
  Fn,
  modelViewMatrix,
  positionLocal,
  vec2,
  vec3,
  vec4,
  varying
} from 'three/tsl';

import { determineMatrixOverride, determineNodeAppearance, determineVisibility } from '../base/cadAppearance';
import { packTreeIndex } from '../base/treeIndexPacking';
import type { CadSharedUniformNodes } from '../CadSharedUniforms';

export function createCadVertexContext(sharedUniforms: CadSharedUniformNodes, treeIndexAttributeName: string) {
  const treeIndexAttr = attribute(treeIndexAttributeName, 'float');
  const vViewPosition = varying(vec3(), 'v_viewPosition');
  const vNodeAppearanceTexel = varying(vec4(), 'v_nodeAppearanceTexel');
  const vTreeIndexPacked = varying(vec2(), 'v_treeIndexPacked');
  const vColor = varying(vec3(), 'v_color');

  const setupVertex = Fn(() => {
    const appearance = determineNodeAppearance(
      sharedUniforms.colorDataTexture,
      sharedUniforms.treeIndexTextureSize,
      treeIndexAttr
    );
    const visible = determineVisibility(appearance, sharedUniforms.renderMode);
    const offscreen = vec4(2.0, 2.0, 2.0, 1.0);

    vNodeAppearanceTexel.assign(appearance.colorTexel);
    vTreeIndexPacked.assign(packTreeIndex(treeIndexAttr));

    const treeIndexWorldTransform = determineMatrixOverride(
      treeIndexAttr,
      sharedUniforms.treeIndexTextureSize,
      sharedUniforms.transformOverrideIndexTexture,
      sharedUniforms.transformOverrideTextureSize,
      sharedUniforms.transformOverrideTexture
    );

    const modelViewPosition = modelViewMatrix.mul(treeIndexWorldTransform).mul(vec4(positionLocal, 1.0));
    vViewPosition.assign(modelViewPosition.xyz);

    return visible.select(cameraProjectionMatrix.mul(modelViewPosition), offscreen);
  });

  return {
    treeIndexAttr,
    vViewPosition,
    vNodeAppearanceTexel,
    vTreeIndexPacked,
    vColor,
    setupVertex
  };
}

export function createInstancedCadVertexContext(sharedUniforms: CadSharedUniformNodes) {
  const treeIndexAttr = attribute('a_treeIndex', 'float');
  const colorAttr = attribute('a_color', 'vec3');
  const instanceMatrixAttr = attribute('a_instanceMatrix', 'mat4');

  const vViewPosition = varying(vec3(), 'v_viewPosition');
  const vNodeAppearanceTexel = varying(vec4(), 'v_nodeAppearanceTexel');
  const vTreeIndexPacked = varying(vec2(), 'v_treeIndexPacked');
  const vColor = varying(vec3(), 'v_color');

  const setupVertex = Fn(() => {
    const appearance = determineNodeAppearance(
      sharedUniforms.colorDataTexture,
      sharedUniforms.treeIndexTextureSize,
      treeIndexAttr
    );
    const visible = determineVisibility(appearance, sharedUniforms.renderMode);
    const offscreen = vec4(2.0, 2.0, 2.0, 1.0);

    vNodeAppearanceTexel.assign(appearance.colorTexel);
    vTreeIndexPacked.assign(packTreeIndex(treeIndexAttr));
    vColor.assign(colorAttr);

    const treeIndexWorldTransform = determineMatrixOverride(
      treeIndexAttr,
      sharedUniforms.treeIndexTextureSize,
      sharedUniforms.transformOverrideIndexTexture,
      sharedUniforms.transformOverrideTextureSize,
      sharedUniforms.transformOverrideTexture
    );

    const transformed = instanceMatrixAttr.mul(vec4(positionLocal, 1.0)).xyz;
    const modelViewPosition = modelViewMatrix.mul(treeIndexWorldTransform).mul(vec4(transformed, 1.0));
    vViewPosition.assign(modelViewPosition.xyz);

    return visible.select(cameraProjectionMatrix.mul(modelViewPosition), offscreen);
  });

  return {
    treeIndexAttr,
    vViewPosition,
    vNodeAppearanceTexel,
    vTreeIndexPacked,
    vColor,
    setupVertex
  };
}

export { Discard, float, Fn, vec3, vec4, varying };
