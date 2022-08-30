precision highp float;

#pragma glslify: import('../../base/updateFragmentColor.glsl')
#pragma glslify: import('../../base/nodeAppearance.glsl')
#pragma glslify: import('../../base/determineNodeAppearance.glsl');
#pragma glslify: import('../../base/determineVisibility.glsl');
#pragma glslify: import('../../base/determineColor.glsl');
#pragma glslify: import('../../base/isClipped.glsl')

uniform sampler2D colorDataTexture;
uniform sampler2D matCapTexture;
uniform vec2 treeIndexTextureSize;
uniform int renderMode;

flat in float v_treeIndex;
in vec2 v_xy;
in vec3 v_color;
in vec3 v_normal;
in vec3 vViewPosition;

void main() {
    float dist = dot(v_xy, v_xy);
    vec3 normal = normalize( v_normal );
    if (dist > 0.25)
      discard;

    NodeAppearance appearance = determineNodeAppearance(colorDataTexture, treeIndexTextureSize, v_treeIndex);
    if (!determineVisibility(appearance, renderMode)) {
        discard;
    }
    if (isClipped(appearance, vViewPosition)) {
        discard;
    }

    vec4 color = determineColor(v_color, appearance);
    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z, matCapTexture, GeometryType.Primitive);
}
