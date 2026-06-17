/*!
 * Copyright 2026 Cognite AS
 */

import {
  Fn,
  float,
  int,
  max,
  min,
  vec2,
  vec3,
  vec4
} from 'three/tsl';

import {
  RenderTypeColor,
  RenderTypeDepth,
  RenderTypeDepthBufferOnly,
  RenderTypeEffects,
  RenderTypeGeometryType,
  RenderTypeGhost,
  RenderTypeLOD,
  RenderTypeNormal,
  RenderTypePackColorAndNormal,
  RenderTypeTreeIndex
} from './renderModeConstants';
import {
  GeometryTypeInstancedMesh,
  GeometryTypePrimitive,
  GeometryTypeQuad,
  GeometryTypeTriangleMesh
} from './geometryTypes';
import { hsv2rgb, rgb2hsv } from '../color/hsvConversion';
import { packIntToColor } from '../color/packIntToColor';
import { packDepthToRGBA, packNormalToRgb } from '../math/derivateNormal';

export const updateFragmentColor = Fn(
  ([renderMode, color, treeIndex, normal, depth, matCapTexture, geometryType, isTextured]) => {
    const isColorOrEffects = renderMode.equal(RenderTypeColor).or(renderMode.equal(RenderTypeEffects));
    const hsv = rgb2hsv(color.rgb);
    const brightenedHsv = vec3(hsv.x, hsv.y, min(hsv.z.mul(0.5).add(0.5), 1.0));
    const colorRGB = isTextured.select(color.rgb, hsv2rgb(brightenedHsv));
    const amplitude = max(float(0.0), normal.z);
    const albedo = vec4(colorRGB.mul(0.4 + 0.6 * amplitude), 1.0);
    const cap = normal.xy.mul(0.5).add(0.5);
    const mc = vec4(matCapTexture(cap).rgb, 1.0);
    const colorEffectsOutput = vec4(albedo.rgb.mul(mc.rgb).mul(1.7), color.a);

    const ghostAmplitude = max(float(0.0), normal.z);
    const ghostS = 0.4 + 0.6 * ghostAmplitude;
    const ghostOutput = vec4(vec3(ghostS), 0.3);

    const depthBufferOnlyOutput = vec4(1.0, 0.0, 1.0, 1.0);

    const packColorNormalHsv = rgb2hsv(color.rgb);
    const packColorNormalOutput = vec4(packNormalToRgb(normal), color.a);

    const normalOutput = vec4(packNormalToRgb(normal), color.a);
    const treeIndexOutput = vec4(packIntToColor(treeIndex), color.a);
    const depthOutput = packDepthToRGBA(depth);

    const isHighDetail = geometryType.notEqual(GeometryTypeQuad);
    const lodCap = normal.xy.mul(0.5).add(0.5);
    const lodMc = matCapTexture(lodCap).rgb.mul(1.5);
    const lodOutput = isHighDetail.select(vec4(vec3(0.0, 1.0, 0.0).mul(lodMc), color.a), vec4(vec3(1.0, 1.0, 0.0).mul(lodMc), color.a));

    const geometryCap = normal.xy.mul(0.5).add(0.5);
    const geometryMc = matCapTexture(geometryCap).rgb;
    const geometryColor =
      float(geometryType.equal(GeometryTypeQuad)).mul(vec3(1.0, 0.0, 0.0))
        .add(float(geometryType.equal(GeometryTypePrimitive)).mul(vec3(0.0, 1.0, 0.0)))
        .add(float(geometryType.equal(GeometryTypeTriangleMesh)).mul(vec3(0.0, 0.0, 1.0)))
        .add(float(geometryType.equal(GeometryTypeInstancedMesh)).mul(vec3(1.0, 1.0, 0.0)));
    const geometryTypeOutput = vec4(geometryColor.mul(geometryMc), color.a);

    const unknownOutput = vec4(1.0, 0.0, 1.0, 1.0);

    let output = unknownOutput;
    output = renderMode.equal(RenderTypeColor).or(renderMode.equal(RenderTypeEffects)).select(colorEffectsOutput, output);
    output = renderMode.equal(RenderTypeGhost).select(ghostOutput, output);
    output = renderMode.equal(RenderTypeDepthBufferOnly).select(depthBufferOnlyOutput, output);
    output = renderMode.equal(RenderTypePackColorAndNormal).select(packColorNormalOutput, output);
    output = renderMode.equal(RenderTypeNormal).select(normalOutput, output);
    output = renderMode.equal(RenderTypeTreeIndex).select(treeIndexOutput, output);
    output = renderMode.equal(RenderTypeDepth).select(depthOutput, output);
    output = renderMode.equal(RenderTypeLOD).select(lodOutput, output);
    output = renderMode.equal(RenderTypeGeometryType).select(geometryTypeOutput, output);

    return output;
  }
);
