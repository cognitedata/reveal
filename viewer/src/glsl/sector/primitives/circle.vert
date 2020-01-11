#pragma glslify: constructMatrix = require('../../base/constructMatrix.glsl')

attribute vec4 a_instanceMatrix_column_0;
attribute vec4 a_instanceMatrix_column_1;
attribute vec4 a_instanceMatrix_column_2;
attribute vec4 a_instanceMatrix_column_3;

attribute float a_treeIndex;
attribute vec3 a_color;
attribute vec3 a_normal;

varying vec2 v_xy;
varying vec3 v_color;
varying vec3 v_normal;
varying float v_treeIndex;

void main() {
    v_xy = vec2(position.x, position.y);
    v_treeIndex = v_treeIndex;

    mat4 instanceMatrix = constructMatrix(
        a_instanceMatrix_column_0,
        a_instanceMatrix_column_1,
        a_instanceMatrix_column_2,
        a_instanceMatrix_column_3
    );

    vec3 transformed = (instanceMatrix * vec4(position, 1.0)).xyz;
    vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
    v_color = a_color;

    v_normal = normalMatrix * a_normal;
    gl_Position = projectionMatrix * mvPosition;
}
