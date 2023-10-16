precision highp float;

uniform sampler2D colorTexture;

#if defined(isMaskDefined)
  uniform sampler2D maskTexture;
#endif

uniform vec3 colorTint;
uniform float collectionOpacity;

in vec3 vColor;

out vec4 fragmentColor;

void main() {
  vec4 colorSample = texture(colorTexture, gl_PointCoord);

  float computedAlpha = colorSample.a;
  vec3 computedColor = colorSample.rgb;

  #if defined(isMaskDefined)
    vec4 maskSample = texture(maskTexture, gl_PointCoord);

    computedAlpha = colorSample.a + (1. - colorSample.a) * maskSample.r;
    computedColor = mix(colorSample.rgb, vColor, maskSample.r);
  #endif

  fragmentColor = vec4(computedColor * colorTint, computedAlpha * collectionOpacity);
}
