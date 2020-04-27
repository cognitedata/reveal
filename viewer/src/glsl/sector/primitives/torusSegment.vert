#pragma glslify: constructMatrix = require('../../base/constructMatrix.glsl')

attribute vec4 a_instanceMatrix_column_0;
attribute vec4 a_instanceMatrix_column_1;
attribute vec4 a_instanceMatrix_column_2;
attribute vec4 a_instanceMatrix_column_3;

attribute float a_treeIndex;
attribute vec3 a_color;
attribute float a_arcAngle;
attribute float a_radius;
attribute float a_tubeRadius;

varying float v_treeIndex;
varying vec3 v_color;
varying vec3 v_normal;

varying vec3 vViewPosition;

void main() {
    mat4 instanceMatrix = constructMatrix(
        a_instanceMatrix_column_0,
        a_instanceMatrix_column_1,
        a_instanceMatrix_column_2,
        a_instanceMatrix_column_3
    );
    // normalized theta and phi are packed into positions
    float theta = position.x * a_arcAngle;
    float phi = position.y;
    float cosTheta = cos(theta);
    float sinTheta = sin(theta);
    vec3 pos3 = vec3(0);

    pos3.x = (a_radius + a_tubeRadius*cos(phi)) * cosTheta;
    pos3.y = (a_radius + a_tubeRadius*cos(phi)) * sinTheta;
    pos3.z = a_tubeRadius*sin(phi);

    vec3 transformed = (instanceMatrix * vec4(pos3, 1.0)).xyz;

    // Calculate normal vectors if we're not picking
    vec3 center = (instanceMatrix * vec4(a_radius * cosTheta, a_radius * sinTheta, 0.0, 1.0)).xyz;
    vec3 objectNormal = normalize(transformed.xyz - center);

    v_treeIndex = a_treeIndex;
    v_color = a_color;
    v_normal = normalMatrix * objectNormal;

    vec4 modelViewPosition = modelViewMatrix * vec4(transformed, 1.0);

    vViewPosition = modelViewPosition.xyz;

    gl_Position = projectionMatrix * modelViewPosition;
}
