precision highp float;

#define texture2D texture

#pragma glslify: NodeAppearance = require('../../base/nodeAppearance.glsl')
#pragma glslify: determineNodeAppearance = require('../../base/determineNodeAppearance.glsl');
#pragma glslify: determineVisibility = require('../../base/determineVisibility.glsl');
#pragma glslify: determineColor = require('../../base/determineColor.glsl');
#pragma glslify: updateFragmentColor = require('../../base/updateFragmentColor.glsl')
#pragma glslify: isClipped = require('../../base/isClipped.glsl', NUM_CLIPPING_PLANES=NUM_CLIPPING_PLANES, UNION_CLIPPING_PLANES=UNION_CLIPPING_PLANES)
#pragma glslify: import('../../math/constants.glsl')
#pragma glslify: GeometryType = require('../../base/geometryTypes.glsl');

uniform sampler2D colorDataTexture;
uniform sampler2D matCapTexture;
uniform vec2 treeIndexTextureSize;
uniform int renderMode;

in float v_oneMinusThicknessSqr;
in vec2 v_xy;
in float v_angle;
in float v_arcAngle;
in float v_treeIndex;
in vec3 v_color;
in vec3 v_normal;
in vec3 vViewPosition;

void main() {
    NodeAppearance appearance = determineNodeAppearance(colorDataTexture, treeIndexTextureSize, v_treeIndex);
    if (!determineVisibility(appearance, renderMode)) {
        discard;
    }

    if (isClipped(appearance, vViewPosition)) {
        discard;
    }

    vec4 color = determineColor(v_color, appearance);
    float dist = dot(v_xy, v_xy);
    float theta = atan(v_xy.y, v_xy.x);
    vec3 normal = normalize( v_normal );
    if (theta < v_angle) {
        theta += 2.0 * PI;
    }
    if (dist > 0.25 || dist < 0.25 * v_oneMinusThicknessSqr || theta >= v_angle + v_arcAngle) {
        discard;
    }

    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z, matCapTexture, GeometryType.Primitive);
}
