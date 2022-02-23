#pragma glslify: packIntToColor = require('../color/packIntToColor.glsl')

in mediump float a_sectorId;
in lowp vec3 a_coverageFactor;
in lowp float a_visible;

out mediump vec3 v_color;
out lowp float v_coverageFactor;
out lowp vec2 v_seed;
out lowp float v_visible;
out vec3 v_viewPosition;

void main()
{
    v_visible = a_visible;
    v_color = packIntToColor(a_sectorId);
    v_coverageFactor = abs(dot(a_coverageFactor, normal));
    // A seed to ensure that two overlapping sectors A and B 
    // doesn't produce the same noise pattern
    v_seed = vec2(a_sectorId / 255.0, a_sectorId / 65025.0);

    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4( position, 1.0 );

    v_viewPosition = mvPosition.xyz;

    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
