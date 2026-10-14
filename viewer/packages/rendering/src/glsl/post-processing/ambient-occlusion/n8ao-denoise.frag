// Ambient occlusion based on N8AO by N8python (https://github.com/N8python/n8ao), adapted to Reveal's
// render pipeline. N8AO is dedicated to the public domain under CC0 1.0 Universal
// (https://creativecommons.org/publicdomain/zero/1.0/); its author asks to be credited when it's used.
//
// Denoises ambient occlusion with a randomly rotated Poisson disk, weighting samples by their distance
// to the tangent plane of the pixel and by normal similarity, so occlusion doesn't bleed across edges.
// Input and output: (occlusion, normal * 0.5 + 0.5).

precision highp float;

#include n8ao-common.glsl;

uniform sampler2D tAmbientOcclusion;
// Full resolution depth texture, or (depth, octahedral normal, subpixel index) from the depth downsample pass
// with HALF_RES.
uniform highp sampler2D tDepth;
// Full render resolution, used to reconstruct positions from downsampled depth.
uniform vec2 fullResolution;
uniform vec2 poissonDisk[DENOISE_SAMPLE_COUNT];
// Denoise radius in pixels at the resolution of tAmbientOcclusion.
uniform float denoiseRadius;
// Ambient occlusion sampling radius in pixels at the resolution of tAmbientOcclusion.
uniform float radius;
uniform float distanceFalloff;
// Decorrelates the sample rotations of consecutive denoise iterations.
uniform float iteration;
uniform float outputExponent;

in vec2 vUv;

out vec4 outputColor;

// View position of the depth texel at the given pixel. Background pixels have depth 1.
vec3 viewPositionAtPixel(ivec2 pixel, vec2 resolution, out float depth) {
  vec4 depthTexel = texelFetch(tDepth, pixel, 0);
  depth = depthTexel.x;
#if defined(HALF_RES)
  vec2 uv = downsampledTexelUv(pixel, depthTexel.w, fullResolution);
#else
  vec2 uv = (vec2(pixel) + 0.5) / resolution;
#endif
  return viewPositionFromDepth(depth, uv);
}

void main() {
  ivec2 size = textureSize(tAmbientOcclusion, 0);
  vec2 resolution = vec2(size);
  ivec2 pixel = ivec2(vUv * resolution);

  vec4 data = texelFetch(tAmbientOcclusion, pixel, 0);
  float depth;
  vec3 viewPosition = viewPositionAtPixel(pixel, resolution, depth);
  if (isBackground(depth)) {
    outputColor = data;
    return;
  }

  vec3 normal = normalize(data.yzw * 2.0 - 1.0);

  float angle = interleavedGradientNoise(vec2(pixel) + 7.1234 * (iteration + 1.0)) * 6.283185307;
  mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

  float radiusToUse = viewSpaceLengthOfPixels(viewPosition, depth, (vec2(pixel) + 0.5) / resolution, radius, resolution);
  float inverseDistanceFalloff = 1.0 / (radiusToUse * distanceFalloff);

  float occlusion = data.x;
  float totalWeight = 1.0;
  vec2 texelSize = 1.0 / resolution;

  for (int i = 0; i < DENOISE_SAMPLE_COUNT; i++) {
    vec2 sampleUv = vUv + rotation * poissonDisk[i] * texelSize * denoiseRadius;
    ivec2 samplePixel = clamp(ivec2(sampleUv * resolution), ivec2(0), size - 1);
    vec4 sampleData = texelFetch(tAmbientOcclusion, samplePixel, 0);
    float sampleDepth;
    vec3 sampleViewPosition = viewPositionAtPixel(samplePixel, resolution, sampleDepth);
    vec3 sampleNormal = sampleData.yzw * 2.0 - 1.0;
    float tangentPlaneDistance = abs(dot(sampleViewPosition - viewPosition, normal));
    float weight = float(!isBackground(sampleDepth)) * exp(-tangentPlaneDistance * inverseDistanceFalloff) *
      max(dot(normal, sampleNormal), 0.0);
    occlusion += sampleData.x * weight;
    totalWeight += weight;
  }

  occlusion = clamp(occlusion / totalWeight, 0.0, 1.0);
  outputColor = vec4(applyExponent(occlusion, outputExponent), data.yzw);
}
