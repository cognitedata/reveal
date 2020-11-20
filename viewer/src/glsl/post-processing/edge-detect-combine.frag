#pragma glslify: floatBitsSubset = require('../math/floatBitsSubset.glsl')

#include <packing>

varying vec2 vUv;

varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

uniform sampler2D tFront;
uniform sampler2D tFrontDepth;

uniform sampler2D tBack;
uniform sampler2D tBackDepth;

uniform sampler2D tCustom;
uniform sampler2D tCustomDepth;

uniform sampler2D tGhost;
uniform sampler2D tGhostDepth;

uniform sampler2D tOutlineColors;

uniform float cameraNear;
uniform float cameraFar;

const float infinity = 1e20;

float readDepth( sampler2D depthSampler, vec2 coord ) {
  float fragCoordZ = texture2D( depthSampler, coord ).x;
  float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
  return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
}

float computeFloatEncodedOutlineIndex(float bitEncodedFloat){
  return floatBitsSubset(floor((bitEncodedFloat * 255.0) + 0.5), 3, 6);
}

vec4 computeNeighborOutlineIndices(sampler2D colorTexture){
  float outlineIndex0 = computeFloatEncodedOutlineIndex(texture2D(colorTexture, vUv0).a);
  float outlineIndex1 = computeFloatEncodedOutlineIndex(texture2D(colorTexture, vUv1).a);
  float outlineIndex2 = computeFloatEncodedOutlineIndex(texture2D(colorTexture, vUv2).a);
  float outlineIndex3 = computeFloatEncodedOutlineIndex(texture2D(colorTexture, vUv3).a);

  return vec4(outlineIndex0, outlineIndex1, outlineIndex2, outlineIndex3);
}

void main() {
  vec4 frontAlbedo = texture2D(tFront, vUv);
  vec4 backAlbedo = texture2D(tBack, vUv);
  vec4 customAlbedo = texture2D(tCustom, vUv);
  vec4 ghostAlbedo = texture2D(tGhost, vUv);
  
  // Decompose and clamp "ghost" color
  vec4 clampedGhostAlbedo = vec4(max(ghostAlbedo.rgb, 0.5), min(ghostAlbedo.a, 0.8));

  float frontOutlineIndex = computeFloatEncodedOutlineIndex(frontAlbedo.a);
  vec4 frontNeighborIndices = computeNeighborOutlineIndices(tFront);

  // There exsists fragments of rendered objects within the edge width that should have border
  if(any(equal(frontNeighborIndices, vec4(0.0))) && frontOutlineIndex > 0.0) 
  { 
    float borderColorIndex = max(max(frontNeighborIndices.x, frontNeighborIndices.y), max(frontNeighborIndices.z, frontNeighborIndices.w));
    gl_FragColor = texture2D(tOutlineColors, vec2(0.125 * borderColorIndex + (0.125 / 2.0), 0.5));
    gl_FragDepth = texture2D(tFrontDepth, vUv).r;
    return;
  }

  float customDepth = readDepth(tCustomDepth, vUv);
  customDepth = customDepth > 0.0 ? customDepth : infinity; 

  float backDepth = readDepth(tBackDepth, vUv);
  backDepth = backDepth > 0.0 ? backDepth : infinity; 

  // texture has drawn fragment
  if(texture2D(tFrontDepth, vUv).r < 1.0){
    float customDepthTest = step(customDepth, backDepth); // zero if back is in front

    float a = customDepthTest > 0.0 ? ceil(customAlbedo.a) * 0.5 : ceil(backAlbedo.a) * 0.5;

    gl_FragColor = vec4(frontAlbedo.rgb, 1.0) * (1.0 - a) + (vec4(backAlbedo.rgb, 1.0) * (1.0 - customDepthTest) + vec4(customAlbedo.rgb, 1.0) * customDepthTest) * a;
    gl_FragDepth = texture2D(tFrontDepth, vUv).r;
    return;
  }


  if (customDepth >= backDepth) {
    float backOutlineIndex = computeFloatEncodedOutlineIndex(backAlbedo.a);
    vec4 backNeighborIndices = computeNeighborOutlineIndices(tBack);

    if( any(equal(backNeighborIndices, vec4(0.0))) && backOutlineIndex > 0.0) 
     { 
      float d0 = readDepth(tBackDepth, vUv);
      float d1 = readDepth(tBackDepth, vUv0);
      float d2 = readDepth(tBackDepth, vUv1);
      float d3 = readDepth(tBackDepth, vUv2);
      float d4 = readDepth(tBackDepth, vUv3);

      float averageNeighbourFragmentDepth = (d1 + d2 + d3 + d4) / 4.0;

      if(d0 < averageNeighbourFragmentDepth){
        float borderColorIndex = max(max(backNeighborIndices.x, backNeighborIndices.y), max(backNeighborIndices.z, backNeighborIndices.w));
        gl_FragColor = texture2D(tOutlineColors, vec2(0.125 * borderColorIndex + (0.125 / 2.0), 0.5));
        gl_FragDepth = texture2D(tBackDepth, vUv).r;
        return;
      }
    }
  }
  
  if(customDepth < backDepth){
    backDepth = customDepth;
    backAlbedo = customAlbedo;
  }

  if (texture2D(tBackDepth, vUv).x == 1.0 && 
      texture2D(tGhostDepth, vUv).x == 1.0 && 
      texture2D(tCustomDepth, vUv).x == 1.0) {
    discard;
  }
  
  float ghostDepth = readDepth(tGhostDepth, vUv);
  ghostDepth = ghostDepth > 0.0 ? ghostDepth : infinity; 
  float s = (1.0 - step(backDepth, ghostDepth)) * clampedGhostAlbedo.a;
  gl_FragColor = vec4(mix(backAlbedo.rgb, clampedGhostAlbedo.rgb, s), 1.0);
  gl_FragDepth = texture2D(tBackDepth, vUv).r;
}
