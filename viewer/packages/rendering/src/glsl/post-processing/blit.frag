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

in vec2 vUv;

in float near;
in float far;

out vec4 fragColor;

#if defined(SSAO_BLUR)
#include gaussian-blur.glsl;
#include ../math/colorSpaceConversion.glsl;
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

void main() {
  vec4 diffuse = texture(tDiffuse, vUv);

  if(diffuse.a == 0.0){
    discard;
  }

#if defined(FXAA)
  fragColor = fxaa(tDiffuse);
#else
  fragColor = diffuse;
  #if defined(SSAO_BLUR)
    #if defined(IMPROVED_SSAO_COMBINE)
      // Improved path: the AO buffer has already been blurred upstream (separable
      // bilateral), so a single tap suffices. Ambient occlusion is a light
      // attenuation and must be applied in linear light - multiplying the sRGB-
      // encoded colour (as the old path does) over-darkens non-linearly. Decode
      // to linear, attenuate, and re-encode.
      float ao = texture(tSsao, vUv).r;
      vec3 linear = sRGBToLinear(fragColor.rgb);
      fragColor.rgb = LinearTosRGB(linear * ao);
    #else
      // Original path: unblurred AO smoothed with a fused Gaussian, multiplied in
      // (gamma) display space.
      fragColor *= gaussianBlur(tSsao, vUv);
    #endif
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
