precision highp float;

#include ../math/colorSpaceConversion.glsl;
#include ../math/derivateNormal.glsl;
#include ../base/updateFragmentColor.glsl;
#include ../base/nodeAppearance.glsl;
#include ../base/determineNodeAppearance.glsl;
#include ../base/determineColor.glsl;
#include ../base/isClipped.glsl;
#include ../treeIndex/treeIndexPacking.glsl;

uniform sampler2D matCapTexture;
uniform lowp int renderMode;

#if defined(IS_TEXTURED)

uniform sampler2D tDiffuse;
in vec2 v_uv;

#else // IS_TEXTURED

in vec3 v_color;

#endif // IS_TEXTURED

in vec3 v_viewPosition;
in vec4 v_nodeAppearanceTexel;

in highp vec2 v_treeIndexPacked;

void main()
{
    highp float v_treeIndex = unpackTreeIndex(v_treeIndexPacked);
    NodeAppearance appearance = nodeAppearanceFromTexel(v_nodeAppearanceTexel);
    if (isClipped(v_viewPosition)) {
        discard;
    }

#if defined(IS_TEXTURED)
    vec3 diffuseColor = texture(tDiffuse, v_uv).rgb;
    // Convert color to sRGB as the GLTF format texture are in sRGB. TODO: https://cognitedata.atlassian.net/browse/REV-826.
    diffuseColor = LinearTosRGB(vec4(diffuseColor, 1.0)).xyz;
    vec4 color = determineColor(diffuseColor, appearance);

    color = vec4(mix(diffuseColor, vec3(color), 0.6), color.a);
#else
    vec4 color = determineColor(v_color, appearance);
#endif

    vec3 normal = derivateNormal(v_viewPosition);
    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z, matCapTexture, GeometryType.TriangleMesh);
}
