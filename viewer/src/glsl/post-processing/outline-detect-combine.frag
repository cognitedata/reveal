#pragma glslify: floatBitsSubset = require('../math/floatBitsSubset.glsl')
#pragma glslify: edgeDetectionFilter = require('../post-processing/edge-detect.glsl')

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

uniform vec2 resolution;

uniform float edgeStrengthMultiplier;
uniform float edgeGrayScaleIntensity;

const float infinity = 1e20;

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

vec4 computeNeighborAlphas(sampler2D colorTexture){
  float alpha0 = texture2D(colorTexture, vUv0).a;
  float alpha1 = texture2D(colorTexture, vUv1).a;
  float alpha2 = texture2D(colorTexture, vUv2).a;
  float alpha3 = texture2D(colorTexture, vUv3).a;

  return vec4(alpha0, alpha1, alpha2, alpha3);
}

void main() {
  vec4 frontAlbedo = texture2D(tFront, vUv);
  vec4 backAlbedo = texture2D(tBack, vUv);
  vec4 customAlbedo = texture2D(tCustom, vUv);
  vec4 ghostAlbedo = texture2D(tGhost, vUv);

  float frontDepth = texture2D(tFrontDepth, vUv).r;
  float backDepth = texture2D(tBackDepth, vUv).r;  
  float customDepth = texture2D(tCustomDepth, vUv).r;
  float ghostDepth = texture2D(tGhostDepth, vUv).r;
  
  // Decompose and clamp "ghost" color
  vec4 clampedGhostAlbedo = vec4(max(ghostAlbedo.rgb, 0.5), min(ghostAlbedo.a, 0.8));

  float frontOutlineIndex = computeFloatEncodedOutlineIndex(frontAlbedo.a);
  vec4 frontNeighborIndices = computeNeighborOutlineIndices(tFront);

  // There exsists fragments of rendered objects within the edge width that should have border
  if(any(equal(frontNeighborIndices, vec4(0.0))) && frontOutlineIndex > 0.0) 
  { 
    float borderColorIndex = max(max(frontNeighborIndices.x, frontNeighborIndices.y), max(frontNeighborIndices.z, frontNeighborIndices.w));
    gl_FragColor = texture2D(tOutlineColors, vec2(0.125 * borderColorIndex + (0.125 / 2.0), 0.5));
#if defined(gl_FragDepthEXT) || defined(GL_EXT_frag_depth) 
    gl_FragDepthEXT = frontDepth;
#endif
    return;
  }

  customDepth = customDepth > 0.0 ? customDepth : infinity; 
  backDepth = backDepth > 0.0 ? backDepth : infinity; 
  ghostDepth = ghostDepth > 0.0 ? ghostDepth : infinity; 

  // texture has drawn fragment
  if(texture2D(tFrontDepth, vUv).r < 1.0){
    float customDepthTest = step(customDepth, backDepth); // zero if back is in front

    float a = customDepthTest > 0.0 ? ceil(customAlbedo.a) * 0.5 : ceil(backAlbedo.a) * 0.5;

    gl_FragColor = vec4(frontAlbedo.rgb, 1.0) * (1.0 - a) + (vec4(backAlbedo.rgb, 1.0) * (1.0 - customDepthTest) + vec4(customAlbedo.rgb, 1.0) * customDepthTest) * a;
#if defined(gl_FragDepthEXT) || defined(GL_EXT_frag_depth)   
    gl_FragDepthEXT = texture2D(tFrontDepth, vUv).r;
#endif
    return;
  }

  if (customDepth >= backDepth) {
    float backOutlineIndex = computeFloatEncodedOutlineIndex(backAlbedo.a);
    vec4 backNeighborIndices = computeNeighborOutlineIndices(tBack);

    if( any(equal(backNeighborIndices, vec4(0.0))) && backOutlineIndex > 0.0) 
    { 
        float borderColorIndex = max(max(backNeighborIndices.x, backNeighborIndices.y), max(backNeighborIndices.z, backNeighborIndices.w));
        gl_FragColor = texture2D(tOutlineColors, vec2(0.125 * borderColorIndex + (0.125 / 2.0), 0.5));
#if defined(gl_FragDepthEXT) || defined(GL_EXT_frag_depth)
        gl_FragDepthEXT = texture2D(tBackDepth, vUv).r;
#endif
        return;
    }
  }

  if (texture2D(tBackDepth, vUv).x == 1.0 && 
      texture2D(tGhostDepth, vUv).x == 1.0 && 
      texture2D(tCustomDepth, vUv).x == 1.0) {
    discard;
  }
  
  float edgeStrength = 0.0;
  if(customDepth < backDepth){
    backDepth = customDepth;
    backAlbedo = customAlbedo;
  } else {
    if(!any(equal(computeNeighborAlphas(tBack), vec4(0.0)))){
      edgeStrength = edgeDetectionFilter(tBack, vUv, resolution) * edgeStrengthMultiplier;
    }
  }
  
  float s = (1.0 - step(backDepth, ghostDepth)) * clampedGhostAlbedo.a;
  vec4 outAlbedo = vec4(mix(backAlbedo.rgb, clampedGhostAlbedo.rgb, s), 1.0);
  gl_FragColor = outAlbedo * (1.0 - edgeStrength) + vec4(vec3(edgeGrayScaleIntensity) * edgeStrength, 1.0);
#if defined(gl_FragDepthEXT) || defined(GL_EXT_frag_depth)  
  gl_FragDepthEXT = mix(backDepth, ghostDepth, s);
#endif
}
