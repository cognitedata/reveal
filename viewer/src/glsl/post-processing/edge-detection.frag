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

  // Front texture has drawn fragment
  if(t1.a > 0.0){
    float a = ceil(t0.a) * 0.5;
    gl_FragColor = vec4(t1.rgb, 1.0) * (1.0 - a) + vec4(t0.rgb, 1.0) * a;
    return;
  }

  float a0 = floatBitsSubset(floor((texture2D(tSelected, vUv0).a * 255.0) + 0.5), 2, 5);
  float a1 = floatBitsSubset(floor((texture2D(tSelected, vUv1).a * 255.0) + 0.5), 2, 5);
  float a2 = floatBitsSubset(floor((texture2D(tSelected, vUv2).a * 255.0) + 0.5), 2, 5);
  float a3 = floatBitsSubset(floor((texture2D(tSelected, vUv3).a * 255.0) + 0.5), 2, 5);

  // There exsists fragments of front rendered objects within the edge width that should have boarder
  if(a0 + a1 + a2 + a3 > 0.0) {
    float borderColorIndex = max(max(a0, a1), max(a2, a3));
    gl_FragColor = texture2D(tOutlineColors, vec2(0.125 * borderColorIndex + (0.125 / 2.0), 0.5));
    return;
  }

  //Back texture has drawn fragment
  if(t0.a > 0.0){
    gl_FragColor = vec4(t0.rgb, 1.0);
    return;
  }

  float b0 = floatBitsSubset(floor((texture2D(tBase, vUv0).a * 255.0) + 0.5), 2, 5);
  float b1 = floatBitsSubset(floor((texture2D(tBase, vUv1).a * 255.0) + 0.5), 2, 5);
  float b2 = floatBitsSubset(floor((texture2D(tBase, vUv2).a * 255.0) + 0.5), 2, 5);
  float b3 = floatBitsSubset(floor((texture2D(tBase, vUv3).a * 255.0) + 0.5), 2, 5);

  // There exsists fragments of back rendered objects within the edge width that should have boarder
  if(b0 + b1 + b2 + b3 > 0.0) {
    float borderColorIndex = max(max(b0, b1), max(b2, b3));
    gl_FragColor = texture2D(tOutlineColors, vec2(0.125 * borderColorIndex + (0.125 / 2.0), 0.5));
    return;
  }

  discard;
}