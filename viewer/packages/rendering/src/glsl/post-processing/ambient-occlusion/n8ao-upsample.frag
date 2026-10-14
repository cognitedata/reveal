// Ambient occlusion based on N8AO by N8python (https://github.com/N8python/n8ao), adapted to Reveal's
// render pipeline. N8AO is dedicated to the public domain under CC0 1.0 Universal
// (https://creativecommons.org/publicdomain/zero/1.0/); its author asks to be credited when it's used.
//
// Depth-aware upsampling of half resolution ambient occlusion to full resolution. Each full resolution pixel
// blends the four nearest half resolution pixels bilinearly, weighted by how close their depth is to the depth of
// the pixel, so occlusion doesn't bleed across depth discontinuities. N8AO weights the 3x3 nearest pixels by
// tangent plane distance and normal similarity; this is considerably cheaper at full resolution, which matters
// most in the half resolution mode that is chosen for performance.

precision highp float;

#include n8ao-common.glsl;

uniform highp sampler2D tDepth;
// (depth, octahedral normal, subpixel index) at half resolution from the depth downsample pass.
uniform highp sampler2D tDownsampledDepth;
uniform sampler2D tAmbientOcclusion;
// Ambient occlusion sampling radius in pixels at full resolution.
uniform float radius;
uniform float distanceFalloff;
uniform float outputExponent;

in vec2 vUv;

out vec4 outputColor;

void main() {
  ivec2 size = textureSize(tDepth, 0);
  vec2 resolution = vec2(size);
  ivec2 pixel = ivec2(vUv * resolution);
  float depth = texelFetch(tDepth, pixel, 0).x;
  if (isBackground(depth)) {
    outputColor = vec4(1.0);
    return;
  }

  vec3 viewPosition = viewPositionFromDepth(depth, vUv);
  float radiusToUse = viewSpaceLengthOfPixels(viewPosition, depth, vUv, radius, resolution);
  float inverseDistanceFalloff = 1.0 / (radiusToUse * distanceFalloff);

  ivec2 halfSize = textureSize(tAmbientOcclusion, 0);
  vec2 halfCoordinate = vUv * vec2(halfSize) - 0.5;
  ivec2 basePixel = ivec2(floor(halfCoordinate));
  vec2 bilinear = fract(halfCoordinate);

  float occlusion = 0.0;
  float totalWeight = 0.0;
  for (int i = 0; i < 4; i++) {
    ivec2 offset = ivec2(i % 2, i / 2);
    ivec2 samplePixel = clamp(basePixel + offset, ivec2(0), halfSize - 1);
    float sampleDepth = texelFetch(tDownsampledDepth, samplePixel, 0).x;
    vec2 bilinearWeights = mix(1.0 - bilinear, bilinear, vec2(offset));
    float depthDifference = abs(viewZFromDepth(sampleDepth) - viewPosition.z);
    float weight = float(!isBackground(sampleDepth)) * (bilinearWeights.x * bilinearWeights.y + 1e-3) *
      exp(-depthDifference * inverseDistanceFalloff);
    occlusion += texelFetch(tAmbientOcclusion, samplePixel, 0).x * weight;
    totalWeight += weight;
  }

  occlusion = totalWeight > 1e-6 ? occlusion / totalWeight : texture(tAmbientOcclusion, vUv).x;
  outputColor = vec4(vec3(applyExponent(clamp(occlusion, 0.0, 1.0), outputExponent)), 1.0);
}
