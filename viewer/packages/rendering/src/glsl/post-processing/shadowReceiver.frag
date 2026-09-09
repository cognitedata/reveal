precision highp float;

uniform sampler2D tCadDepth;
uniform sampler2D tReceiverDepth;
uniform sampler2D tReceiverShadow;

in vec2 vUv;
out vec4 fragColor;

void main() {
  float receiverDepth = texture(tReceiverDepth, vUv).r;
  if (receiverDepth >= 0.99999) discard;

  // Do not paint a receiver shadow over CAD that is in front of it. Comparing
  // explicitly also supports receiver materials that use polygon offset.
  float cadDepth = texture(tCadDepth, vUv).r;
  if (cadDepth + 0.00001 < receiverDepth) discard;

  float lit = texture(tReceiverShadow, vUv).r;
  if (lit >= 0.999) discard;

  fragColor = vec4(0.0, 0.0, 0.0, 1.0 - lit);
}
