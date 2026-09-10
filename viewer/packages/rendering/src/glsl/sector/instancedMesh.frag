precision highp float;

#include ../math/derivateNormal.glsl;
#include ../base/updateFragmentColor.glsl;
#include ../base/nodeAppearance.glsl;
#include ../base/determineNodeAppearance.glsl;
#include ../base/determineColor.glsl;
#include ../base/isClipped.glsl;
#include ../treeIndex/treeIndexPacking.glsl;

uniform sampler2D matCapTexture;
uniform lowp int renderMode;

in vec3 v_color;
in vec3 v_viewPosition;
in vec4 v_nodeAppearanceTexel;

in highp vec2 v_treeIndexPacked;

void main()
{
    highp float treeIndex = unpackTreeIndex(v_treeIndexPacked);
    NodeAppearance appearance = nodeAppearanceFromTexel(v_nodeAppearanceTexel);
    if (isClipped(v_viewPosition)) {
        discard;
    }

    vec4 color = determineColor(v_color, appearance);
    vec3 normal = derivateNormal(v_viewPosition);
    updateFragmentColor(renderMode, color, treeIndex, normal, gl_FragCoord.z, matCapTexture, GeometryType.InstancedMesh);
}
