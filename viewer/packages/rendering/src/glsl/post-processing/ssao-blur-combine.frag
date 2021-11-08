// Copyright Cognite (C) 2021 Cognite
//
//

varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform sampler2D tAmbientOcclusion;

uniform vec2 resolution;

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

  gl_FragColor = vec4(texture2D(tDiffuse, vUv).rgb * blurredAO, 1.0);
}
