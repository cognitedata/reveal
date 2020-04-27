#pragma glslify: constructMatrix = require('../../base/constructMatrix.glsl')

attribute vec4 a_instanceMatrix_column_0;
attribute vec4 a_instanceMatrix_column_1;
attribute vec4 a_instanceMatrix_column_2;
attribute vec4 a_instanceMatrix_column_3;

attribute float a_treeIndex;
attribute vec3 a_color;

varying float v_treeIndex;
varying vec3 v_normal;
varying vec3 v_color;

#if NUM_CLIPPING_PLANES > 0
varying vec3 vViewPosition;
#endif

void main()
{
    mat4 instanceMatrix = constructMatrix(
        a_instanceMatrix_column_0,
        a_instanceMatrix_column_1,
        a_instanceMatrix_column_2,
        a_instanceMatrix_column_3
    );

    v_treeIndex = a_treeIndex;
    v_color = a_color;
    v_normal = normalMatrix * normalize(instanceMatrix * vec4(normalize(normal), 0.0)).xyz;

    vec3 transformed = (instanceMatrix * vec4(position, 1.0)).xyz;
    vec4 modelViewPosition = modelViewMatrix * vec4(transformed, 1.0);
#if NUM_CLIPPING_PLANES > 0
    vViewPosition = modelViewPosition.xyz;
#endif
    gl_Position = projectionMatrix * modelViewPosition;
}
