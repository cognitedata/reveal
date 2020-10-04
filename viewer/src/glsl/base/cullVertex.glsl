// A vertex placed at "infinity" so it is culled before the fragment stage
const highp vec4 CULL_VERTEX = vec4(vec3(1.0 / 1e-8), 1.0);

#pragma glslify: export(CULL_VERTEX)
