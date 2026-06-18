/*!
 * Copyright 2026 Cognite AS
 */

import { CustomBlending, OneFactor, ZeroFactor } from 'three';
import {
  attribute,
  cameraProjectionMatrix,
  Discard,
  float,
  Fn,
  modelViewMatrix,
  normalLocal,
  normalView,
  positionLocal,
  vec2,
  vec3,
  vec4,
  varying
} from 'three/tsl';

import { determineMatrixOverride, determineNodeAppearance, determineVisibility, nodeAppearanceFromTexel, determineColor } from '../base/cadAppearance';
import { GeometryTypePrimitive } from '../base/geometryTypes';
import { updateFragmentColor } from '../base/updateFragmentColor';
import { packTreeIndex, unpackTreeIndex } from '../base/treeIndexPacking';
import { CadNodeMaterial } from '../CadNodeMaterial';
import type { CadSharedUniformNodes } from '../CadSharedUniforms';
import { createInstancedCadVertexContext } from './cadVertexContext';
import { createGeneralCylinderNodeMaterial as createGeneralCylinderNodeMaterialImpl } from './GeneralCylinderNodeMaterial';
import { InstancedMeshNodeMaterial } from './InstancedMeshNodeMaterial';

function createCircleNodeMaterialImpl(sharedUniforms: CadSharedUniformNodes): CadNodeMaterial {
  const material = new CadNodeMaterial(sharedUniforms, 'Primitives (Circle) (WebGPU)');

  const treeIndexAttr = attribute('a_treeIndex', 'float');
  const colorAttr = attribute('a_color', 'vec3');
  const normalAttr = attribute('a_normal', 'vec3');
  const instanceMatrixAttr = attribute('a_instanceMatrix', 'mat4');

  const vXy = varying(vec2(), 'v_xy');
  const vColor = varying(vec3(), 'v_color');
  const vNormal = varying(vec3(), 'v_normal');
  const vViewPosition = varying(vec3(), 'vViewPosition');
  const vNodeAppearanceTexel = varying(vec4(), 'v_nodeAppearanceTexel');
  const vTreeIndexPacked = varying(vec2(), 'v_treeIndexPacked');

  material.positionNode = Fn(() => {
    const appearance = determineNodeAppearance(
      sharedUniforms.colorDataTexture,
      sharedUniforms.treeIndexTextureSize,
      treeIndexAttr
    );
    const visible = determineVisibility(appearance, sharedUniforms.renderMode);
    const offscreen = vec4(2.0, 2.0, 2.0, 1.0);

    vNodeAppearanceTexel.assign(appearance.colorTexel);
    vTreeIndexPacked.assign(packTreeIndex(treeIndexAttr));
    vXy.assign(vec2(positionLocal.x, positionLocal.y));
    vColor.assign(colorAttr);

    const treeIndexWorldTransform = determineMatrixOverride(
      treeIndexAttr,
      sharedUniforms.treeIndexTextureSize,
      sharedUniforms.transformOverrideIndexTexture,
      sharedUniforms.transformOverrideTextureSize,
      sharedUniforms.transformOverrideTexture
    );

    const transformed = instanceMatrixAttr.mul(vec4(positionLocal, 1.0)).xyz;
    const mvPosition = modelViewMatrix.mul(treeIndexWorldTransform).mul(vec4(transformed, 1.0));
    vNormal.assign(normalLocal);
    vViewPosition.assign(mvPosition.xyz);

    return visible.select(cameraProjectionMatrix.mul(mvPosition), offscreen);
  })();

  material.fragmentNode = Fn(() => {
    const treeIndex = unpackTreeIndex(vTreeIndexPacked);
    const dist = vXy.dot(vXy);
    const normal = vNormal.normalize();
    dist.greaterThan(0.25).discard();

    const appearance = nodeAppearanceFromTexel(vNodeAppearanceTexel);
    const color = determineColor(vColor, appearance);

    return updateFragmentColor(
      sharedUniforms.renderMode,
      color,
      treeIndex,
      normal,
      float(0),
      sharedUniforms.matCapTexture,
      float(GeometryTypePrimitive),
      float(0)
    );
  })();

  material.blending = CustomBlending;
  material.blendDst = ZeroFactor;
  material.blendDstAlpha = OneFactor;
  material.blendSrc = OneFactor;
  material.blendSrcAlpha = ZeroFactor;

  return material;
}

export function createCircleNodeMaterial(sharedUniforms: CadSharedUniformNodes): CadNodeMaterial {
  return createCircleNodeMaterialImpl(sharedUniforms);
}

export function createAnalyticPrimitiveNodeMaterial(
  sharedUniforms: CadSharedUniformNodes,
  name: string
): InstancedMeshNodeMaterial {
  // Analytic primitives with custom depth will be refined in phase 3;
  // for now use instanced mesh path as placeholder wired through the same vertex context.
  return new InstancedMeshNodeMaterial(sharedUniforms, `${name} (WebGPU)`);
}

export function createConeNodeMaterial(sharedUniforms: CadSharedUniformNodes): InstancedMeshNodeMaterial {
  return createAnalyticPrimitiveNodeMaterial(sharedUniforms, 'Primitives (Cone)');
}

export function createEccentricConeNodeMaterial(sharedUniforms: CadSharedUniformNodes): InstancedMeshNodeMaterial {
  return createAnalyticPrimitiveNodeMaterial(sharedUniforms, 'Primitives (Eccentric cone)');
}

export function createEllipsoidSegmentNodeMaterial(sharedUniforms: CadSharedUniformNodes): InstancedMeshNodeMaterial {
  return createAnalyticPrimitiveNodeMaterial(sharedUniforms, 'Primitives (Ellipsoid segments)');
}

export function createGeneralCylinderNodeMaterial(sharedUniforms: CadSharedUniformNodes): CadNodeMaterial {
  return createGeneralCylinderNodeMaterialImpl(sharedUniforms);
}

export function createGeneralRingNodeMaterial(sharedUniforms: CadSharedUniformNodes): InstancedMeshNodeMaterial {
  return createAnalyticPrimitiveNodeMaterial(sharedUniforms, 'Primitives (General rings)');
}

export function createTrapeziumNodeMaterial(sharedUniforms: CadSharedUniformNodes): InstancedMeshNodeMaterial {
  return createAnalyticPrimitiveNodeMaterial(sharedUniforms, 'Primitives (Trapezium)');
}

export function createTorusSegmentNodeMaterial(sharedUniforms: CadSharedUniformNodes): InstancedMeshNodeMaterial {
  return createAnalyticPrimitiveNodeMaterial(sharedUniforms, 'Primitives (Torus segment)');
}
