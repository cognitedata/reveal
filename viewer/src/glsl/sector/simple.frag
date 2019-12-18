#pragma glslify: updateFragmentColor = require('../base/updateFragmentColor.glsl')

varying vec3 v_color;
varying vec3 v_normal;


void main() {
    updateFragmentColor(v_color, v_normal);
}