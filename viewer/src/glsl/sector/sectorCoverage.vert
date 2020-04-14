#pragma glslify: packIntToColor = require('../color/packIntToColor.glsl')

attribute mediump float a_sectorId;
attribute lowp vec3 a_coverageFactor;
attribute lowp float a_depth;

varying mediump vec3 v_color;
varying lowp float v_coverageFactor;
varying lowp vec4 v_position;
varying lowp vec2 v_seed;

void main()
{
    v_color = packIntToColor(a_sectorId);
    v_coverageFactor = abs(dot(a_coverageFactor, normal));
    v_seed = vec2(a_sectorId / 255.0, a_sectorId / 255.0);
    v_position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    v_position = v_position + vec4(0.0, 0.0, 0.0, a_depth);
    gl_Position = v_position;
}
