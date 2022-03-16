precision highp float;

#pragma glslify: import('./edge-detect.glsl')

uniform sampler2D tDiffuse;

in vec2 vUv;

out vec4 edge;

void main() {
  ivec2 textureSize = textureSize(tDiffuse, 0);
  float edgeStrength = edgeDetectionFilter(tDiffuse, vUv, vec2(float(textureSize.x), float(textureSize.y)));
  edge = vec4(mix(pow(1.0 - edgeStrength, 2.0), 1.0, isnan(edgeStrength)));
}