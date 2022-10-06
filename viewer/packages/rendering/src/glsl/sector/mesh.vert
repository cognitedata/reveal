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
in vec3 color;
in float treeIndex;

out vec3 v_color;
out vec3 v_viewPosition;
out TreeIndexPacked v_treeIndexPacked;
out mediump float v_treeIndexSubHundreds;

void main() {
    v_treeIndexPacked = packTreeIndex(treeIndex);
    v_color = color;

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
