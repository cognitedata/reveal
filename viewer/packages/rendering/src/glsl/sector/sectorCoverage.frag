precision highp float;

#pragma glslify: import('../math/rand2d.glsl')
#pragma glslify: import('../base/nodeAppearance.glsl')
#pragma glslify: import('../base/isClipped.glsl')

in mediump vec3 v_color;
in lowp float v_coverageFactor;
in lowp float v_visible;
in lowp vec2 v_seed;
in vec3 v_viewPosition;

out vec4 outputColor;

const NodeAppearance dummyNodeAppearance = NodeAppearance(vec4(0.0), false, false, false);

void main() {
    const float epsilon = 0.0001;
    bool visible =  abs(1.0 - v_visible) < epsilon;
    if(!visible || isClipped(dummyNodeAppearance, v_viewPosition)){
      discard;
    }

    float v = rand2d(gl_FragCoord.xy + v_seed);
    if (v >= v_coverageFactor) {
        discard;
    }

    outputColor = vec4(v_color, 1.0);
}
