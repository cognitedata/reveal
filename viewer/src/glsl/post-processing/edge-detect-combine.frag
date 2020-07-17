#pragma glslify: floatBitsSubset = require('../math/floatBitsSubset.glsl')

#include <packing>

varying vec2 vUv;

varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

uniform sampler2D tFront;

uniform sampler2D tBack;
uniform sampler2D tBackDepth;

uniform sampler2D tCustom;
uniform sampler2D tCustomDepth;

uniform sampler2D tOutlineColors;

uniform float cameraNear;
uniform float cameraFar;

const float infinity = 1e20;

float readDepth( sampler2D depthSampler, vec2 coord ) {
  float fragCoordZ = texture2D( depthSampler, coord ).x;
  float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
  return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
}

void main() {
  vec4 frontAlbedo = texture2D(tFront, vUv);
  vec4 backAlbedo = texture2D(tBack, vUv);
  vec4 customAlbedo = texture2D(tCustom, vUv);

  float frontOutlineIndex = floatBitsSubset(floor((frontAlbedo.a * 255.0) + 0.5), 2, 5);
  float frontOutlineIndex0 = floatBitsSubset(floor((texture2D(tFront, vUv0).a * 255.0) + 0.5), 2, 5);
  float frontOutlineIndex1 = floatBitsSubset(floor((texture2D(tFront, vUv1).a * 255.0) + 0.5), 2, 5);
  float frontOutlineIndex2 = floatBitsSubset(floor((texture2D(tFront, vUv2).a * 255.0) + 0.5), 2, 5);
  float frontOutlineIndex3 = floatBitsSubset(floor((texture2D(tFront, vUv3).a * 255.0) + 0.5), 2, 5);

  // There exsists fragments of rendered objects within the edge width that should have border
  if( any(equal(vec4(frontOutlineIndex0, frontOutlineIndex1, frontOutlineIndex2, frontOutlineIndex3), vec4(0.0))) 
      && frontOutlineIndex > 0.0) 
  { 
    float borderColorIndex = max(max(frontOutlineIndex0, frontOutlineIndex1), max(frontOutlineIndex2, frontOutlineIndex3));
    gl_FragColor = texture2D(tOutlineColors, vec2(0.125 * borderColorIndex + (0.125 / 2.0), 0.5));
    return;
  }

  float customDepth = readDepth(tCustomDepth, vUv);
  customDepth = customDepth > 0.0 ? customDepth : infinity; 

  float backDepth = readDepth(tBackDepth, vUv);
  backDepth = backDepth > 0.0 ? backDepth : infinity; 

  // texture has drawn fragment
  if(frontAlbedo.a > 0.0){
    float customDepthTest = step(customDepth, backDepth); // zero if back is in front

    float a = customDepthTest > 0.0 ? ceil(customAlbedo.a) * 0.5 : ceil(backAlbedo.a) * 0.5;

    gl_FragColor = vec4(frontAlbedo.rgb, 1.0) * (1.0 - a) + (vec4(backAlbedo.rgb, 1.0) * (1.0 - customDepthTest) + vec4(customAlbedo.rgb, 1.0) * customDepthTest) * a;
    return;
  }

  if(customDepth < backDepth){
    gl_FragColor = customAlbedo;
    return;
  }

  float backOutlineIndex = floatBitsSubset(floor((backAlbedo.a * 255.0) + 0.5), 2, 5);
  float backOutlineIndex0 = floatBitsSubset(floor((texture2D(tBack, vUv0).a * 255.0) + 0.5), 2, 5);
  float backOutlineIndex1 = floatBitsSubset(floor((texture2D(tBack, vUv1).a * 255.0) + 0.5), 2, 5);
  float backOutlineIndex2 = floatBitsSubset(floor((texture2D(tBack, vUv2).a * 255.0) + 0.5), 2, 5);
  float backOutlineIndex3 = floatBitsSubset(floor((texture2D(tBack, vUv3).a * 255.0) + 0.5), 2, 5);

  if( any(equal(vec4(backOutlineIndex0, backOutlineIndex1, backOutlineIndex2, backOutlineIndex3), vec4(0.0)))
      && backOutlineIndex > 0.0) 
   { 
    
    float d0 = readDepth(tBackDepth, vUv);
    float d1 = readDepth(tBackDepth, vUv0);
    float d2 = readDepth(tBackDepth, vUv1);
    float d3 = readDepth(tBackDepth, vUv2);
    float d4 = readDepth(tBackDepth, vUv3);

    float averageNeighbourFragmentDepth = (d1 + d2 + d3 + d4) / 4.0;

    if(d0 < averageNeighbourFragmentDepth){
      float borderColorIndex = max(max(backOutlineIndex0, backOutlineIndex1), max(backOutlineIndex2, backOutlineIndex3));
      gl_FragColor = texture2D(tOutlineColors, vec2(0.125 * borderColorIndex + (0.125 / 2.0), 0.5));
      return;
    }
  }

  if(backAlbedo.a > 0.0){
    gl_FragColor = vec4(backAlbedo.rgb, 1.0);
    return;
  }

  discard;
}