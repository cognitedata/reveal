precision highp float;

#include ../../base/updateFragmentColor.glsl;
#include ../../base/nodeAppearance.glsl;
#include ../../base/determineNodeAppearance.glsl;
#include ../../base/determineColor.glsl;
#include ../../base/isClipped.glsl;
#include ../../treeIndex/treeIndexPacking.glsl;

uniform sampler2D matCapTexture;
uniform lowp int renderMode;
uniform mat4 modelViewMatrix;

in vec2 v_xy;
in vec3 v_color;
in vec3 v_normal;
in vec3 vViewPosition;
in vec4 v_nodeAppearanceTexel;

in highp vec2  v_treeIndexPacked;

void main()
{
    highp float v_treeIndex = unpackTreeIndex(v_treeIndexPacked);
    float dist = dot(v_xy, v_xy);
    vec3 normal = normalize( v_normal );
    if (dist > 0.25)
      discard;

    NodeAppearance appearance = nodeAppearanceFromTexel(v_nodeAppearanceTexel);
    if (isClipped(vViewPosition)) {
        discard;
    }

    vec4 color = determineColor(v_color, appearance);

    // This is a flat, double-sided primitive (a disc endcap) with a single authored
    // normal. Orient it to the side actually being viewed so PBR lighting shades the
    // visible face rather than the hidden one. gl_FrontFacing is constant across a
    // planar primitive, so - unlike flipping against the per-fragment view ray - this
    // does not create a hard lit/dark seam at grazing angles. Only the world-space
    // (PBR) normal is flipped; the raw `normal` passed on keeps the legacy matcap path
    // and the normal/debug render modes identical to before.
    vec3 shadingNormal = gl_FrontFacing ? normal : -normal;

    // Populate world-space lighting vectors (g_world*) so updateFragmentColor applies PBR.
    computeWorldSpaceVectors(shadingNormal, vViewPosition, modelViewMatrix);
    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z, matCapTexture, GeometryType.Primitive);
}
