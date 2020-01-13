#pragma glslify: updateFragmentColor = require('../base/updateFragmentColor.glsl')

varying float v_treeIndex;
varying vec3 v_color;
varying vec3 v_normal;

void main() {
    updateFragmentColor(v_color, v_treeIndex, v_normal);
}