#pragma glslify: updateFragmentColor = require('../base/updateFragmentColor.glsl')

varying vec3 v_normal;
varying vec3 v_color;
varying vec3 v_viewPosition;

void main()
{
    vec3 fdx = vec3(dFdx(v_viewPosition.x), dFdx(v_viewPosition.y), dFdx(v_viewPosition.z));
    vec3 fdy = vec3(dFdy(v_viewPosition.x), dFdy(v_viewPosition.y), dFdy(v_viewPosition.z));
    vec3 normal = normalize(cross(fdx, fdy));
    updateFragmentColor(v_color, normal);
}
