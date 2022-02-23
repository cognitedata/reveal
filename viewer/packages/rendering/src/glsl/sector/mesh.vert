#pragma glslify: determineMatrixOverride = require('../base/determineMatrixOverride.glsl')
#define texture2D texture

uniform mat4 inverseModelMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

in vec3 position;
in vec3 color;
in float treeIndex; 

out vec3 v_color;
out float v_treeIndex;
out vec3 v_viewPosition;

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
