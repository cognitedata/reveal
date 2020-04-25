#pragma glslify: packIntToColor = require('../color/packIntToColor.glsl')

attribute mediump float a_sectorId;
attribute lowp vec3 a_coverageFactor;

varying mediump vec3 v_color;
varying lowp float v_coverageFactor;
varying lowp vec2 v_seed;

void main()
{
    v_color = packIntToColor(a_sectorId);
    v_coverageFactor = abs(dot(a_coverageFactor, normal));
    // A seed to ensure that two overlapping sectors A and B 
    // doesn't produce the same noise pattern
    v_seed = vec2(a_sectorId / 255.0, a_sectorId / 65025.0);
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
