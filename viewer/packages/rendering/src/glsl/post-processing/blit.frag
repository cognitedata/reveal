precision highp float;

uniform sampler2D tDiffuse;

#if defined(DEPTH_WRITE) 
uniform sampler2D tDepth;
#endif

#if defined(ALPHA)
uniform float alpha;
#endif

in vec2 vUv;

out vec4 diffuse;

#if defined(GAUSSIAN_BLUR) 
#pragma glslify: import('./gaussian-blur.glsl')
#endif

#if defined(FXAA) 
#pragma glslify: import('./fxaa.glsl')
#endif

void main() {

#if defined(GAUSSIAN_BLUR) 
  diffuse = gaussianBlur(tDiffuse, vUv);
#elif defined(FXAA)
  diffuse = fxaa(tDiffuse);
#else
  diffuse = texture(tDiffuse, vUv);
#endif

#if defined(ALPHA)
  diffuse.a = alpha;
#endif

#if defined(DEPTH_WRITE) 
  gl_FragDepth = texture(tDepth, vUv).r;
#endif
}
