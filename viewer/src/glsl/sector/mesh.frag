#pragma glslify: updateFragmentColor = require('../base/updateFragmentColor.glsl')
// #pragma glslify: debugUpdateFragmentColorByTreeIndex = require('../base/debugUpdateFragmentColorByTreeIndex.glsl')
#pragma glslify: derivateNormal = require('../math/derivateNormal.glsl')

varying vec3 v_color;
// varying float v_treeIndex;
varying vec3 v_viewPosition;

void main()
{
    vec3 normal = derivateNormal(v_viewPosition);
    updateFragmentColor(v_color, normal);
    // debugUpdateFragmentColorByTreeIndex(v_treeIndex, normal);
}
