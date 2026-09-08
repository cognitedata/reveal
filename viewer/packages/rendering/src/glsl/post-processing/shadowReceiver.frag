precision highp float;

uniform sampler2D tCadDepth;
uniform sampler2D tReceiverDepth;

in vec2 vUv;
out vec4 fragColor;

#include contactShadow.glsl;

void main() {
  float receiverDepth = texture(tReceiverDepth, vUv).r;
  if (receiverDepth >= 0.99999) discard;

  float cadDepth = texture(tCadDepth, vUv).r;
  // Do not paint the receiver shadow over CAD that is in front of it. This
  // explicit test also avoids relying on equality with polygon-offset meshes.
  if (cadDepth + 0.00001 < receiverDepth) discard;

  vec3 origin = contactViewPosFromDepth(receiverDepth, vUv);
  float shadow = marchTowardLight(tCadDepth, origin);
  if (shadow <= 0.01) discard;

  fragColor = vec4(0.0, 0.0, 0.0, shadow * 0.7);
}
