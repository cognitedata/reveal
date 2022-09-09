#pragma glslify: import('../base/determineMatrixOverride.glsl')

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 treeIndexTextureSize;
uniform vec2 transformOverrideTextureSize;
uniform sampler2D transformOverrideIndexTexture;
uniform sampler2D transformOverrideTexture;

in vec3 position;
in vec3 color;
in float treeIndex;

out vec3 v_color;
// Note! Not marked as flat as this makes performance on iOS horrible
flat out int v_treeIndex;
out vec3 v_viewPosition;

void main() {
    v_color = color;
    v_treeIndex = int(treeIndex);

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
