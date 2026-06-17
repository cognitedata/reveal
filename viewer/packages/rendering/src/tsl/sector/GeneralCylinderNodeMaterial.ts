/*!
 * Copyright 2026 Cognite AS
 */

import { CustomBlending, OneFactor, ZeroFactor } from 'three';
import {
  Discard,
  Fn,
  If,
  PI2,
  acos,
  atan,
  attribute,
  cameraProjectionMatrix,
  cross,
  dot,
  float,
  length,
  max,
  min,
  modelViewMatrix,
  normalize,
  positionLocal,
  sqrt,
  tan,
  vec2,
  vec3,
  vec4,
  varying
} from 'three/tsl';

import { packTreeIndex } from '../base/treeIndexPacking';
import { hsv2rgb, rgb2hsv } from '../color/hsvConversion';
import { CadNodeMaterial } from '../CadNodeMaterial';
import type { CadSharedUniformNodes } from '../CadSharedUniforms';

const mul3Mat4 = Fn(([M, v]) => {
  return M.mul(vec4(v, 1.0)).xyz;
});

const mulVec3ByBasis = Fn(([vector, basis0, basis1, basis2]) => {
  return vec3(dot(vector, basis0), dot(vector, basis1), dot(vector, basis2));
});

const faceforwardDir = Fn(([dir, objectToCamera]) => {
  return dot(objectToCamera, dir).greaterThan(0.0).select(dir, dir.negate());
});

const sampleMatCap = Fn(([normal]) => {
  const cap = normal.xy.mul(0.5).add(0.5);
  const nx = cap.x.mul(2.0).sub(1.0);
  const ny = cap.y.mul(2.0).sub(1.0);
  const nz = max(float(0.0), float(1.0).sub(nx.mul(nx)).sub(ny.mul(ny))).sqrt();
  return float(0.35).add(float(0.65).mul(nz));
});

export function createGeneralCylinderNodeMaterial(sharedUniforms: CadSharedUniformNodes): CadNodeMaterial {
  const material = new CadNodeMaterial(sharedUniforms, 'Primitives (General cylinder) (WebGPU)');

  const colorAttr = attribute('a_color', 'vec3');
  const centerAAttr = attribute('a_centerA', 'vec3');
  const centerBAttr = attribute('a_centerB', 'vec3');
  const radiusAttr = attribute('a_radius', 'float');
  const localXAxisAttr = attribute('a_localXAxis', 'vec3');
  const planeAAttr = attribute('a_planeA', 'vec4');
  const planeBAttr = attribute('a_planeB', 'vec4');
  const angleAttr = attribute('a_angle', 'float');
  const arcAngleAttr = attribute('a_arcAngle', 'float');

  const vTreeIndexPacked = varying(vec2(), 'v_treeIndexPacked');
  const vColor = varying(vec3(), 'v_color');
  const vViewPos = varying(vec3(), 'v_viewPos');
  const vBasis0 = varying(vec3(), 'v_basis0');
  const vBasis1 = varying(vec3(), 'v_basis1');
  const vBasis2 = varying(vec3(), 'v_basis2');
  const vCenterB = varying(vec3(), 'v_centerB');
  const vRadius = varying(float(), 'v_radius');
  const vAngles = varying(vec2(), 'v_angles');
  const vPlaneA = varying(vec4(), 'v_planeA');
  const vPlaneB = varying(vec4(), 'v_planeB');

  material.vertexNode = Fn(() => {
    vTreeIndexPacked.assign(packTreeIndex(attribute('a_treeIndex', 'float')));
    vColor.assign(colorAttr);

    const dir = normalize(centerAAttr.sub(centerBAttr));

    // Build the billboard in view space (camera is at the origin looking down -z),
    // so no cameraPosition / inverseModelMatrix uniforms are required.
    const viewCenterA = mul3Mat4(modelViewMatrix, centerAAttr);
    const viewCenterB = mul3Mat4(modelViewMatrix, centerBAttr);
    const viewCenter = viewCenterA.add(viewCenterB).mul(0.5);
    const viewAxis = normalize(viewCenterA.sub(viewCenterB));
    const halfHeightView = viewCenterA.sub(viewCenterB).length().mul(0.5);

    const radius = length(modelViewMatrix.mul(vec4(localXAxisAttr.mul(radiusAttr), 0.0)).xyz);
    vRadius.assign(radius);
    vAngles.assign(vec2(angleAttr, arcAngleAttr));

    const toCamera = normalize(viewCenter.negate());
    const lDir = faceforwardDir(viewAxis, toCamera);
    const left = normalize(cross(toCamera, lDir));
    const up = normalize(cross(left, lDir));

    // Matches the cone billboard geometry: position.x spans the axis, position.y the
    // width (left), position.z the depth toward the camera (up). The geometry is a quad
    // bent toward the camera, so this mapping must not be swapped or the cylinder ends
    // get clipped flat by the billboard edge.
    const viewBillboardPosition = viewCenter
      .add(lDir.mul(halfHeightView).mul(positionLocal.x))
      .add(left.mul(radius).mul(positionLocal.y))
      .add(up.mul(radius).mul(positionLocal.z));

    vViewPos.assign(viewBillboardPosition);
    vCenterB.assign(viewCenterB);

    const basis0 = normalize(modelViewMatrix.mul(vec4(localXAxisAttr, 0.0)).xyz);
    const basis2 = normalize(modelViewMatrix.mul(vec4(dir, 0.0)).xyz);
    const basis1 = normalize(cross(basis2, basis0));
    vBasis0.assign(basis0);
    vBasis1.assign(basis1);
    vBasis2.assign(basis2);

    // The cap planes are expressed in the cylinder-local basis frame, where the
    // axis is z and the origin is centerB. Their offsets (w) depend on view-space scale.
    const planeAngleA = acos(dot(normalize(planeAAttr.xyz), normalize(vec3(0.0, 0.0, 1.0))));
    const planeAngleB = acos(dot(normalize(planeBAttr.xyz), normalize(vec3(0.0, 0.0, -1.0))));
    vPlaneA.assign(vec4(planeAAttr.xyz, halfHeightView.mul(2.0).sub(tan(planeAngleA).mul(radius))));
    vPlaneB.assign(vec4(planeBAttr.xyz, tan(planeAngleB).mul(radius)));

    return cameraProjectionMatrix.mul(vec4(viewBillboardPosition, 1.0));
  })();

  material.fragmentNode = Fn(() => {
    // a_color is a normalized byte attribute, so it is already in [0, 1].
    const hsv = rgb2hsv(vColor);
    const brightenedHsv = vec3(hsv.x, hsv.y, min(hsv.z.mul(0.5).add(0.5), 1.0));
    const colorRGB = hsv2rgb(brightenedHsv);

    const rayTarget = vViewPos;
    const rayDirection = normalize(rayTarget);
    const rayTargetDist = length(rayTarget);

    const diff = rayTarget.sub(vCenterB);
    const E = mulVec3ByBasis(diff, vBasis0, vBasis1, vBasis2);
    const D = mulVec3ByBasis(rayDirection, vBasis0, vBasis1, vBasis2);

    const a = dot(D.xy, D.xy);
    const b = dot(E.xy, D.xy);
    const c = dot(E.xy, E.xy).sub(vRadius.mul(vRadius));
    const discriminant = b.mul(b).sub(a.mul(c));

    If(discriminant.lessThan(0.0), () => {
      Discard();
    });

    const sqrtd = sqrt(discriminant);
    const dist1 = b.negate().sub(sqrtd).div(a);
    const dist2 = b.negate().add(sqrtd).div(a);

    const planeACenter = vec3(0.0, 0.0, vPlaneA.w);
    const planeANormal = vPlaneA.xyz;
    const planeBCenter = vec3(0.0, 0.0, vPlaneB.w);
    const planeBNormal = vPlaneB.xyz;

    const dist = min(dist1, dist2).toVar();
    const intersectionPoint = E.add(dist.mul(D)).toVar();
    const theta = atan(intersectionPoint.y, intersectionPoint.x).toVar();
    theta.addAssign(theta.lessThan(vAngles.x).select(PI2, float(0.0)));
    theta.addAssign(theta.lessThan(vAngles.x).select(PI2, float(0.0)));

    const p = rayTarget.add(dist.mul(rayDirection)).toVar();
    const normalFactor = float(1.0).toVar();

    const isOutside = Fn(() => {
      return dot(intersectionPoint.sub(planeACenter), planeANormal)
        .greaterThan(0.0)
        .or(dot(intersectionPoint.sub(planeBCenter), planeBNormal).greaterThan(0.0))
        .or(theta.greaterThan(vAngles.y.add(vAngles.x)))
        .or(rayTargetDist.add(dist).lessThan(0.0));
    });

    If(isOutside(), () => {
      // The near hit is clipped away; fall back to the far hit.
      dist.assign(max(dist1, dist2));
      intersectionPoint.assign(E.add(dist.mul(D)));
      theta.assign(atan(intersectionPoint.y, intersectionPoint.x));
      theta.addAssign(theta.lessThan(float(0.0)).select(PI2, float(0.0)));
      theta.addAssign(theta.lessThan(vAngles.x).select(PI2, float(0.0)));
      p.assign(rayTarget.add(dist.mul(rayDirection)));

      If(isOutside(), () => {
        Discard();
      });

      normalFactor.assign(-1.0);
    });

    const pLocal = p.sub(vCenterB);
    const normal = normalize(pLocal.sub(vBasis2.mul(dot(pLocal, vBasis2)))).mul(normalFactor);
    const amplitude = max(float(0.0), normal.z);
    const albedo = colorRGB.mul(float(0.4).add(float(0.6).mul(amplitude)));
    const matCap = sampleMatCap(normal);

    return vec4(albedo.mul(vec3(matCap, matCap, matCap)).mul(1.7), 1.0);
  })();

  material.blending = CustomBlending;
  material.blendDst = ZeroFactor;
  material.blendDstAlpha = OneFactor;
  material.blendSrc = OneFactor;
  material.blendSrcAlpha = ZeroFactor;

  return material;
}
