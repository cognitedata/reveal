#pragma glslify: floatBitsSubset = require('../math/floatBitsSubset.glsl')

#include <packing>

varying vec2 vUv;

// selection outline
varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

uniform sampler2D tSource;
uniform sampler2D tDepth;
uniform sampler2D tOutlineColors;

uniform float cameraNear;
uniform float cameraFar;

float readDepth( sampler2D depthSampler, vec2 coord ) {
  float fragCoordZ = texture2D( depthSampler, coord ).x;
  float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
  return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
}

void main() {
  vec4 t0 = texture2D(tSource, vUv);

  float ba = floatBitsSubset(floor((t0.a * 255.0) + 0.5), 2, 5);
  float b0 = floatBitsSubset(floor((texture2D(tSource, vUv0).a * 255.0) + 0.5), 2, 5);
  float b1 = floatBitsSubset(floor((texture2D(tSource, vUv1).a * 255.0) + 0.5), 2, 5);
  float b2 = floatBitsSubset(floor((texture2D(tSource, vUv2).a * 255.0) + 0.5), 2, 5);
  float b3 = floatBitsSubset(floor((texture2D(tSource, vUv3).a * 255.0) + 0.5), 2, 5);

  float d0 = readDepth(tDepth, vUv);
  float d1 = readDepth(tDepth, vUv0);
  float d2 = readDepth(tDepth, vUv1);
  float d3 = readDepth(tDepth, vUv2);
  float d4 = readDepth(tDepth, vUv3);

  // There exsists fragments of rendered objects within the edge width that should have boarder
  if(b0 + b1 + b2 + b3 > 0.0 && any(equal(vec4(b0, b1, b2, b3), vec4(0.0))) && ba > 0.0) { 
    vec4 neighborDepthDifference = (vec4(d0) - vec4(d1, d2, d3, d4)) * (cameraFar - cameraNear);
    if(!any(greaterThan(neighborDepthDifference, vec4((cameraFar - cameraNear) / 1500.0)))){
      float borderColorIndex = max(max(b0, b1), max(b2, b3));
      gl_FragColor = texture2D(tOutlineColors, vec2(0.125 * borderColorIndex + (0.125 / 2.0), 0.5));
      return;
    }
  }

  // texture has drawn fragment
  if(t0.a > 0.0){
    gl_FragColor = vec4(t0.rgb, 1.0);
    return;
  }

  discard;
}