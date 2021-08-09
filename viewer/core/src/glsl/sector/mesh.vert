#pragma glslify: determineMatrixOverride = require('../base/determineMatrixOverride.glsl')
attribute vec3 color;
attribute float treeIndex; 

varying vec3 v_color;
varying float v_treeIndex;
varying vec3 v_viewPosition;

uniform vec2 treeIndexTextureSize;
uniform sampler2D transformOverrideIndexTexture;

uniform vec2 transformOverrideTextureSize;
uniform sampler2D transformOverrideTexture;

void main() {
    v_color = color;
    v_treeIndex = treeIndex;

    mat4 treeIndexWorldTransform = determineMatrixOverride(
      treeIndex, 
      treeIndexTextureSize, 
      transformOverrideIndexTexture, 
      transformOverrideTextureSize, 
      transformOverrideTexture
    );

    vec4 modelViewPosition = viewMatrix * treeIndexWorldTransform * modelMatrix * vec4(position, 1.0);
    v_viewPosition = modelViewPosition.xyz;
    gl_Position = projectionMatrix * modelViewPosition;
}
