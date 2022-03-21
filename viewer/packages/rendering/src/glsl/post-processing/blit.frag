precision highp float;

uniform sampler2D tDiffuse;

#if defined(DEPTH_WRITE) 
uniform sampler2D tDepth;
#endif

#if defined(ALPHA)
uniform float alpha;
#endif

in vec2 vUv;

out vec4 fragColor;

#if defined(GAUSSIAN_BLUR) 
#pragma glslify: import('./gaussian-blur.glsl')
#endif

#if defined(FXAA) 
#pragma glslify: import('./fxaa.glsl')
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
#endif

#if defined(ALPHA)
  fragColor.a = alpha;
#endif

#if defined(DEPTH_WRITE) 
  gl_FragDepth = texture(tDepth, vUv).r;
#endif
}
