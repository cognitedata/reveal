vec3 mul3(mat4 M, vec3 v) {
  vec4 u = M * vec4(v, 1.0);
  return u.xyz / u.w;
}
#pragma glslify: export(mul3)
