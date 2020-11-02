#pragma glslify: determineMatrixOverride = require('../base/determineMatrixOverride.glsl')
#pragma glslify: determineVisibility = require('../base/determineVisibility.glsl');
#pragma glslify: CULL_VERTEX = require('../base/cullVertex.glsl');

uniform mat4 inverseModelMatrix;

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

uniform vec2 treeIndexTextureSize;
uniform sampler2D colorDataTexture;
uniform sampler2D transformOverrideIndexTexture;
uniform vec2 transformOverrideTextureSize; 
uniform sampler2D transformOverrideTexture;

uniform int renderMode;

void main() {
    if (!determineVisibility(colorDataTexture, treeIndexTextureSize, treeIndex, renderMode)) {
      gl_Position = CULL_VERTEX;
      return;
    }

    mat4 treeIndexWorldTransform = determineMatrixOverride(
      treeIndex, 
      treeIndexTextureSize, 
      transformOverrideIndexTexture, 
      transformOverrideTextureSize, 
      transformOverrideTexture
    );

    v_treeIndex = treeIndex;
    v_color = color;
    v_normal = normalize(normalMatrix * (inverseModelMatrix * treeIndexWorldTransform * modelMatrix * vec4(normalize(normal), 0.0)).xyz);
    mat4 instanceMatrix = mat4(matrix0, matrix1, matrix2, matrix3);
    vec3 transformed = (instanceMatrix * vec4(position, 1.0)).xyz;
    vec4 mvPosition = viewMatrix * treeIndexWorldTransform * modelMatrix * vec4( transformed, 1.0 );
    vViewPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
