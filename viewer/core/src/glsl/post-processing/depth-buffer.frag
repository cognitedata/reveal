uniform sampler2D tDepth;

varying vec2 v_uv;

void main() {
  gl_FragColor = texture2D(tDepth, v_uv);
}
