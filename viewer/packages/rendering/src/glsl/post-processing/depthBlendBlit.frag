precision highp float;

uniform sampler2D tDiffuse;
uniform sampler2D tDepth;

uniform sampler2D tBlendDiffuse;
uniform sampler2D tBlendDepth;

uniform float blendFactor;

#if defined(ALPHA)
uniform float alpha;
#endif

#if defined(OUTLINE)
uniform sampler2D tOutlineColors;
#endif

in vec2 vUv;

out vec4 fragColor;

#if defined(OUTLINE)
#pragma glslify: import('./outline.glsl')
#endif

void main() {
  vec4 diffuse = texture(tDiffuse, vUv); 
  
  if(diffuse.a == 0.0){
    discard;
  }

  float depth = texture(tDepth, vUv).r;
  vec4 blendDiffuse = texture(tBlendDiffuse, vUv);
  float blendDepth = texture(tBlendDepth, vUv).r;

  fragColor = mix(diffuse, blendDiffuse, blendFactor * step(0.0, depth - blendDepth));

#if defined(OUTLINE)
  int outline = fetchOutlineIndex(tDiffuse);
  fragColor.rgb = outline > 0 ? texelFetch(tOutlineColors, ivec2(outline, 0), 0).rgb : fragColor.rgb;
#endif

#if defined(ALPHA)
  fragColor.a = alpha;
#endif

  gl_FragDepth = depth;
}
