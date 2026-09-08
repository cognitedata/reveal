precision highp float;

uniform sampler2D tDepth;

in vec2 vUv;

out vec4 fragColor;

#include cadShadow.glsl;

void main() {
  float lit = cadShadowLit(tDepth, vUv);
  fragColor = vec4(lit, lit, lit, 1.0);
}
