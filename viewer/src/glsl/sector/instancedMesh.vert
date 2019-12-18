#pragma glslify: constructMatrix = require('../base/constructMatrix.glsl')

attribute vec4 a_instanceMatrix_column_0;
attribute vec4 a_instanceMatrix_column_1;
attribute vec4 a_instanceMatrix_column_2;
attribute vec4 a_instanceMatrix_column_3;

attribute vec3 a_color;

varying vec3 v_color;
varying vec3 v_viewPosition;

void main()
{
    mat4 instanceMatrix = constructMatrix(
        a_instanceMatrix_column_0,
        a_instanceMatrix_column_1,
        a_instanceMatrix_column_2,
        a_instanceMatrix_column_3
    );

    v_color = a_color;

    vec3 transformed = (instanceMatrix * vec4(position, 1.0)).xyz;
    vec4 modelViewPosition = modelViewMatrix * vec4(transformed, 1.0);
    v_viewPosition = modelViewPosition.xyz;
    gl_Position = projectionMatrix * modelViewPosition;
}
