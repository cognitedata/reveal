precision highp float;

uniform sampler2D tDiffuse;

#if defined(DEPTH_WRITE) 
uniform sampler2D tDepth;
#endif

in vec2 vUv;

out vec4 diffuse;

#if defined(GAUSSIAN_BLUR) 
#pragma glslify: import('./gaussian-blur.glsl')
#endif

void main() {

#if defined(GAUSSIAN_BLUR) 
  vec4 color = gaussianBlur(tDiffuse, vUv);
#else
  vec4 color = texture(tDiffuse, vUv);
#endif
  if(color == vec4(0.0)){
    discard;
  }

  diffuse = color;

#if defined(DEPTH_WRITE) 
  gl_FragDepth = texture(tDepth, vUv).r;
#endif
}
