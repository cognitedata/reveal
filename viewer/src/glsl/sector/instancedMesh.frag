#pragma glslify: derivateNormal = require('../math/derivateNormal.glsl')
#pragma glslify: updateFragmentColor = require('../base/updateFragmentColor.glsl')

varying float v_treeIndex;
varying vec3 v_color;
varying vec3 v_viewPosition;

uniform int renderType;

void main() {
    vec3 normal = derivateNormal(v_viewPosition);
    updateFragmentColor(renderType, v_color, v_treeIndex, normal);
}
