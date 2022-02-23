precision highp float;

#define texture2D texture

#pragma glslify: floatBitsSubset = require('../math/floatBitsSubset.glsl')
#pragma glslify: edgeDetectionFilter = require('../post-processing/edge-detect.glsl')

#include <packing>

in vec2 vUv;

in vec2 vUv0;
in vec2 vUv1;
in vec2 vUv2;
in vec2 vUv3;

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

out vec4 outputColor;

const float infinity = 1e20;

float computeFloatEncodedOutlineIndex(float bitEncodedFloat){
  return floatBitsSubset(floor((bitEncodedFloat * 255.0) + 0.5), 5, 8);
}

vec4 computeNeighborOutlineIndices(sampler2D colorTexture){
  float outlineIndex0 = computeFloatEncodedOutlineIndex(texture2D(colorTexture, vUv0).a);
  float outlineIndex1 = computeFloatEncodedOutlineIndex(texture2D(colorTexture, vUv1).a);
  float outlineIndex2 = computeFloatEncodedOutlineIndex(texture2D(colorTexture, vUv2).a);
  float outlineIndex3 = computeFloatEncodedOutlineIndex(texture2D(colorTexture, vUv3).a);

  return vec4(outlineIndex0, outlineIndex1, outlineIndex2, outlineIndex3);
}

float toViewZ(float depth, float near, float far){
  float normalizedDepth = depth * 2.0 - 1.0;
  return 2.0 * near * far / (far + near - normalizedDepth * (far - near)); 
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

  // This is a hack to make sure that all textures are initialized
  // If a texture is unused, it will have a clear value of 0.0.
  // Without this we've seen issues with MSAA where resizing render targets
  // causes depth to cleared to either 1 or 0 depending on the device/browser
  customDepth = customDepth > 0.0 ? customDepth : 1.0; 
  backDepth = backDepth > 0.0 ? backDepth : 1.0;
  ghostDepth = ghostDepth > 0.0 ? ghostDepth : 1.0;
  frontDepth = frontDepth > 0.0 ? frontDepth : 1.0; 

  if(all(greaterThanEqual(vec4(backDepth, customDepth, ghostDepth, frontDepth), vec4(1.0)))){
    discard;
  }
  
  // Decompose and clamp "ghost" color
  vec4 clampedGhostAlbedo = vec4(max(ghostAlbedo.rgb, 0.5), min(ghostAlbedo.a, 0.8));

  float frontOutlineIndex = computeFloatEncodedOutlineIndex(frontAlbedo.a);
  vec4 frontNeighborIndices = computeNeighborOutlineIndices(tFront);

  // There exsists fragments of rendered objects within the edge width that should have border
  if(any(equal(frontNeighborIndices, vec4(0.0))) && frontOutlineIndex > 0.0) 
  { 
    float borderColorIndex = max(max(frontNeighborIndices.x, frontNeighborIndices.y), max(frontNeighborIndices.z, frontNeighborIndices.w));
    outputColor = texture2D(tOutlineColors, vec2(0.125 * borderColorIndex + (0.125 / 2.0), 0.5));
    gl_FragDepth = frontDepth;
    return;
  }

  // texture has drawn fragment
  if(frontDepth < 1.0){
    float customDepthTest = step(customDepth, backDepth); // zero if back is in front

    float a = customDepthTest > 0.0 ? ceil(customAlbedo.a) * 0.5 : ceil(backAlbedo.a) * 0.5;

    outputColor = vec4(frontAlbedo.rgb, 1.0) * (1.0 - a) + (vec4(backAlbedo.rgb, 1.0) * (1.0 - customDepthTest) + vec4(customAlbedo.rgb, 1.0) * customDepthTest) * a;
    gl_FragDepth = texture2D(tFrontDepth, vUv).r;
    return;
  }

  if (customDepth >= backDepth) {
    float backOutlineIndex = computeFloatEncodedOutlineIndex(backAlbedo.a);
    vec4 backNeighborIndices = computeNeighborOutlineIndices(tBack);

    if( any(equal(backNeighborIndices, vec4(0.0))) && backOutlineIndex > 0.0) 
    { 
      float borderColorIndex = max(max(backNeighborIndices.x, backNeighborIndices.y), max(backNeighborIndices.z, backNeighborIndices.w));
      outputColor = texture2D(tOutlineColors, vec2(0.125 * borderColorIndex + (0.125 / 2.0), 0.5));
      gl_FragDepth = texture2D(tBackDepth, vUv).r;
      return;
    }
  }
  
  float edgeStrength = 0.0;
#if defined(EDGES)
  if (!any(equal(computeNeighborAlphas(tBack), vec4(0.0)))) {
    float depthEdge = toViewZ(backDepth, cameraNear, cameraFar);
    edgeStrength = (1.0 - smoothstep(10.0, 40.0, depthEdge)) * edgeDetectionFilter(tBack, vUv, resolution) * edgeStrengthMultiplier;
  }
#endif

  // Combine color from ghost, back and custom object
  vec4 color = backAlbedo;
  float depth = backDepth;
  if (customDepth < backDepth && ghostDepth == 1.0) {
    color = vec4(customAlbedo.rgb * customAlbedo.a + (1.0 - customAlbedo.a) * backAlbedo.rgb, 1.0);
    depth = customDepth;
    edgeStrength = 0.0;
  } else if (customDepth < backDepth && ghostDepth < 1.0) {
    float s = (1.0 - step(backDepth, ghostDepth)) * clampedGhostAlbedo.a;
    vec3 modelAlbedo = mix(backAlbedo.rgb, clampedGhostAlbedo.rgb, s);
    color = vec4(customAlbedo.rgb * customAlbedo.a + (1.0 - customAlbedo.a) * modelAlbedo.rgb, 1.0);
    depth = customDepth;
    edgeStrength = 0.0;
  } else {
    float s = (1.0 - step(backDepth, ghostDepth)) * clampedGhostAlbedo.a;
    color = vec4(mix(backAlbedo.rgb, clampedGhostAlbedo.rgb, s), backAlbedo.a);
    depth = mix(backDepth, ghostDepth, s);
  }
  
  outputColor = color * (1.0 - edgeStrength) + vec4(vec3(edgeGrayScaleIntensity) * edgeStrength, 1.0);
  gl_FragDepth = depth;
}
