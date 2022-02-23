#pragma glslify: determineMatrixOverride = require('../../base/determineMatrixOverride.glsl')

#define texture2D texture

uniform mat4 inverseModelMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

in vec3 position;
in vec3 normal;
in mat4 a_instanceMatrix;

in float a_treeIndex;
in vec3 a_color;

out float v_treeIndex;
out vec3 v_normal;
out vec3 v_color;

out vec3 vViewPosition;

uniform vec2 treeIndexTextureSize;
uniform sampler2D transformOverrideIndexTexture;

uniform vec2 transformOverrideTextureSize;
uniform sampler2D transformOverrideTexture;

void main()
{
    mat4 treeIndexWorldTransform = determineMatrixOverride(
      a_treeIndex, 
      treeIndexTextureSize, 
      transformOverrideIndexTexture, 
      transformOverrideTextureSize, 
      transformOverrideTexture
    );

    v_treeIndex = a_treeIndex;
    v_color = a_color;
    v_normal = normalMatrix * normalize(inverseModelMatrix * treeIndexWorldTransform * modelMatrix * a_instanceMatrix * vec4(normalize(normal), 0.0)).xyz;
    //v_normal = normal;

    vec3 transformed = (a_instanceMatrix * vec4(position, 1.0)).xyz;
    vec4 modelViewPosition = viewMatrix * treeIndexWorldTransform * modelMatrix * vec4(transformed, 1.0);
    vViewPosition = modelViewPosition.xyz;
    gl_Position = projectionMatrix * modelViewPosition;
}