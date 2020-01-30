/*!
 * Copyright 2020 Cognite AS
 */

uniform float cameraNear;
uniform float cameraFar;
uniform float radius;
uniform vec2 size;
uniform float aoClamp;
uniform float lumInfluence;
uniform sampler2D tDiffuse;
uniform highp sampler2D tDepth;

varying vec2 vUv;

#define DL 2.399963229728653
#define EULER 2.718281828459045

const int samples = 12;

const float noiseScale = 0.0005;

const float defaultArea = 0.4;
const float displacement = 0.4;

#include <packing>

vec2 rand(vec2 co)
{
    float a = 12.9898;
    float b = 78.233;
    float c = 43758.5453;
    float dt = dot(co.xy, vec2(a,b));
    float dt2 = dot(co.xy, vec2(a,b));
    vec2 sn = mod(vec2(dt, dt2), 3.14);
    return noiseScale * fract(sin(sn) * c);
}

float readDepth(vec2 coord) {
  float fragCoordZ = texture2D(tDepth, coord).x;
  float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
  return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
}

float compareDepths(const in float depth1, const in float depth2, inout bool retry) {
  float area = 8.0;
  float diff = (depth1 - depth2) * 100.0;

  if (diff < displacement) {
    area = defaultArea;
  } else {
    retry = true;
  }

  float dd = diff - displacement;
  float gauss = pow(EULER, -2.0 * (dd * dd) / (area * area));
  return gauss;
}

float ambientOcclusion(float depth, float dw, float dh) {
  vec2 vv = vec2(dw, dh);

  vec2 coord1 = vUv + radius * vv;
  vec2 coord2 = vUv - radius * vv;

  float temp1 = 0.0;
  float temp2 = 0.0;

  bool retry = false;
  temp1 = compareDepths(depth, readDepth(coord1), retry);

  if (retry) {
    temp2 = compareDepths(readDepth(coord2), depth, retry);
    temp1 += (1.0 - temp1) * temp2;
  }
  return temp1;
}

void main() {
  vec2 noise = rand(vUv);
  float depth = readDepth(vUv);

  float tt = clamp(depth, aoClamp, 1.0);

  float w = (1.0 / size.x) / tt + (noise.x * (1.0 - noise.x));
  float h = (1.0 / size.y) / tt + (noise.y * (1.0 - noise.y));

  float ao = 0.0;

  float dz = 1.0 / float(samples);
  float l = 0.0;
  float z = 1.0 - dz / 2.0;

  for (int i = 0; i <= samples; i ++) {
    float r = sqrt(1.0 - z);
    float pw = cos(l) * r;
    float ph = sin(l) * r;
    ao += ambientOcclusion(depth, pw * w, ph * h);
    z = z - dz;
    l = l + DL;
  }

  ao /= float(samples);
  ao = 1.0 - ao;

  vec3 color = texture2D(tDiffuse, vUv).rgb;

  vec3 lumcoeff = vec3(0.299, 0.587, 0.114);
  float lum = dot(color.rgb, lumcoeff);
  vec3 luminance = vec3(lum);

  vec3 final = vec3(mix(vec3(ao), vec3(1.0), luminance * lumInfluence));

  gl_FragColor = vec4(final, 1.0);
}
