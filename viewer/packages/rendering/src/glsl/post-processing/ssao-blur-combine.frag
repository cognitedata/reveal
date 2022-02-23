// Copyright Cognite (C) 2021 Cognite
//
// Efficient Gaussian blur based on technique described by Daniel Rákos in
// http://rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/
// generalized for two dimensions

precision highp float;

#define texture2D texture

in vec2 vUv;

uniform sampler2D tDiffuse;
uniform sampler2D tAmbientOcclusion;

uniform vec2 resolution;

out vec4 outputColor;

void main() {
  float blurredAO =
      texture2D(tAmbientOcclusion, vUv + vec2(-3.1111111, -3.1111111) / resolution).r * 0.0012360 +
      texture2D(tAmbientOcclusion, vUv + vec2(-1.3333333, -3.1111111) / resolution).r * 0.0115356 +
      texture2D(tAmbientOcclusion, vUv + vec2(-3.1111111, -1.3333333) / resolution).r * 0.0115356 +
      texture2D(tAmbientOcclusion, vUv + vec2(-1.3333333, -1.3333333) / resolution).r * 0.1076660 +
      texture2D(tAmbientOcclusion, vUv + vec2(0.0000000, -3.1111111) / resolution).r * 0.0096130 +
      texture2D(tAmbientOcclusion, vUv + vec2(0.0000000, -1.3333333) / resolution).r * 0.0897217 +
      texture2D(tAmbientOcclusion, vUv + vec2(1.3333333, -3.1111111) / resolution).r * 0.0115356 +
      texture2D(tAmbientOcclusion, vUv + vec2(3.1111111, -3.1111111) / resolution).r * 0.0012360 +
      texture2D(tAmbientOcclusion, vUv + vec2(1.3333333, -1.3333333) / resolution).r * 0.1076660 +
      texture2D(tAmbientOcclusion, vUv + vec2(3.1111111, -1.3333333) / resolution).r * 0.0115356 +
      texture2D(tAmbientOcclusion, vUv + vec2(-3.1111111, 0.0000000) / resolution).r * 0.0096130 +
      texture2D(tAmbientOcclusion, vUv + vec2(-1.3333333, 0.0000000) / resolution).r * 0.0897217 +
      texture2D(tAmbientOcclusion, vUv + vec2(-3.1111111, 1.3333333) / resolution).r * 0.0115356 +
      texture2D(tAmbientOcclusion, vUv + vec2(-1.3333333, 1.3333333) / resolution).r * 0.1076660 +
      texture2D(tAmbientOcclusion, vUv + vec2(-3.1111111, 3.1111111) / resolution).r * 0.0012360 +
      texture2D(tAmbientOcclusion, vUv + vec2(-1.3333333, 3.1111111) / resolution).r * 0.0115356 +
      texture2D(tAmbientOcclusion, vUv + vec2(0.0000000, 1.3333333) / resolution).r * 0.0897217 +
      texture2D(tAmbientOcclusion, vUv + vec2(0.0000000, 3.1111111) / resolution).r * 0.0096130 +
      texture2D(tAmbientOcclusion, vUv + vec2(1.3333333, 1.3333333) / resolution).r * 0.1076660 +
      texture2D(tAmbientOcclusion, vUv + vec2(3.1111111, 1.3333333) / resolution).r * 0.0115356 +
      texture2D(tAmbientOcclusion, vUv + vec2(1.3333333, 3.1111111) / resolution).r * 0.0115356 +
      texture2D(tAmbientOcclusion, vUv + vec2(3.1111111, 3.1111111) / resolution).r * 0.0012360 +
      texture2D(tAmbientOcclusion, vUv + vec2(1.3333333, 0.0000000) / resolution).r * 0.0897217 +
      texture2D(tAmbientOcclusion, vUv + vec2(3.1111111, 0.0000000) / resolution).r * 0.0096130 +
      texture2D(tAmbientOcclusion, vUv).r * 0.0747681;

  outputColor = vec4(texture2D(tDiffuse, vUv).rgb * blurredAO, 1.0);
}
