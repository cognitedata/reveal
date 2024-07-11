precision highp float;

#pragma glslify: import('../../base/nodeAppearance.glsl')
#pragma glslify: import('../../base/updateFragmentColor.glsl')
#pragma glslify: import('../../base/determineNodeAppearance.glsl');
#pragma glslify: import('../../base/determineColor.glsl');
#pragma glslify: import('../../base/isClipped.glsl');
#pragma glslify: import('../../treeIndex/treeIndexPacking.glsl');
#pragma glslify: import('../../math/constants.glsl')

uniform sampler2D colorDataTexture;
uniform sampler2D matCapTexture;
uniform vec2 treeIndexTextureSize;
uniform lowp int renderMode;

in float v_oneMinusThicknessSqr;
in vec2 v_xy;
in float v_angle;
in float v_arcAngle;
in vec3 v_color;
in vec3 v_normal;
in vec3 vViewPosition;

in highp vec2 v_treeIndexPacked;

void main()
{
    highp float v_treeIndex = unpackTreeIndex(v_treeIndexPacked);

    // Redo appearance texture lookup from vertex shader due to limit in transferable attributes
    NodeAppearance appearance = determineNodeAppearance(colorDataTexture, treeIndexTextureSize, v_treeIndex);

    if (isClipped(vViewPosition)) {
        discard;
    }

    vec4 color = determineColor(v_color, appearance);
    float dist = dot(v_xy, v_xy);
    float theta = atan(v_xy.y, v_xy.x);
    vec3 normal = normalize( v_normal );

    // Add a full arc to theta until it's larger than the base angle (a maximum of two iterations needed)
    theta += theta < v_angle ? 2.0 * PI : 0.0;
    theta += theta < v_angle ? 2.0 * PI : 0.0;

    if (dist > 0.25 || dist < 0.25 * v_oneMinusThicknessSqr || theta >= v_angle + v_arcAngle) {
        discard;
    }

    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z, matCapTexture, GeometryType.Primitive);
}
