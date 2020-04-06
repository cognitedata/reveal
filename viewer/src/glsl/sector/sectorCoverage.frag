#pragma glslify: rand2d = require('../math/rand2d.glsl')

varying highp vec3 v_color;
varying lowp float v_coverageFactor;
varying lowp vec4 v_position;
varying lowp vec2 v_seed;


void main() {
    float v = rand2d(gl_FragCoord.xy + v_seed);
    if (v > v_coverageFactor) {
        discard;
    }

    gl_FragColor = vec4(v_color, pow(v_position.z / v_position.w, 10.0)); // Ghetto-linearization of the depth
}
