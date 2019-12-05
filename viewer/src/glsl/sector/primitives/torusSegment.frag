#pragma glslify: updateFragmentColor = require('../../base/updateFragmentColor.glsl')

varying vec3 v_color;
varying vec3 v_normal;

void main() {
    vec3 normal = normalize(v_normal);

    updateFragmentColor(v_color, normal);
}
