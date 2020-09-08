#pragma glslify: determineMatrixOverride = require('../base/determineMatrixOverride.glsl')

attribute vec3 color;
attribute float treeIndex;
attribute vec4 matrix0;
attribute vec4 matrix1;
attribute vec4 matrix2;
attribute vec4 matrix3;

varying float v_treeIndex;
varying vec3 v_color;
varying vec3 v_normal;

varying vec3 vViewPosition;

uniform vec2 dataTextureSize;

uniform sampler2D matrixTransformTexture;

void main() {
    float treeIndexRounded = floor(treeIndex + 0.5);
    float dataTextureWidth = dataTextureSize.x;
    float dataTextureHeight = dataTextureSize.y;

    mat4 treeIndexWorldTransform = determineMatrixOverride(treeIndexRounded, dataTextureWidth, dataTextureHeight, matrixTransformTexture);

    v_treeIndex = treeIndex;
    v_color = color;
    v_normal = normalMatrix * normal;
    mat4 instanceMatrix = mat4(matrix0, matrix1, matrix2, matrix3);
    vec3 transformed = (instanceMatrix * vec4(position, 1.0)).xyz;
    vec4 mvPosition = viewMatrix * treeIndexWorldTransform * modelMatrix * vec4( transformed, 1.0 );
    vViewPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
