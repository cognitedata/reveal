#pragma glslify: constructMatrix = require('../../base/constructMatrix.glsl')
#pragma glslify: determineMatrixOverride = require('../../base/determineMatrixOverride.glsl')
#pragma glslify: determineVisibility = require('../../base/determineVisibility.glsl');
#pragma glslify: CULL_VERTEX = require('../../base/cullVertex.glsl');

uniform mat4 inverseModelMatrix;

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

uniform vec2 treeIndexTextureSize;

uniform sampler2D colorDataTexture;
uniform sampler2D transformOverrideIndexTexture;
uniform vec2 transformOverrideTextureSize; 
uniform sampler2D transformOverrideTexture;

uniform int renderMode;

void main() {
    if (!determineVisibility(colorDataTexture, treeIndexTextureSize, a_treeIndex, renderMode)) {
      gl_Position = CULL_VERTEX;
      return;
    }

    v_xy = vec2(position.x, position.y);
    v_treeIndex = a_treeIndex;

    mat4 instanceMatrix = constructMatrix(
        a_instanceMatrix_column_0,
        a_instanceMatrix_column_1,
        a_instanceMatrix_column_2,
        a_instanceMatrix_column_3
    );

    mat4 treeIndexWorldTransform = determineMatrixOverride(
      a_treeIndex, 
      treeIndexTextureSize, 
      transformOverrideIndexTexture, 
      transformOverrideTextureSize, 
      transformOverrideTexture
    );

    vec3 transformed = (instanceMatrix * vec4(position, 1.0)).xyz;
    vec4 mvPosition = viewMatrix * treeIndexWorldTransform * modelMatrix * vec4( transformed, 1.0 );
    v_color = a_color;

    v_normal = normalMatrix * normalize(inverseModelMatrix * treeIndexWorldTransform * modelMatrix * vec4(normalize(a_normal), 0.0)).xyz;
    vViewPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
