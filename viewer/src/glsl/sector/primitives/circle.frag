#pragma glslify: updateFragmentColor = require('../../base/updateFragmentColor.glsl')

varying vec2 v_xy;

varying vec3 v_color;
varying vec3 v_normal;

void main() {
    float dist = dot(v_xy, v_xy);
    vec3 normal = normalize( v_normal );
    if (dist > 0.25)
      discard;

    updateFragmentColor(v_color, normal);
}
