#pragma glslify: updateFragmentDepth = require('../../base/updateFragmentDepth.glsl')
#pragma glslify: updateFragmentColor = require('../../base/updateFragmentColor.glsl')
#pragma glslify: import('../../math/constants.glsl')

varying float v_oneMinusThicknessSqr;
varying vec2 v_xy;
varying float v_angle;
varying float v_arcAngle;

varying float v_treeIndex;
varying vec3 v_color;
varying vec3 v_normal;

uniform int renderMode;

void main() {
    float dist = dot(v_xy, v_xy);
    float theta = atan(v_xy.y, v_xy.x);
    vec3 normal = normalize( v_normal );
    if (theta < v_angle) {
        theta += 2.0 * PI;
    }
    if (dist > 0.25 || dist < 0.25 * v_oneMinusThicknessSqr || theta >= v_angle + v_arcAngle) {
        discard;
    }

    updateFragmentColor(renderMode, v_color, v_treeIndex, normal);
}
