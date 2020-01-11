#pragma glslify: constructMatrix = require('../../base/constructMatrix.glsl')

attribute vec4 a_instanceMatrix_column_0;
attribute vec4 a_instanceMatrix_column_1;
attribute vec4 a_instanceMatrix_column_2;
attribute vec4 a_instanceMatrix_column_3;

attribute vec3 a_color;

varying float v_treeIndex;
varying vec3 v_normal;
varying vec3 v_color;

void main()
{
    mat4 instanceMatrix = constructMatrix(
        a_instanceMatrix_column_0,
        a_instanceMatrix_column_1,
        a_instanceMatrix_column_2,
        a_instanceMatrix_column_3
    );

    // TODO 20200111 larsmoa: Implement treeIndex for quads.
    v_treeIndex = 255.0*255.0*255.0;
    v_color = a_color;
    v_normal = normalMatrix * normalize(instanceMatrix * vec4(normalize(normal), 0.0)).xyz;

    vec3 transformed = (instanceMatrix * vec4(position, 1.0)).xyz;
    vec4 modelViewPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
}
