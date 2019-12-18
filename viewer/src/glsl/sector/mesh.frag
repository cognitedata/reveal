#pragma glslify: updateFragmentColor = require('../base/updateFragmentColor.glsl')
#pragma glslify: derivateNormal = require('../math/derivateNormal.glsl')

varying vec3 v_normal;
varying vec3 v_color;
varying vec3 v_viewPosition;

void main()
{
    vec3 normal = derivateNormal(v_viewPosition);
    updateFragmentColor(v_color, normal);
}
