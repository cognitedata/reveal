#pragma glslify: import('../../base/updateFragmentColor.glsl')

varying vec3 v_normal;
varying vec3 v_color;

void main()
{
    vec3 normal = normalize(v_normal);
    updateFragmentColor(v_color, normal);
}
