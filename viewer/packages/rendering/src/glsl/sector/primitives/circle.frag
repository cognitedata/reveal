precision highp float;

#pragma glslify: import('../../base/updateFragmentColor.glsl')
#pragma glslify: import('../../base/nodeAppearance.glsl')
#pragma glslify: import('../../base/determineNodeAppearance.glsl');
#pragma glslify: import('../../base/determineColor.glsl');
#pragma glslify: import('../../base/isClipped.glsl');
#pragma glslify: import('../../treeIndex/treeIndexPacking.glsl');

uniform sampler2D matCapTexture;
uniform lowp int renderMode;

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
    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z, matCapTexture, GeometryType.Primitive);
}
