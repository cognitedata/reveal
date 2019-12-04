#pragma glslify: constructMatrix = require('../../base/constructMatrix.glsl')

attribute vec4 a_instanceMatrix_column_0;
attribute vec4 a_instanceMatrix_column_1;
attribute vec4 a_instanceMatrix_column_2;
attribute vec4 a_instanceMatrix_column_3;

attribute vec3 a_color;
attribute float a_arcAngle;
attribute float a_radius;
attribute float a_tubeRadius;

varying vec3 v_color;
varying vec3 v_normal;

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
#if !defined(FLAT_SHADED) && !defined(COGNITE_RENDER_COLOR_ID) && !defined(COGNITE_RENDER_DEPTH)
    vec3 center = vec3(a_radius * cosTheta, a_radius * sinTheta, 0.0);
    vec3 objectNormal = normalize(pos3 - center);
#endif

    // START NEW CODE
    v_color = a_color;
    v_normal = normalMatrix * objectNormal;

    vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}
