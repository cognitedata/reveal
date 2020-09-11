#pragma glslify: constructMatrix = require('../base/constructMatrix.glsl')
#pragma glslify: determineMatrixOverride = require('../base/determineMatrixOverride.glsl')

attribute vec4 a_instanceMatrix_column_0;
attribute vec4 a_instanceMatrix_column_1;
attribute vec4 a_instanceMatrix_column_2;
attribute vec4 a_instanceMatrix_column_3;

attribute float a_treeIndex;
attribute vec3 a_color;

varying float v_treeIndex;
varying vec3 v_color;
varying vec3 v_viewPosition;

uniform vec2 treeIndexTextureSize;

uniform sampler2D transformOverrideIndexTexture;

uniform vec2 transformOverrideTextureSize; 
uniform sampler2D transformOverrideTexture;

void main()
{
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

    v_color = a_color;

    vec3 transformed = (instanceMatrix * vec4(position, 1.0)).xyz;
    vec4 modelViewPosition = viewMatrix * treeIndexWorldTransform * modelMatrix * vec4(transformed, 1.0);
    v_viewPosition = modelViewPosition.xyz;
    v_treeIndex = a_treeIndex;
    gl_Position = projectionMatrix * modelViewPosition;
}
