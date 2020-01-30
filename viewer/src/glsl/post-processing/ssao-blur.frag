// Copyright Cognite (C) 2019 Cognite
//
// Efficient Gaussian blur based on technique described by Daniel Rákos in
// http://rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/

varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform sampler2D ssaoTexture;

uniform vec2 size;

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
  vec4 color = texture2D(tDiffuse, vUv);
  gl_FragColor = vec4(vec3(color.rgb * blurredAO), color.a);
}

