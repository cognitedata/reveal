mat4 constructMatrix(vec4 column_0, vec4 column_1, vec4 column_2, vec4 column_3) {
  return mat4(
    vec4(column_0.xyz, 0.0),
    vec4(column_1.xyz, 0.0),
    vec4(column_2.xyz, 0.0),
    vec4(column_3.xyz, 1.0)
  );
}

#pragma glslify: export(constructMatrix)
