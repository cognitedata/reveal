precision highp float;

uniform sampler2D tDiffuse;

#if defined(DEPTH_WRITE) 
uniform sampler2D tDepth;
#endif

#if defined(ALPHA)
uniform float alpha;
#endif

#if defined(OUTLINE)
uniform sampler2D tOutlineColors;
#endif

in vec2 vUv;

out vec4 fragColor;

#if defined(GAUSSIAN_BLUR) 
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

void main() {

  vec4 diffuse = texture(tDiffuse, vUv); 
  
  if(diffuse.a == 0.0){
    discard;
  }

#if defined(GAUSSIAN_BLUR) 
  fragColor = gaussianBlur(tDiffuse, vUv);
#elif defined(FXAA)
  fragColor = fxaa(tDiffuse);
#else
  fragColor = diffuse;
  #if defined(EDGES)
    ivec2 textureSize = textureSize(tDiffuse, 0);
    float edgeStrength = edgeDetectionFilter(tDiffuse, vUv, vec2(float(textureSize.x), float(textureSize.y)));
    fragColor.rgb *= mix(pow(1.0 - edgeStrength, 2.0), 1.0, isnan(edgeStrength));
  #endif
  #if defined(OUTLINE)
    int outline = outlineIndex(tDiffuse, vUv);
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
