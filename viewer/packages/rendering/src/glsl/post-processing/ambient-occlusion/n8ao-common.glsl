// Ambient occlusion based on N8AO by N8python (https://github.com/N8python/n8ao), adapted to Reveal's
// render pipeline. N8AO is dedicated to the public domain under CC0 1.0 Universal
// (https://creativecommons.org/publicdomain/zero/1.0/); its author asks to be credited when it's used.
//
// Shared helpers for the ambient occlusion passes. All positions are in view space, reconstructed from
// standard [0, 1] depth with the inverse projection matrix of the camera being rendered, so asymmetric
// (e.g. WebXR) frusta and arbitrary near/far planes are supported. Pixel coordinates are derived from vUv
// and texture sizes, never gl_FragCoord, so the passes don't depend on the viewport offset.

uniform mat4 cameraProjectionMatrix;
uniform mat4 cameraInverseProjectionMatrix;

bool isBackground(float depth) {
  return depth >= 1.0;
}

vec3 viewPositionFromDepth(float depth, vec2 uv) {
  vec4 viewPosition = cameraInverseProjectionMatrix * vec4(vec3(uv, depth) * 2.0 - 1.0, 1.0);
  return viewPosition.xyz / viewPosition.w;
}

// View space z of a depth buffer value. The z and w rows of the inverse projection matrix don't depend on
// clip space x and y, for both perspective (also off-axis) and orthographic projections.
float viewZFromDepth(float depth) {
  float ndcZ = depth * 2.0 - 1.0;
  mat4 Q = cameraInverseProjectionMatrix;
  return (Q[2][2] * ndcZ + Q[3][2]) / (Q[2][3] * ndcZ + Q[3][3]);
}

// View space distance covered by `pixels` pixels horizontally at the given depth. Used to convert
// screen space radii to view space.
float viewSpaceLengthOfPixels(vec3 viewPosition, float depth, vec2 uv, float pixels, vec2 resolution) {
  return distance(viewPosition, viewPositionFromDepth(depth, uv + vec2(pixels / resolution.x, 0.0)));
}

float fetchDepth(highp sampler2D depthTexture, ivec2 pixel, ivec2 size) {
  return texelFetch(depthTexture, clamp(pixel, ivec2(0), size - 1), 0).x;
}

// Normal reconstructed from depth. For each axis, uses the neighbour that best continues the surface
// (smallest second order depth difference), which avoids smearing normals across depth discontinuities.
vec3 computeViewNormal(highp sampler2D depthTexture, ivec2 pixel) {
  ivec2 size = textureSize(depthTexture, 0);
  vec2 resolution = vec2(size);
  float c0 = fetchDepth(depthTexture, pixel, size);
  float l2 = fetchDepth(depthTexture, pixel - ivec2(2, 0), size);
  float l1 = fetchDepth(depthTexture, pixel - ivec2(1, 0), size);
  float r1 = fetchDepth(depthTexture, pixel + ivec2(1, 0), size);
  float r2 = fetchDepth(depthTexture, pixel + ivec2(2, 0), size);
  float b2 = fetchDepth(depthTexture, pixel - ivec2(0, 2), size);
  float b1 = fetchDepth(depthTexture, pixel - ivec2(0, 1), size);
  float t1 = fetchDepth(depthTexture, pixel + ivec2(0, 1), size);
  float t2 = fetchDepth(depthTexture, pixel + ivec2(0, 2), size);

  float dl = abs((2.0 * l1 - l2) - c0);
  float dr = abs((2.0 * r1 - r2) - c0);
  float db = abs((2.0 * b1 - b2) - c0);
  float dt = abs((2.0 * t1 - t2) - c0);

  vec2 uv = (vec2(pixel) + 0.5) / resolution;
  vec2 dx = vec2(1.0 / resolution.x, 0.0);
  vec2 dy = vec2(0.0, 1.0 / resolution.y);
  vec3 center = viewPositionFromDepth(c0, uv);

  vec3 dpdx = (dl < dr) ? center - viewPositionFromDepth(l1, uv - dx) : viewPositionFromDepth(r1, uv + dx) - center;
  vec3 dpdy = (db < dt) ? center - viewPositionFromDepth(b1, uv - dy) : viewPositionFromDepth(t1, uv + dy) - center;

  return normalize(cross(dpdx, dpdy));
}

// Interleaved gradient noise (Jimenez 2014), used instead of N8AO's blue noise texture to randomize sample
// rotations per pixel. The pattern is designed to be removed by small spatial filters like the denoise pass.
float interleavedGradientNoise(vec2 pixel) {
  return fract(52.9829189 * fract(dot(pixel, vec2(0.06711056, 0.00583715))));
}

// Octahedral encoding of unit vectors, used to store normals in two channels.
vec2 encodeNormal(vec3 n) {
  n /= abs(n.x) + abs(n.y) + abs(n.z);
  vec2 e = n.xy;
  if (n.z < 0.0) {
    e = (1.0 - abs(n.yx)) * vec2(n.x >= 0.0 ? 1.0 : -1.0, n.y >= 0.0 ? 1.0 : -1.0);
  }
  return e;
}

vec3 decodeNormal(vec2 e) {
  vec3 n = vec3(e, 1.0 - abs(e.x) - abs(e.y));
  float t = max(-n.z, 0.0);
  n.x += n.x >= 0.0 ? -t : t;
  n.y += n.y >= 0.0 ? -t : t;
  return normalize(n);
}

// The depth downsample pass picks one of the four full resolution pixels covered by a half resolution pixel and
// stores which one, so positions can be reconstructed at the exact location the depth was taken from.
ivec2 downsampledPixelOffset(float subpixelIndex) {
  int index = int(subpixelIndex + 0.5);
  return ivec2(index % 2, index / 2);
}

// UV of the full resolution pixel a half resolution depth texel was taken from.
vec2 downsampledTexelUv(ivec2 halfPixel, float subpixelIndex, vec2 fullResolution) {
  return (vec2(halfPixel * 2 + downsampledPixelOffset(subpixelIndex)) + 0.5) / fullResolution;
}

float applyExponent(float occlusion, float exponent) {
  return exponent == 1.0 ? occlusion : pow(occlusion, exponent);
}
