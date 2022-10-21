precision highp float;

#pragma glslify: import('../math/derivateNormal.glsl')
#pragma glslify: import('../base/updateFragmentColor.glsl')
#pragma glslify: import('../base/nodeAppearance.glsl')
#pragma glslify: import('../base/determineNodeAppearance.glsl');
#pragma glslify: import('../base/determineVisibility.glsl');
#pragma glslify: import('../base/determineColor.glsl');
#pragma glslify: import('../base/isClipped.glsl')
#pragma glslify: import('../treeIndex/treeIndexPacking.glsl')

uniform sampler2D colorDataTexture;
uniform sampler2D matCapTexture;
uniform vec2 treeIndexTextureSize;
uniform int renderMode;

in vec3 v_color;
in vec3 v_viewPosition;
in highp vec2 v_treeIndexPacked;

void main()
{
    highp float treeIndex = unpackTreeIndex(v_treeIndexPacked);
    NodeAppearance appearance = determineNodeAppearance(colorDataTexture, treeIndexTextureSize, treeIndex);
    if (!determineVisibility(appearance, renderMode)) {
        discard;
    }

    if (isClipped(appearance, v_viewPosition)) {
        discard;
    }

    vec4 color = determineColor(v_color, appearance);
    vec3 normal = derivateNormal(v_viewPosition);
    updateFragmentColor(renderMode, color, treeIndex, normal, gl_FragCoord.z, matCapTexture, GeometryType.InstancedMesh);
}
