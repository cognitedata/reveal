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
#pragma glslify: import('./gaussian-blur.glsl')
#endif

#if defined(FXAA) 
#pragma glslify: import('./fxaa.glsl')
#endif

#if defined(EDGES)
#pragma glslify: import('./edge-detect.glsl')
#endif

#if defined(OUTLINE)
#pragma glslify: import('./outline.glsl')
#endif

#if defined(EDGES) && defined(DEPTH_WRITE) 
#pragma glslify: import('../math/toViewZ.glsl')
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
    fragColor *= gaussianBlur(tSsao, vUv);
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
