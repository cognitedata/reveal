precision highp float;

// Separable, depth-aware (bilateral) blur for the SSAO buffer.
//
// Run once per axis (`direction` = (1,0) then (0,1)). Compared with the old
// fused 25-tap non-separable Gaussian in the blit, this is cheaper (two 1D
// passes of a handful of taps) and edge-aware: samples whose reconstructed view
// depth differs strongly from the centre are down-weighted, so ambient occlusion
// no longer bleeds across silhouettes / depth discontinuities.

uniform sampler2D tSsao;
uniform sampler2D tDepth;
uniform mat4 inverseProjectionMatrix;
// Blur direction in pixels: (1,0) for horizontal, (0,1) for vertical.
uniform vec2 direction;

in vec2 vUv;

out vec4 outputColor;

// View-space Z (negative in front of the camera) reconstructed from the depth
// buffer. Used only for the bilateral depth weight, so we skip the full position.
float viewZFromDepth(float depth, vec2 uv) {
  float z = depth * 2.0 - 1.0;
  vec4 clip = vec4(uv * 2.0 - 1.0, z, 1.0);
  vec4 view = inverseProjectionMatrix * clip;
  return view.z / view.w;
}

void main() {
  ivec2 texSize = textureSize(tDepth, 0);
  vec2 texel = direction / vec2(float(texSize.x), float(texSize.y));

  float centerDepth = texture(tDepth, vUv).r;
  float centerZ = viewZFromDepth(centerDepth, vUv);

  // Depth similarity scale, relative to distance so it is roughly scene-scale
  // independent (a fixed fraction of the centre depth).
  float depthSigma = max(0.05 * abs(centerZ), 0.02);
  float invTwoSigmaSqr = 1.0 / (2.0 * depthSigma * depthSigma);

  const int RADIUS = 4;
  // Spatial Gaussian (sigma ~= 2 px), weight for tap i is exp(-i^2 / (2*sigma^2)).
  float spatial[5];
  spatial[0] = 1.0;
  spatial[1] = 0.8824969;
  spatial[2] = 0.6065307;
  spatial[3] = 0.3246525;
  spatial[4] = 0.1353353;

  float aoSum = texture(tSsao, vUv).r * spatial[0];
  float weightSum = spatial[0];

  for (int i = 1; i <= RADIUS; i++) {
    float sw = spatial[i];

    vec2 uvPos = vUv + texel * float(i);
    float zPos = viewZFromDepth(texture(tDepth, uvPos).r, uvPos);
    float wPos = sw * exp(-(zPos - centerZ) * (zPos - centerZ) * invTwoSigmaSqr);
    aoSum += texture(tSsao, uvPos).r * wPos;
    weightSum += wPos;

    vec2 uvNeg = vUv - texel * float(i);
    float zNeg = viewZFromDepth(texture(tDepth, uvNeg).r, uvNeg);
    float wNeg = sw * exp(-(zNeg - centerZ) * (zNeg - centerZ) * invTwoSigmaSqr);
    aoSum += texture(tSsao, uvNeg).r * wNeg;
    weightSum += wNeg;
  }

  float ao = aoSum / max(weightSum, 1e-4);
  outputColor = vec4(ao);
}
