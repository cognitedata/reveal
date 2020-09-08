#pragma glslify: constructMatrix = require('../../base/constructMatrix.glsl')
#pragma glslify: determineMatrixOverride = require('../../base/determineMatrixOverride.glsl')

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

varying vec3 vViewPosition;

uniform vec2 dataTextureSize;

uniform sampler2D matrixTransformTexture;

void main() {
    v_xy = vec2(position.x, position.y);
    v_treeIndex = a_treeIndex;

    mat4 instanceMatrix = constructMatrix(
        a_instanceMatrix_column_0,
        a_instanceMatrix_column_1,
        a_instanceMatrix_column_2,
        a_instanceMatrix_column_3
    );

    float treeIndex = floor(a_treeIndex + 0.5);
    float dataTextureWidth = dataTextureSize.x;
    float dataTextureHeight = dataTextureSize.y;

    mat4 treeIndexWorldTransform = determineMatrixOverride(treeIndex, dataTextureWidth, dataTextureHeight, matrixTransformTexture);

    vec3 transformed = (instanceMatrix * vec4(position, 1.0)).xyz;
    vec4 mvPosition = viewMatrix * treeIndexWorldTransform * modelMatrix * vec4( transformed, 1.0 );
    v_color = a_color;

    v_normal = normalMatrix * a_normal;
    vViewPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
