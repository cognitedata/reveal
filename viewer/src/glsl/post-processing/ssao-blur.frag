// Copyright Cognite (C) 2019 Cognite
//
// Efficient Gaussian blur based on technique described by Daniel Rákos in
// http://rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/
//
#pragma glslify: rgb2hsv = require('../color/rgb2hsv.glsl')
#pragma glslify: hsv2rgb = require('../color/hsv2rgb.glsl')

#include <packing>

varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform sampler2D ssaoTexture;

uniform vec2 size;

vec3 unpack(float a) {
  float h = (a > 0.1) ? (a - 0.1) / 0.9 : 0.0;
  float s = (a > 0.1) ? 1.0 : 0.0;
  float v = (a > 0.1) ? 1.0 : a / 0.1;
  return hsv2rgb(vec3(h, s, v));
}

const bool blur = true;

void main() {
  vec3 blurredAO;
  if (blur) {
    vec3 result = 0.5 * (
      2.0 * texture2D(ssaoTexture, vUv).rgb * 0.2270270270 +
      texture2D(ssaoTexture, vUv + vec2(1.3746153846, 0.0) / size.x).rgb * 0.3162162162 +
      texture2D(ssaoTexture, vUv + vec2(3.2307692308, 0.0) / size.x).rgb * 0.0702702703 +
      texture2D(ssaoTexture, vUv - vec2(1.3746153846, 0.0) / size.x).rgb * 0.3162162162 +
      texture2D(ssaoTexture, vUv - vec2(3.2307692308, 0.0) / size.x).rgb * 0.0702702703 +
      texture2D(ssaoTexture, vUv + vec2(0.0, 1.3746153846) / size.y).rgb * 0.3162162162 +
      texture2D(ssaoTexture, vUv + vec2(0.0, 3.2307692308) / size.y).rgb * 0.0702702703 +
      texture2D(ssaoTexture, vUv - vec2(0.0, 1.3746153846) / size.y).rgb * 0.3162162162 +
      texture2D(ssaoTexture, vUv - vec2(0.0, 3.2307692308) / size.y).rgb * 0.0702702703
    );
    blurredAO = result;
  } else {
    blurredAO = texture2D(ssaoTexture, vUv).rgb;
  }
  vec4 packedColor = texture2D(tDiffuse, vUv);
  vec3 colorRgb = unpack(packedColor.a);
  //vec3 colorHsv = vec3(packedColor.x, 1.0, packedColor.y);
  //vec3 colorRgb = hsv2rgb(colorHsv);
  //vec2 normalRg = vec2(packedColor.z, packedColor.w);
  //vec3 normal = unpackRGToNormal(normalRg);
  gl_FragColor = vec4(vec3(colorRgb.rgb * blurredAO), 1.0);
  //gl_FragColor = vec4(colorRgb, 1.0);
  //gl_FragColor = vec4(normal, 1.0);
  //gl_FragColor = vec4(packedColor.rgb, 1.0);
  //gl_FragColor = vec4(packNormalToRGB(normal), 1.0);
}

