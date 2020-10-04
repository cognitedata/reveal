#pragma glslify: determineMatrixOverride = require('../base/determineMatrixOverride.glsl')
#pragma glslify: determineVisibility = require('../base/determineVisibility.glsl');
#pragma glslify: CULL_VERTEX = require('../base/cullVertex.glsl');

attribute vec3 color;
attribute float treeIndex; 

varying vec3 v_color;
varying float v_treeIndex;
varying vec3 v_viewPosition;

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
