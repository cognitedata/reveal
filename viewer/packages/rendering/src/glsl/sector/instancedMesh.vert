#pragma glslify: import('../base/determineMatrixOverride.glsl')
#pragma glslify: import('../treeIndex/treeIndexPacking.glsl')

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 treeIndexTextureSize;
uniform vec2 transformOverrideTextureSize;
uniform sampler2D transformOverrideIndexTexture;
uniform sampler2D transformOverrideTexture;

in vec3 position;
in mat4 a_instanceMatrix;
in float a_treeIndex;
in vec3 a_color;

out vec3 v_color;
out vec3 v_viewPosition;

out highp vec2 v_treeIndexPacked;

void main() {
    v_treeIndexPacked = packTreeIndex(a_treeIndex);

    mat4 treeIndexWorldTransform = determineMatrixOverride(
      a_treeIndex,
      treeIndexTextureSize,
      transformOverrideIndexTexture,
      transformOverrideTextureSize,
      transformOverrideTexture
    );

    v_color = a_color;

    vec3 transformed = (a_instanceMatrix * vec4(position, 1.0)).xyz;
    vec4 modelViewPosition = viewMatrix * treeIndexWorldTransform * modelMatrix * vec4(transformed, 1.0);
    v_viewPosition = modelViewPosition.xyz;
    gl_Position = projectionMatrix * modelViewPosition;
}
