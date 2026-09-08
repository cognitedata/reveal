precision highp float;

uniform sampler2D tDiffuse;

#if defined(DEPTH_WRITE)
uniform sampler2D tDepth;
#endif

#if defined(SSAO_BLUR)
uniform sampler2D tSsao;
#endif

#if defined(ALPHA)
uniform float alpha;
#endif

#if defined(OUTLINE)
uniform sampler2D tOutlineColors;
#endif

#if defined(CAD_SHADOW)
uniform sampler2D tCadShadow;
#endif

in vec2 vUv;

in float near;
in float far;

out vec4 fragColor;

#if defined(SSAO_BLUR)
#include gaussian-blur.glsl;
#endif

#if defined(FXAA)
#include fxaa.glsl;
#endif

#if defined(EDGES)
#include edge-detect.glsl;
#endif

#if defined(OUTLINE)
#include outline.glsl;
#endif

#if defined(EDGES) && defined(DEPTH_WRITE)
#include ../math/toViewZ.glsl;
#endif

#if defined(CAD_SHADOW)
// 1 LSB triangular dither hides 8-bit posterization of a smooth gradient.
float cadShadowDither() {
  float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  return (n - 0.5) / 255.0;
}

// Four bilinear taps on the texel corners average a 3x3 neighbourhood. Three extra
// fetches on a single-value texture is enough to remove the residual shadow-map
// stepping without adding a separate blur pass.
float cadShadowLit() {
  vec2 texel = 1.0 / vec2(textureSize(tCadShadow, 0));
  float sum = texture(tCadShadow, vUv + texel * vec2(-0.5, -0.5)).r;
  sum += texture(tCadShadow, vUv + texel * vec2(0.5, -0.5)).r;
  sum += texture(tCadShadow, vUv + texel * vec2(-0.5, 0.5)).r;
  sum += texture(tCadShadow, vUv + texel * vec2(0.5, 0.5)).r;
  return clamp(sum * 0.25 + cadShadowDither(), 0.0, 1.0);
}
#endif

void main() {
  vec4 diffuse = texture(tDiffuse, vUv);

  if(diffuse.a == 0.0){
    #if defined(CAD_SHADOW)
      float lit = cadShadowLit();
      if (lit > 0.97) {
        discard;
      }
      fragColor = vec4(vec3(0.0), (1.0 - lit) * 0.85);
      gl_FragDepth = 1.0;
      return;
    #else
      discard;
    #endif
  }

#if defined(FXAA)
  fragColor = fxaa(tDiffuse);
#else
  fragColor = diffuse;
  #if defined(SSAO_BLUR)
    fragColor *= gaussianBlur(tSsao, vUv);
  #endif
  #if defined(CAD_SHADOW)
    fragColor.rgb *= cadShadowLit();
  #endif
  #if defined(EDGES)
    float edgeStrength = edgeDetectionFilter(tDiffuse);
    edgeStrength = (1.0 - pow(1.0 - edgeStrength, 2.0));
    #if defined(DEPTH_WRITE)
      float depthEdge = toViewZ(texture(tDepth, vUv).r, near, far);
      edgeStrength *= (1.0 - smoothstep(10.0, 40.0, depthEdge));
    #endif
    fragColor.rgb *= isnan(edgeStrength) ? 1.0 : (1.0 - edgeStrength);
  #endif
  #if defined(OUTLINE)
    int outline = fetchOutlineIndex(tDiffuse);
    fragColor.rgb = outline > 0 ? texelFetch(tOutlineColors, ivec2(outline, 0), 0).rgb : fragColor.rgb;
  #endif
#endif

#if defined(ALPHA)
  fragColor.a = alpha;
#endif

#if defined(DEPTH_WRITE)
  gl_FragDepth = texture(tDepth, vUv).r;
#endif
}
