#pragma glslify: floatBitsSubset = require('../math/floatBitsSubset.glsl')

varying vec2 vUv;

// selection outline
varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

uniform sampler2D tBase;
uniform sampler2D tSelected;
uniform sampler2D tOutlineColors;

void main() {
  vec4 t0 = texture2D(tBase, vUv);
  vec4 t1 = texture2D(tSelected, vUv);

  if(ceil(t1.a) == 1.0){
    float a = 0.0;
    if(ceil(t0.a) == 1.0){
      a = 0.5;
    }
    gl_FragColor = vec4(t1.rgb, 1.0) * (1.0 - a) + vec4(t0.rgb, 1.0) * a;
    return;
  }

  float a0 = floatBitsSubset(floor((texture2D(tSelected, vUv0).a * 255.0) + 0.5), 2, 5);
  float a1 = floatBitsSubset(floor((texture2D(tSelected, vUv1).a * 255.0) + 0.5), 2, 5);
  float a2 = floatBitsSubset(floor((texture2D(tSelected, vUv2).a * 255.0) + 0.5), 2, 5);
  float a3 = floatBitsSubset(floor((texture2D(tSelected, vUv3).a * 255.0) + 0.5), 2, 5);
  vec4 visibilityFactor = vec4(a0, a1, a2, a3);

  if(any(greaterThan(visibilityFactor, vec4(0.0)))){
    float borderColorIndex = max(max(max(visibilityFactor.x, visibilityFactor.y), visibilityFactor.z), visibilityFactor.w);
    gl_FragColor = texture2D(tOutlineColors, vec2(0.125 * borderColorIndex + (0.125 / 2.0), 0.5));
    return;
  }

  if(ceil(t0.a) == 1.0){
    gl_FragColor = vec4(t0.rgb, 1.0);
    return;
  }

  float b0 = floatBitsSubset(floor((texture2D(tBase, vUv0).a * 255.0) + 0.5), 2, 5);
  float b1 = floatBitsSubset(floor((texture2D(tBase, vUv1).a * 255.0) + 0.5), 2, 5);
  float b2 = floatBitsSubset(floor((texture2D(tBase, vUv2).a * 255.0) + 0.5), 2, 5);
  float b3 = floatBitsSubset(floor((texture2D(tBase, vUv3).a * 255.0) + 0.5), 2, 5);
  vec4 visibilityFactorTwo = vec4(b0, b1, b2, b3);

  if(any(greaterThan(visibilityFactorTwo, vec4(0.0)))){
    float borderColorIndex = max(max(max(visibilityFactorTwo.x, visibilityFactorTwo.y), visibilityFactorTwo.z), visibilityFactorTwo.w);
    gl_FragColor = texture2D(tOutlineColors, vec2(0.125 * borderColorIndex + (0.125 / 2.0), 0.5));
    return;
  }

  discard;
}