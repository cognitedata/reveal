#pragma glslify: import('../base/determineMatrixOverride.glsl')
#pragma glslify: import('../treeIndex/treeIndexPacking.glsl')
#pragma glslify: import('../base/renderModes.glsl')
#pragma glslify: import('../base/nodeAppearance.glsl')
#pragma glslify: import('../base/determineNodeAppearance.glsl')
#pragma glslify: import('../base/determineVisibility.glsl')

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 treeIndexTextureSize;
uniform vec2 transformOverrideTextureSize;
uniform sampler2D transformOverrideIndexTexture;
uniform sampler2D transformOverrideTexture;
uniform sampler2D colorDataTexture;
uniform lowp int renderMode;

in vec3 position;
in vec3 color;
in float treeIndex;

out vec3 v_color;
out vec3 v_viewPosition;
out highp vec2 v_treeIndexPacked;

void main() {
    NodeAppearance appearance = determineNodeAppearance(colorDataTexture, treeIndexTextureSize, treeIndex);
    if (!determineVisibility(appearance, renderMode)) {
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // Will be clipped
        return;
    }

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
