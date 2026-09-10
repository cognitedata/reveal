precision highp float;

#include ../../base/updateFragmentColor.glsl;
#include ../../base/nodeAppearance.glsl;
#include ../../base/determineNodeAppearance.glsl;
#include ../../base/determineColor.glsl;
#include ../../base/isClipped.glsl;
#include ../../treeIndex/treeIndexPacking.glsl;

uniform sampler2D matCapTexture;
uniform lowp int renderMode;

in vec3 v_color;
in vec3 v_normal;
in vec3 vViewPosition;
in vec4 v_nodeAppearanceTexel;

in highp vec2 v_treeIndexPacked;

void main()
{
    highp float v_treeIndex = unpackTreeIndex(v_treeIndexPacked);
    NodeAppearance appearance = nodeAppearanceFromTexel(v_nodeAppearanceTexel);
    if (isClipped(vViewPosition)) {
        discard;
    }

    vec4 color = determineColor(v_color, appearance);
    vec3 normal = normalize(v_normal);
    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z, matCapTexture, GeometryType.Primitive);
}
