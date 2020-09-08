#pragma glslify: determineMatrixOverride = require('../../base/determineMatrixOverride.glsl')

attribute float a_treeIndex;
attribute vec3 a_color;
attribute vec3 a_vertex1;
attribute vec3 a_vertex2;
attribute vec3 a_vertex3;
attribute vec3 a_vertex4;

varying float v_treeIndex;
varying vec3 v_color;
varying vec3 v_normal;

varying vec3 vViewPosition;

uniform vec2 dataTextureSize;

uniform sampler2D matrixTransformTexture;

void main() {
    vec3 transformed;
    // reduce the avarage branchings
    if (position.x < 1.5) {
      transformed = position.x == 0.0 ? a_vertex1 : a_vertex2;
    } else {
      transformed = position.x == 2.0 ? a_vertex3 : a_vertex4;
    }

    vec3 objectNormal = cross(a_vertex1 - a_vertex2, a_vertex1 - a_vertex3);

    v_treeIndex = a_treeIndex;
    v_color = a_color;
    v_normal = normalMatrix * objectNormal;

    float treeIndex = floor(a_treeIndex + 0.5);
    float dataTextureWidth = dataTextureSize.x;
    float dataTextureHeight = dataTextureSize.y;

    mat4 treeIndexWorldTransform = determineMatrixOverride(treeIndex, dataTextureWidth, dataTextureHeight, matrixTransformTexture);

    vec4 mvPosition = viewMatrix * treeIndexWorldTransform * modelMatrix * vec4( transformed, 1.0 );
    vViewPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
