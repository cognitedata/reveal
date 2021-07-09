// Copyright Cognite (C) 2019 Cognite
//
// Efficient Gaussian blur based on technique described by Daniel Rákos in
// http://rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/
//

varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform sampler2D tAmbientOcclusion;

uniform vec2 resolution;

void main() {
  float blurredAO = 0.5 * (
    2.0 * texture2D(tAmbientOcclusion, vUv).r * 0.2270270270 +
    texture2D(tAmbientOcclusion, vUv + vec2(1.3746153846, 0.0) / resolution.x).r * 0.3162162162 +
    texture2D(tAmbientOcclusion, vUv + vec2(3.2307692308, 0.0) / resolution.x).r * 0.0702702703 +
    texture2D(tAmbientOcclusion, vUv - vec2(1.3746153846, 0.0) / resolution.x).r * 0.3162162162 +
    texture2D(tAmbientOcclusion, vUv - vec2(3.2307692308, 0.0) / resolution.x).r * 0.0702702703 +
    texture2D(tAmbientOcclusion, vUv + vec2(0.0, 1.3746153846) / resolution.y).r * 0.3162162162 +
    texture2D(tAmbientOcclusion, vUv + vec2(0.0, 3.2307692308) / resolution.y).r * 0.0702702703 +
    texture2D(tAmbientOcclusion, vUv - vec2(0.0, 1.3746153846) / resolution.y).r * 0.3162162162 +
    texture2D(tAmbientOcclusion, vUv - vec2(0.0, 3.2307692308) / resolution.y).r * 0.0702702703
  );

  gl_FragColor = vec4(texture2D(tDiffuse, vUv).rgb * blurredAO, 1.0);
}

