// TODO consider passing vec3 from a matrix3x4 to reduce memory usage and data transfer
// TODO consider fixing Three.js so it is possible to pass a mat4:
// see https://stackoverflow.com/questions/38853096/webgl-how-to-bind-values-to-a-mat4-attribute

mat4 constructMatrix(vec4 column_0, vec4 column_1, vec4 column_2, vec4 column_3) {
  return mat4(
    column_0,
    column_1,
    column_2,
    column_3
  );
}

#pragma glslify: export(constructMatrix)
