// Ambient occlusion based on N8AO by N8python (https://github.com/N8python/n8ao), adapted to Reveal's
// render pipeline. N8AO is dedicated to the public domain under CC0 1.0 Universal
// (https://creativecommons.org/publicdomain/zero/1.0/); its author asks to be credited when it's used.
//
// Estimates ambient occlusion by sampling a hemisphere around the normal reconstructed from depth, with a
// radius given in screen space so the effect adapts to the scale of what is viewed.
// Output: (occlusion, normal * 0.5 + 0.5), where occlusion = 1 is unoccluded.

precision highp float;

#include n8ao-common.glsl;

// Full resolution depth texture, or (depth, octahedral normal, subpixel index) from the depth downsample pass
// with HALF_RES.
uniform highp sampler2D tDepth;
// Full render resolution, used to reconstruct positions from downsampled depth.
uniform vec2 fullResolution;
uniform vec3 samples[SAMPLE_COUNT];
// Sampling radius in pixels at the resolution of tDepth.
uniform float radius;
uniform float distanceFalloff;
uniform float outputExponent;

in vec2 vUv;

out vec4 outputColor;

mat3 makeRotationZ(float theta) {
  float c = cos(theta);
  float s = sin(theta);
  return mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0);
}

void main() {
  ivec2 size = textureSize(tDepth, 0);
  vec2 resolution = vec2(size);
  ivec2 pixel = ivec2(vUv * resolution);

  vec4 depthTexel = texelFetch(tDepth, pixel, 0);
  float depth = depthTexel.x;
  if (isBackground(depth)) {
    outputColor = vec4(1.0, 0.5, 0.5, 1.0);
    return;
  }

#if defined(HALF_RES)
  vec2 uv = downsampledTexelUv(pixel, depthTexel.w, fullResolution);
  vec3 normal = decodeNormal(depthTexel.yz);
#else
  vec2 uv = (vec2(pixel) + 0.5) / resolution;
  vec3 normal = computeViewNormal(tDepth, pixel);
#endif
  vec3 viewPosition = viewPositionFromDepth(depth, uv);

  vec2 noise = vec2(interleavedGradientNoise(vec2(pixel)), interleavedGradientNoise(vec2(pixel) + 5.588238));

  vec3 helperVector = abs(normal.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 tangent = normalize(cross(helperVector, normal));
  vec3 bitangent = cross(normal, tangent);
  mat3 tbn = mat3(tangent, bitangent, normal) * makeRotationZ(noise.x * 6.283185307);

  float radiusToUse = viewSpaceLengthOfPixels(viewPosition, depth, uv, radius, resolution);
  float distanceFalloffToUse = radiusToUse * distanceFalloff;

  // Depth is only known at one point per pixel, so a sample is compared against the surface up to half a pixel
  // away from it (a full pixel for downsampled depth, which is taken from any of the four pixels it covers). On
  // surfaces seen at grazing angles, that difference would make the surface occlude itself. The bias compensates
  // by the depth change over that distance, given the slope of the surface relative to the view ray.
#if defined(HALF_RES)
  const float lookupOffsetPixels = 1.0;
#else
  const float lookupOffsetPixels = 0.5;
#endif
  float pixelSize = radiusToUse / radius;
  float cosViewAngle = clamp(abs(dot(normal, normalize(-viewPosition))), 0.2, 1.0);
  float bias = lookupOffsetPixels * pixelSize * sqrt(1.0 - cosViewAngle * cosViewAngle) / cosViewAngle;

  float occluded = 0.0;
  float totalWeight = 0.0;
  float offsetMove = noise.y;
  const float offsetMoveStep = 1.0 / float(SAMPLE_COUNT);

  for (int i = 0; i < SAMPLE_COUNT; i++) {
    vec3 sampleDirection = tbn * samples[i];
    float moveAmount = fract(offsetMove);
    offsetMove += offsetMoveStep;
    vec3 samplePosition = viewPosition + radiusToUse * moveAmount * sampleDirection;

    vec4 offset = cameraProjectionMatrix * vec4(samplePosition, 1.0);
    offset.xyz /= offset.w;
    offset.xyz = offset.xyz * 0.5 + 0.5;

    if (all(greaterThan(offset.xyz * (1.0 - offset.xyz), vec3(0.0)))) {
      ivec2 samplePixel = ivec2(offset.xy * resolution);
      float sampleDepth = texelFetch(tDepth, samplePixel, 0).x;
      float distSample = -viewZFromDepth(sampleDepth);
      float distWorld = -samplePosition.z;
      float rangeCheck = smoothstep(0.0, 1.0, distanceFalloffToUse / abs(distSample - distWorld));
      // Samples that land in the pixel itself can't occlude it.
      float isOtherPixel = float(any(notEqual(samplePixel, pixel)));
      occluded += rangeCheck * isOtherPixel * step(distSample + bias, distWorld);
      totalWeight += 1.0;
    }
  }

  float occlusion = clamp(1.0 - occluded / max(totalWeight, 1.0), 0.0, 1.0);
  outputColor = vec4(applyExponent(occlusion, outputExponent), normal * 0.5 + 0.5);
}
