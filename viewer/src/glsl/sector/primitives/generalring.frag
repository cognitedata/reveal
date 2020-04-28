#pragma glslify: updateFragmentDepth = require('../../base/updateFragmentDepth.glsl')
#pragma glslify: determineVisibility = require('../../base/determineVisibility.glsl');
#pragma glslify: updateFragmentColor = require('../../base/updateFragmentColor.glsl')
#pragma glslify: isSliced = require('../../base/isSliced.glsl', NUM_CLIPPING_PLANES=NUM_CLIPPING_PLANES, UNION_CLIPPING_PLANES=UNION_CLIPPING_PLANES)
#pragma glslify: import('../../math/constants.glsl')
#pragma glslify: determineColor = require('../../base/determineColor.glsl');

varying float v_oneMinusThicknessSqr;
varying vec2 v_xy;
varying float v_angle;
varying float v_arcAngle;

varying float v_treeIndex;
varying vec3 v_color;
varying vec3 v_normal;

uniform sampler2D colorDataTexture;
uniform sampler2D overrideVisibilityPerTreeIndex;
uniform sampler2D matCapTexture;

uniform vec2 dataTextureSize;

uniform int renderMode;

varying vec3 vViewPosition;

void main() {
    if (!determineVisibility(overrideVisibilityPerTreeIndex, dataTextureSize, v_treeIndex)) {
        discard;
    }

    if (isSliced(vViewPosition)) {
        discard;
    }

    vec3 color = determineColor(v_color, colorDataTexture, dataTextureSize, v_treeIndex);
    float dist = dot(v_xy, v_xy);
    float theta = atan(v_xy.y, v_xy.x);
    vec3 normal = normalize( v_normal );
    if (theta < v_angle) {
        theta += 2.0 * PI;
    }
    if (dist > 0.25 || dist < 0.25 * v_oneMinusThicknessSqr || theta >= v_angle + v_arcAngle) {
        discard;
    }

    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z, matCapTexture);
}
