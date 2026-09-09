precision highp float;

#include ../math/rand2d.glsl;

uniform mat4 projMatrix;
uniform mat4 inverseProjectionMatrix;
uniform vec3 kernel[MAX_KERNEL_SIZE];
uniform sampler2D tDepth;
uniform float sampleRadius;
uniform float bias;

in vec2 vUv;

out vec4 outputColor;

vec3 viewPosFromDepth(float depth, vec2 uv) {
  // Depth to clip space: [0, 1] -> [-1, 1]
  float z = depth * 2.0 - 1.0;

  // Fragment in clip space
  vec4 clipSpacePosition = vec4(uv * 2.0 - 1.0, z, 1.0);
  vec4 viewSpacePosition = inverseProjectionMatrix * clipSpacePosition;

  // Perspective division
  viewSpacePosition /= viewSpacePosition.w;

  return viewSpacePosition.xyz;
}

vec3 computeWorldNormalFromDepth(sampler2D depthTexture, vec2 resolution, vec2 uv, float sampleDepth){
  float dx = 1.0 / resolution.x;
  float dy = 1.0 / resolution.y;

  vec2 uv1 = uv + vec2(dx, 0.0); // right
  float d1 = texture(depthTexture, uv1).r;

  vec2 uv2 = uv + vec2(0.0, dy);  // up
  float d2 = texture(depthTexture, uv2).r;

  vec2 uv3 = uv + vec2(-dx, 0.0); // left
  float d3 = texture(depthTexture, uv3).r;

  vec2 uv4 = uv + vec2(0.0, -dy);  // down
  float d4 = texture(depthTexture, uv4).r;

  bool horizontalSampleCondition = abs(d1 - sampleDepth) < abs(d3 - sampleDepth);

  float horizontalSampleDepth = horizontalSampleCondition ? d1 : d3;
  vec2 horizontalSampleUv = horizontalSampleCondition ? uv1 : uv3;

  bool verticalSampleCondition = abs(d2 - sampleDepth) < abs(d4 - sampleDepth);

  float verticalSampleDepth = verticalSampleCondition ? d2 : d4;
  vec2 verticalSampleUv = verticalSampleCondition ? uv2 : uv4;

  vec3 viewPos = viewPosFromDepth(sampleDepth, vUv);

  vec3 viewPos1 = (horizontalSampleCondition == verticalSampleCondition) ? viewPosFromDepth(horizontalSampleDepth, horizontalSampleUv) : viewPosFromDepth(verticalSampleDepth, verticalSampleUv);
  vec3 viewPos2 = (horizontalSampleCondition == verticalSampleCondition) ? viewPosFromDepth(verticalSampleDepth, verticalSampleUv) : viewPosFromDepth(horizontalSampleDepth, horizontalSampleUv);

  return normalize(cross(viewPos1 - viewPos, viewPos2 - viewPos));
}

float LARGE_DISTANCE_SAMPLE_FACTOR = 0.05;

#if defined(IMPROVED_SSAO)

// -----------------------------------------------------------------------------
// Improved SSAO: Alchemy / "Scalable Ambient Obscurance" (McGuire et al. 2011-12)
//
// Depth-only, but instead of a fixed hemisphere kernel rotated by a noisy TBN we
// walk a single spiral of samples whose start angle is randomised per pixel with
// interleaved gradient noise (far better distributed than the old sin hash). The
// sampling radius is a *world-space* radius projected to screen space, so the AO
// footprint is consistent in world units and scales correctly with distance.
// The obscurance estimator is the Alchemy falloff, which gives smoother, less
// haloed occlusion than a hard depth-range test.
// -----------------------------------------------------------------------------

#ifndef PI
#define PI 3.1415926535897932
#endif

void main(){
  float d = texture(tDepth, vUv).r;

  ivec2 texSize = textureSize(tDepth, 0);
  vec2 resolution = vec2(float(texSize.x), float(texSize.y));

  vec3 viewNormal = computeWorldNormalFromDepth(tDepth, resolution, vUv, d);
  vec3 viewPosition = viewPosFromDepth(d, vUv);

  // World-space AO radius -> screen-space (UV) radius at this depth. projMatrix
  // diagonal holds the focal scales (m00 = f/aspect, m11 = f). The 0.5 maps NDC
  // to UV. Clamp to avoid huge taps for geometry very close to the camera.
  float invViewZ = 1.0 / max(-viewPosition.z, 1e-4);
  vec2 screenRadius = 0.5 * sampleRadius * invViewZ * vec2(projMatrix[0][0], projMatrix[1][1]);
  screenRadius = min(screenRadius, vec2(0.1));

  float angleOffset = interleavedGradientNoise(gl_FragCoord.xy) * 2.0 * PI;

  const float SPIRAL_TURNS = 7.0;
  const float INTENSITY = 1.2;
  float radiusWorldSqr = sampleRadius * sampleRadius;

  float occlusion = 0.0;
  for (int i = 0; i < MAX_KERNEL_SIZE; i++) {
    float t = (float(i) + 0.5) / float(MAX_KERNEL_SIZE);
    float angle = t * SPIRAL_TURNS * 2.0 * PI + angleOffset;
    vec2 sampleUv = vUv + vec2(cos(angle), sin(angle)) * screenRadius * t;

    float sampleDepth = texture(tDepth, sampleUv).r;
    vec3 samplePos = viewPosFromDepth(sampleDepth, sampleUv);

    vec3 v = samplePos - viewPosition;
    float vv = dot(v, v);
    float vn = dot(v, viewNormal);

    // Smooth radial cutoff so samples fade out at the edge of the AO sphere.
    float falloff = max(0.0, 1.0 - vv / radiusWorldSqr);
    occlusion += falloff * max(vn - bias, 0.0) / (vv + 1e-4);
  }

  float ao = max(0.0, 1.0 - (2.0 * INTENSITY / float(MAX_KERNEL_SIZE)) * occlusion);
  ao = pow(ao, 1.5);

  outputColor = vec4(ao);
}

#else

void main(){
  float d = texture(tDepth, vUv).r;

  ivec2 textureSize = textureSize(tDepth, 0);

  vec3 viewNormal = computeWorldNormalFromDepth(tDepth, vec2(float(textureSize.x), float(textureSize.y)), vUv, d);

  vec3 viewPosition = viewPosFromDepth(d, vUv);

  float distanceFactor = max(length(viewPosition) * LARGE_DISTANCE_SAMPLE_FACTOR, 1.0);

  vec3 covector = normalize(vec3(rand2d(vUv), rand2d(vUv * 3.0), rand2d(vUv * 5.0)));

  vec3 tangent = normalize(covector - viewNormal * dot(covector, viewNormal));

  vec3 bitangent = cross(viewNormal, tangent);

  mat3 TBN = mat3(tangent, bitangent, viewNormal);

  float occlusion = 0.0;

  for (int i = 0; i < MAX_KERNEL_SIZE; i++) {
    vec3 sampleVector = TBN * kernel[i];
    vec3 samplePosition = viewPosition + sampleVector * sampleRadius * distanceFactor;

    vec4 offset = projMatrix * vec4(samplePosition, 1.0);
    offset.xyz /= offset.w;
    offset.xyz = offset.xyz * 0.5 + 0.5;

    float realDepth = texture(tDepth, offset.xy).r;
    vec3 realPos = viewPosFromDepth(realDepth, offset.xy);

    float rangeCheck = smoothstep(0.0, 1.0, sampleRadius / length(viewPosition - realPos));

    occlusion += (realPos.z >= samplePosition.z + bias ? 1.0 : 0.0) * rangeCheck;
  }

  float occlusionFactor = 1.0 - clamp(occlusion / float(MAX_KERNEL_SIZE), 0.0, 1.0);

  outputColor = vec4(occlusionFactor);
}

#endif
