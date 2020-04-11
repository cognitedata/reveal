#pragma glslify: packIntToColor = require('../color/packIntToColor.glsl')

attribute highp float a_sectorId;
attribute lowp vec3 a_coverageFactor;

varying highp vec3 v_color;
varying lowp float v_coverageFactor;
varying lowp vec4 v_position;
varying lowp vec2 v_seed;

void main()
{
    v_color = packIntToColor(a_sectorId);
    v_coverageFactor = abs(dot(a_coverageFactor, normal));
    v_seed = vec2(a_sectorId, a_sectorId*a_sectorId);
    v_position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    gl_Position = v_position;
}
