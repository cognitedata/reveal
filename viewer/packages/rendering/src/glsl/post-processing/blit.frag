precision highp float;

uniform sampler2D tDiffuse;

#if defined(DEPTH_WRITE) 
uniform sampler2D tDepth;
#endif

in vec2 vUv;

out vec4 diffuse;

void main() {
  vec4 color = texture(tDiffuse, vUv);

  if(color == vec4(0.0)){
    discard;
  }

  diffuse = color;

#if defined(DEPTH_WRITE) 
  gl_FragDepth = texture(tDepth, vUv).r;
#endif
}
