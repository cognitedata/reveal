#pragma glslify: import('../base/determineMatrixOverride.glsl')
#pragma glslify: import('../treeIndex/treeIndexPacking.glsl')
#pragma glslify: import('../base/renderModes.glsl')
#pragma glslify: import('../base/nodeAppearance.glsl')
#pragma glslify: import('../base/determineNodeAppearance.glsl')
#pragma glslify: import('../base/determineVisibility.glsl')

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 treeIndexTextureSize;
uniform vec2 transformOverrideTextureSize;
uniform sampler2D transformOverrideIndexTexture;
uniform sampler2D transformOverrideTexture;
uniform sampler2D colorDataTexture;
uniform lowp int renderMode;

#if defined(IS_TEXTURED)
in vec2 uv;
#else
in vec3 color;
#endif

in vec3 position;
in float treeIndex;

out vec3 v_viewPosition;
out vec4 v_nodeAppearanceTexel;

#if defined(IS_TEXTURED)
out vec2 v_uv;
#else
out vec3 v_color;
#endif

out highp vec2 v_treeIndexPacked;

void main() {
    NodeAppearance appearance = determineNodeAppearance(colorDataTexture, treeIndexTextureSize, treeIndex);
    if (!determineVisibility(appearance, renderMode)) {
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // Will be clipped
        return;
    }

    v_nodeAppearanceTexel = appearance.colorTexel;
    v_treeIndexPacked = packTreeIndex(treeIndex);

    mat4 treeIndexWorldTransform = determineMatrixOverride(
      treeIndex,
      treeIndexTextureSize,
      transformOverrideIndexTexture,
      transformOverrideTextureSize,
      transformOverrideTexture
    );

    vec4 modelViewPosition = modelViewMatrix * treeIndexWorldTransform * vec4(position, 1.0);
    v_viewPosition = modelViewPosition.xyz;

#if defined(IS_TEXTURED)
    v_uv = uv;
#else
    v_color = color;
#endif

    gl_Position = projectionMatrix * modelViewPosition;
}
